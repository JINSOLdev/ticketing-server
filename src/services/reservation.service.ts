import db from "../config/db";

export const reservationService = {
  async createReservation(
    user_id: number,
    event_id: number,
    seat_ids: number[]
  ) {
    return await db.$transaction(async (tx) => {
      // 1. 좌석들을 FOR UPDATE로 잠금
      // 모든 작업이 트랜잭션(tx) 안에서 진행되기 때문에, 중간에 실패하면 전체가 롤백됨
      // 예약 도중 누락, 중복, 상태 꼬임이 발생하지 않게 보호하는 구조임

      // 예약하려는 좌석들을 행 수준 잠금(FOR UPDATE)으로 잠가서
      // 다른 트랜잭션이 이 좌석을 동시에 수정할 수 없게 만듦 (이선좌)
      // 트랜잭션이 끝날 때까지 이 좌석들은 "내가 확인/수정 중" 상태가 됨
      const lockedSeats = await tx.$queryRawUnsafe<
        { id: number; status: string }[]
      >(
        `
        SELECT id, status FROM seats                  
        WHERE id = ANY($1) AND event_id = $2          
        FOR UPDATE                                    
        `, // 이 쿼리가 동시성의 핵심!!
        seat_ids,
        event_id
      );

      console.log("lockedSeats 결과:", lockedSeats);

      if (lockedSeats.length !== seat_ids.length) {
        // 예약 요청한 좌석 수와 실제 DB에 조회된 수가 다르면 누락된 거니까 예외 발생
        throw new Error("좌석 정보가 일치하지 않습니다");
      }

      // 2. 상태 확인 (available 아니면 실패)
      const unavailable = lockedSeats.filter(
        // 좌석 상태가 available이 아닌 게 하나라도 있으면 전체 예약 거절
        (seat) => seat.status !== "available" // 이 시점에는 좌석이 잠긴 상태이기 때문에, 확인하는 값이 정확하고 믿을 수 있음
      );
      if (unavailable.length > 0) {
        throw new Error("이미 예약된 좌석이 있습니다");
      }

      // 3. 예매 생성
      const reservation = await tx.reservations.create({
        // reservations 테이블에 새 예매 정보를 생성, 이 예매는 아직 좌석 정보와 연결되지 않음
        data: {
          user_id,
          event_id,
        },
      });

      // 4. 좌석 연결
      await Promise.all(
        // reservation_seats 테이블을 통해 예매와 좌석을 연결
        seat_ids.map(
          (
            seat_id // 다대다 관계에서 중간 테이블 역할
          ) =>
            tx.reservation_seats.create({
              // 여러 좌석을 동시에 예약할 수 있는 구조임
              data: {
                reservation_id: reservation.id,
                seat_id,
              },
            })
        )
      );

      // 5. 좌석 상태 변경
      await tx.seats.updateMany({
        // 예약 완료된 좌석의 상태를 sold로 업데이트
        where: {
          id: { in: seat_ids },
        },
        data: {
          status: "sold", // 이후엔 다시 예매할 수 없음
        },
      });

      // 6. 결과 반환
      const updatedReservation = await tx.reservations.findUnique({
        // 방금 생성한 예매 정보 + 연결된 좌석 정보까지 포함해서 반환, 프론트엔드에서 예매 내역 보여줄 때 사용 가능
        where: { id: reservation.id },
        include: {
          reservation_seats: {
            include: {
              seats: {
                select: {
                  id: true,
                  seat_number: true,
                },
              },
            },
          },
        },
      });

      return updatedReservation;
    });
  },
};

export const getAvailableSeatsService = async (event_id: number) => {
  const event = await db.events.findUnique({
    where: { id: event_id },
    include: {
      seats: {
        where: { status: "available" },
        orderBy: {
          seat_number: "asc",
        },
        select: {
          id: true,
          seat_number: true,              // 좌석 번호 추가
        },
      },
    },
  });

  if (!event) {
    throw new Error("해당 이벤트 찾을 수 없음");
  }
  return event.seats;
};
