import { Request, Response, NextFunction } from "express";
import {
  reservationService,
  getAvailableSeatsService,
} from "../services/reservation.service";

export const createReservation = async (req: Request, res: Response) => {
  const { userId, eventId, seatIds } = req.body;

  if (!userId || !eventId || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ message: "유효하지 않은 예매 정보" });
  }

  try {
    const reservation = await reservationService.createReservation(
      userId,
      eventId,
      seatIds
    );
    res.status(201).json({ message: "예매 완료", reservation });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
    404;
  }
};

export const getAvailableSeats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const seats = await getAvailableSeatsService(eventId);

    res.status(200).json({
      eventId,
      availableSeats: seats,
    });
  } catch (error) {
    next(error);
  }
};
