import Room from "../models/Room.js";

import bcrypt from "bcrypt";

const generateRoomId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createRoom = async (req, res) => {
  try {
    const { roomName, password, maxMembers } = req.body;

    // HASH ROOM PASSWORD

    const hashedPassword = await bcrypt.hash(password, 10);

    const room = await Room.create({
      roomName,

      roomId: generateRoomId(),

      password: hashedPassword,

      owner: req.user.userId,

      members: [req.user.userId],

      maxMembers,

      bannedUsers: [],
    });

    res.status(201).json({
      message: "Room created successfully",

      room,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId, password } = req.body;

    const room = await Room.findOne({
      roomId,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // CHECK IF USER IS BANNED

    const isBanned = room.bannedUsers.some(
      (id) => id.toString() === req.user.userId,
    );

    if (isBanned) {
      return res.status(403).json({
        message: "You are banned from this room",
      });
    }

    // COMPARE HASHED PASSWORD

    const isMatch = await bcrypt.compare(password, room.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    // CHECK ALREADY JOINED

    const alreadyJoined = room.members.some(
      (id) => id.toString() === req.user.userId,
    );

    if (alreadyJoined) {
      return res.status(400).json({
        message: "Already joined",
      });
    }

    // CHECK ROOM LIMIT

    if (room.members.length >= room.maxMembers) {
      return res.status(400).json({
        message: "Room is full",
      });
    }

    room.members.push(req.user.userId);

    await room.save();

    res.status(200).json({
      message: "Joined room successfully",

      room,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user.userId,
    });

    res.status(200).json({
      rooms,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      roomId,
    })
      .populate("owner", "username")
      .populate("members", "username");

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    res.status(200).json({
      room,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({
      roomId,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    if (room.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Only owner can delete room",
      });
    }

    await Room.deleteOne({
      roomId,
    });

    res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const banUser = async (req, res) => {
  try {
    const { roomId } = req.params;

    const { targetUserId } = req.body;

    const room = await Room.findOne({
      roomId,
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // OWNER CHECK

    if (room.owner.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Only owner can ban users",
      });
    }

    // ALREADY BANNED

    const alreadyBanned = room.bannedUsers.some(
      (id) => id.toString() === targetUserId,
    );

    if (alreadyBanned) {
      return res.status(400).json({
        message: "User already banned",
      });
    }

    room.bannedUsers.push(targetUserId);

    // REMOVE FROM MEMBERS

    room.members = room.members.filter(
      (memberId) => memberId.toString() !== targetUserId,
    );

    await room.save();

    res.status(200).json({
      message: "User banned successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
