import http from "k6/http";
import { check } from "k6";

export let options = {
  vus: 10,
  duration: "1s",
};

export default function () {
  const url = "http://localhost:3000/reservation";
  const payload = JSON.stringify({
    userId: Math.floor(Math.random() * 10000),
    eventId: 1,
    seatIds: [1], // 같은 좌석
  });

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const res = http.post(url, payload, params);

  check(res, {
    "✅ 예약 성공 (201)": (r) => r.status === 201,
    "❌ 예약 실패 (중복 - 400)": (r) => r.status === 400,
  });
}
