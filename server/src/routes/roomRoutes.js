import express from "express";

import {
  createRoom, joinRoom, getMyRooms, getRoomById, deleteRoom, banUser,
} from "../controllers/roomController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  createRoom
);

router.post(
  "/join",
  authMiddleware,
  joinRoom
);

router.get(
  "/my-rooms",
  authMiddleware,
  getMyRooms
);

router.get(
  "/:roomId",
  authMiddleware,
  getRoomById
);

router.delete(
  "/:roomId",
  authMiddleware,
  deleteRoom
);

router.post(
  "/:roomId/ban",
  authMiddleware,
  banUser
);

export default router;