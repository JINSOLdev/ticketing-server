import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. 유저 생성
  const user = await prisma.users.create({
    data: {
      email: "test@example.com",
    },
  });

  // 2. 이벤트 생성
  const event = await prisma.events.create({
    data: {
      title: "테스트 이벤트",
      start_time: new Date("2025-08-01T19:00:00Z"),
      end_time: new Date("2025-08-01T21:00:00Z"),
    },
  });

  // 3. 좌석 생성
  const seatNumbers = ["A1", "A2", "A3", "A4", "A5"];
  const createdSeats = await Promise.all(
    seatNumbers.map((seat_number) =>
      prisma.seats.create({
        data: {
          eventId: event.id,
          seat_number,
          status: "available",
        },
      })
    )
  );

  // 4. 예매 데이터 예시 (A1, A2 예약)
  await prisma.reservations.create({
    data: {
      userId: user.id,
      eventId: event.id,
      seat: {
        connect: createdSeats.slice(0, 2).map((seat) => ({ id: seat.id })),
      },
    },
  });

  console.log("✅ 시드 데이터 삽입 완료!");
}

main()
  .catch((e) => {
    console.error("❌ 시드 삽입 오류:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
