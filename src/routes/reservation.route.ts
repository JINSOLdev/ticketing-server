import { Router } from "express";
import {
  createReservation,
  getAvailableSeats,
} from "../controllers/reservation.contoller";

const router = Router();

router.post("/", createReservation);
router.get("/seats/:eventId", getAvailableSeats);

export default router;
