import db from "../config/db";

export const reservationService = {
  async createReservation(userId: number, eventId: number, seatIds: number[]) {
    // 좌석이 1A 이런식이면 string으로 받아야 하는거 아닐까?
    return await db.$transaction(async (tx) => {
      // 1. 좌석 상태 확인
      const seats = await tx.seats.findMany({
        where: {
          id: { in: seatIds },
          eventId,
          status: "available",
        },
      });

      if (seats.length !== seatIds.length) {
        throw new Error("Some seats are already reserved or solds.");
      }

      // 2. 예매 생성
      const reservation = await tx.reservations.create({
        data: {
          userId,
          eventId,
          seat: {
            connect: seatIds.map((id) => ({ id: Number(id) })),
          },
        },
      });

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
          seat: true,
        },
      });
      return updatedReservation;
    });
  },
};
