import express from "express";
import reservationRouter from "../src/routes/reservation.route";

const app = express();
const PORT = 3000;

app.use(express.json());

// 라우터 등록
// console.log("✅ /reservations route mounted");
app.use("/reservation", reservationRouter);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
