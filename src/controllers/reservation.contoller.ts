import { Request, Response, NextFunction } from "express";
import {
  reservationService,
  getAvailableSeatsService,
} from "../services/reservation.service";

export const createReservation = async (req: Request, res: Response) => {
  const { user_id, event_id, seat_ids } = req.body;
  console.log("받은 body:", req.body);
  console.log("user_id type:", typeof user_id);
  console.log("event_id type:", typeof event_id);
  console.log("seat_ids type:", typeof seat_ids, "내용:", seat_ids);

  if (!user_id || !event_id || !Array.isArray(seat_ids) || seat_ids.length === 0) {
    console.log("❌ 유효성 검사 실패:", req.body);
    return res.status(400).json({ message: "유효하지 않은 예매 정보" });
  }

  try {
    const reservation = await reservationService.createReservation(
      user_id,
      event_id,
      seat_ids
    );
    res.status(201).json({ message: "예매 완료", reservation });
    console.log(`예약 성공: `, reservation);
    console.log("유저:", user_id, "요청 좌석:", seat_ids);
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
    const event_id = parseInt(req.params.event_id);
    const seats = await getAvailableSeatsService(event_id);

    res.status(200).json({
      event_id,
      availableSeats: seats,
    });
  } catch (error) {
    next(error);
  }
};
