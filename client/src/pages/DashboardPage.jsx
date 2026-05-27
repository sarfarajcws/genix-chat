import socket from "../socket/socket";

import { useEffect, useState } from "react";

import Modal from "../components/Modal";

import Input from "../components/Input";

import RoomCard from "../components/RoomCard";

import api from "../api/axios";

import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showJoinModal, setShowJoinModal] = useState(false);

  const [roomName, setRoomName] = useState("");

  const [roomPassword, setRoomPassword] = useState("");

  const [maxMembers, setMaxMembers] = useState(10);

  const [joinRoomId, setJoinRoomId] = useState("");

  const [joinPassword, setJoinPassword] = useState("");

  const [rooms, setRooms] = useState([]);

  const [creatingRoom, setCreatingRoom] = useState(false);

  const [joiningRoom, setJoiningRoom] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/rooms/my-rooms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRooms(response.data.rooms);
      } catch (error) {
        console.error(error);

        toast.error("Failed to load rooms");
      }
    };

    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    setCreatingRoom(true);

    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        "/rooms/create",
        {
          roomName,
          password: roomPassword,
          maxMembers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Room created successfully");

      setShowCreateModal(false);

      setRoomName("");

      setRoomPassword("");

      setMaxMembers(10);

      navigate(`/chat/${response.data.room.roomId}`);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to create room");
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    setJoiningRoom(true);

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/rooms/join",
        {
          roomId: joinRoomId,
          password: joinPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Joined room successfully");

      setShowJoinModal(false);

      setJoinRoomId("");

      setJoinPassword("");

      navigate(`/chat/${joinRoomId}`);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to join room");
    } finally {
      setJoiningRoom(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("username");

    socket.disconnect();

    toast.success("Logged out successfully");

    navigate("/");
  };

  return (
    <>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold">Rooms</h1>

              <p className="text-zinc-400 mt-2">
                Your joined and created rooms
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="
                bg-red-500/20
                text-red-400
                px-5
                py-3
                rounded-xl
                font-semibold
              "
            >
              Logout
            </button>
          </div>

          {/* EMPTY STATE */}

          {rooms.length === 0 ? (
            <div
              className="
                border
                border-zinc-800
                rounded-3xl
                p-10
                text-center
                bg-zinc-900/50
              "
            >
              <h2 className="text-2xl font-semibold mb-3">No rooms yet</h2>

              <p className="text-zinc-400">
                Create or join a room to start chatting
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room._id}
                  roomName={room.roomName}
                  roomId={room.roomId}
                  members={room.members.length}
                  maxMembers={room.maxMembers}
                  isOwner={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FLOATING BUTTONS */}

      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={() => setShowJoinModal(true)}
          className="
            bg-zinc-800
            text-white
            px-5
            py-3
            rounded-2xl
            shadow-lg
          "
        >
          Join
        </button>

        <button
          onClick={() => setShowCreateModal(true)}
          className="
            bg-white
            text-black
            w-16
            h-16
            rounded-full
            text-4xl
            font-light
            shadow-lg
          "
        >
          +
        </button>
      </div>

      {/* CREATE ROOM MODAL */}

      {showCreateModal && (
        <Modal title="Create Room" onClose={() => setShowCreateModal(false)}>
          <div className="space-y-4">
            <Input
              label="Room Name"
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />

            <Input
              label="Max Members"
              type="number"
              placeholder="Enter limit"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
            />

            <Input
              label="Room Password"
              type="password"
              placeholder="4-digit password"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
            />

            <button
              onClick={handleCreateRoom}
              disabled={creatingRoom}
              className="
                w-full
                bg-white
                text-black
                py-3
                rounded-xl
                font-semibold
                disabled:opacity-50
              "
            >
              {creatingRoom ? "Creating..." : "Create Room"}
            </button>
          </div>
        </Modal>
      )}

      {/* JOIN ROOM MODAL */}

      {showJoinModal && (
        <Modal title="Join Room" onClose={() => setShowJoinModal(false)}>
          <div className="space-y-4">
            <Input
              label="Room ID"
              type="text"
              placeholder="Enter room ID"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
            />

            <Input
              label="Room Password"
              type="password"
              placeholder="Enter password"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
            />

            <button
              onClick={handleJoinRoom}
              disabled={joiningRoom}
              className="
                w-full
                bg-white
                text-black
                py-3
                rounded-xl
                font-semibold
                disabled:opacity-50
              "
            >
              {joiningRoom ? "Joining..." : "Join Room"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default DashboardPage;
