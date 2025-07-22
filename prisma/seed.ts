import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. 유저 생성
  const users = await prisma.users.createMany({
    data: [
      { email: "alice@example.com" },
      { email: "bob@example.com" },
      { email: "charlie@example.com" },
    ],
  });

  // 2. 이벤트 생성
  const event1 = await prisma.events.create({
    data: {
      title: "Spring Concert",
      start_time: new Date("2025-08-01T19:00:00"),
      end_time: new Date("2025-08-01T21:00:00"),
    },
  });

  const event2 = await prisma.events.create({
    data: {
      title: "Summer Play",
      start_time: new Date("2025-08-05T14:00:00"),
      end_time: new Date("2025-08-05T16:00:00"),
    },
  });

  // 3. 좌석 생성 (각 이벤트당 A1~A10)
  const seatNumbers = Array.from({ length: 10 }, (_, i) => `A${i + 1}`);

  const seatsEvent1 = await Promise.all(
    seatNumbers.map((seat_number) =>
      prisma.seats.create({
        data: {
          event_id: event1.id,
          seat_number,
        },
      })
    )
  );

  const seatsEvent2 = await Promise.all(
    seatNumbers.map((seat_number) =>
      prisma.seats.create({
        data: {
          event_id: event2.id,
          seat_number,
        },
      })
    )
  );

  // 4. 예매 생성 (예: alice가 event1에서 A1, A2 예매)
  const userAlice = await prisma.users.findUnique({
    where: { email: "alice@example.com" },
  });

  const reservation = await prisma.reservations.create({
    data: {
      user_id: userAlice!.id,
      event_id: event1.id,
    },
  });

  await prisma.reservation_seats.createMany({
    data: [
      { reservation_id: reservation.id, seat_id: seatsEvent1[0].id }, // A1
      { reservation_id: reservation.id, seat_id: seatsEvent1[1].id }, // A2
    ],
  });

  // 좌석 상태 업데이트
  await prisma.seats.updateMany({
    where: {
      id: { in: [seatsEvent1[0].id, seatsEvent1[1].id] },
    },
    data: {
      status: "reserved",
    },
  });

  console.log("✅ 시드 데이터 생성 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
