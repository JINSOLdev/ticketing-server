import http from "k6/http";
import { check } from "k6";

export let options = {
  vus: 10,
  duration: "1s",
};

export default function () {
  const payload = JSON.stringify({
    userId: 1234,
    eventId: 1,
    seatIds: [11, 12, 13], // 존재하는 available 상태 좌석이어야 함
  });

  const res = http.post("http://localhost:3000/reservation", payload, {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "✅ 여러 좌석 예매 성공 (201)": (r) => r.status === 201,
    "❌ 좌석 일부 중복으로 실패 (400)": (r) => r.status === 400,
  });
}
