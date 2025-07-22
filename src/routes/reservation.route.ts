import { Router } from "express";
import { createReservation } from "../controllers/reservation.contoller";

const router = Router();

router.post("/", createReservation);

export default router;
