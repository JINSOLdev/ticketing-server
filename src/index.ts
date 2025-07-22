import express from "express";
import db from '../src/config/db'
import reservationRouter from '../src/routes/reservation.route'

const app = express();
const PORT = 3000;

app.use(express.json());

// 라우터 등록
console.log("✅ /reservations route mounted");
app.use('/reservation', reservationRouter)

app.get("/", (req, res) => {
  res.send(`Ticketing server is running!`);
});

app.get('/events', async (req, res) => {
  const events = await db.events.findMany({
    include: {seats: true},
  })
  res.json(events)
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
