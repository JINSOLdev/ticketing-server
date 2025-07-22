import db from "../config/db";

export const reservationService = {
  async createReservation(
    user_id: number,
    event_id: number,
    seatIds: number[]
  ) {
    // 좌석이 1A 이런식이면 string으로 받아야 하는거 아닐까?
    return await db.$transaction(async (tx) => {
      // 1. 좌석 상태 확인
      const seats = await tx.seats.findMany({
        where: {
          id: { in: seatIds },
          event_id,
          status: "available",
        },
      });

      if (seats.length !== seatIds.length) {
        throw new Error("Some seats are already reserved or solds.");
      }

      // 2. 예매 생성
      const reservation = await tx.reservations.create({
        data: {
          user_id,
          event_id,
        },
      });

      // 2. 중간 테이블에 좌석 연결
      await Promise.all(
        seatIds.map((seat_id) =>
          tx.reservation_seats.create({
            data: {
              reservation_id: reservation.id,
              seat_id,
            },
          })
        )
      );

      // 3. 좌석 상태 변경
      await tx.seats.updateMany({
        where: {
          id: { in: seatIds },
        },
        data: {
          status: "sold",
        },
      });
      // 예매 + 좌석 상태 반영 후 최신 데이터 다시 가져오기
      const updatedReservation = await tx.reservations.findUnique({
        where: { id: reservation.id },
        include: {
          reservation_seats: true,
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
          seat_number: true,
        },
      },
    },
  });

  if (!event) {
    throw new Error("해당 이벤트 찾을 수 없음");
  }
  return event.seats;
};
