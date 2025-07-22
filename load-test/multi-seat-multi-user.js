import http from "k6/http";
import { check } from "k6";

export let options = {
  vus: 10,
  duration: "1s",
};

const seatMap = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function () {
  // const userId = Math.floor(Math.random() * 10000);
  const userId = __VU
  const seatId = seatMap[__VU - 1];

  const payload = JSON.stringify({
    user_id: userId,
    event_id: 1,
    seat_ids: [seatId],
  });

  const res = http.post("http://localhost:3000/reservation", payload, {
    headers: { "Content-Type": "application/json" },
  });

  console.log(`seatId ${seatId} - status: ${res.status} - body: ${res.body}`);

  check(res, {
    "✅ 예약 시도 응답 확인": (r) => r.status === 201 || r.status === 409,
  });
}
