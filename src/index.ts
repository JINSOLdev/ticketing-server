import express from "express";
import db from '../src/config/db'

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Ticketing server is running!`);
});

app.get('/events', async (req, res) => {
  const events = await db.event.findMany({
    include: {seats: true},
  })
  res.json(events)
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
