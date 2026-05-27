import api from "../api/axios";

import { useState, useEffect, useRef } from "react";

import MessageBubble from "../components/MessageBubble";

import socket from "../socket/socket";

import { useNavigate, useParams } from "react-router-dom";

import { toast } from "sonner";

import { motion } from "framer-motion";

function ChatPage() {
  const [showSidebar, setShowSidebar] = useState(false);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [room, setRoom] = useState(null);

  const [typingUser, setTypingUser] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const username = localStorage.getItem("username");

  const isOwner = username === room?.owner?.username;

  const messagesEndRef = useRef(null);

  const typingTimeoutRef = useRef(null);

  const { roomId } = useParams();

  const navigate = useNavigate();

  const sendMessage = async () => {
    if (!message.trim()) return;

    const messageData = {
      roomId,
      sender: username,
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isOwnMessage: true,
    };

    socket.emit("send_message", messageData);

    setMessages((prev) => [...prev, messageData]);

    setMessage("");
  };

  const handleLeaveRoom = () => {
    socket.emit("leave_room", {
      roomId,
      username,
    });

    navigate("/dashboard");
  };

  const handleDeleteRoom = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Room deleted successfully");

      socket.emit("room_deleted", roomId);

      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  };

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(room?.roomId);

      toast.success("Room ID copied");
    } catch (error) {
      toast.error("Failed to copy Room ID");
    }
  };

  const handleKickUser = (targetUsername) => {
    socket.emit("kick_user", {
      targetUsername,
      roomId,
    });

    toast.success(`${targetUsername} kicked`);

    setSelectedUser(null);
  };

  const handleBanUser = async (targetUsername) => {
    try {
      const token = localStorage.getItem("token");

      const targetUser = room.members.find(
        (member) => member.username === targetUsername,
      );

      await api.post(
        `/rooms/${roomId}/ban`,
        {
          targetUserId: targetUser._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      socket.emit("kick_user", {
        targetUsername,
        roomId,
      });

      toast.success(`${targetUsername} banned`);

      setSelectedUser(null);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to ban user");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get(`/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRoom(response.data.room);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoom();

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.emit("join_room", {
      roomId,
      username,
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          isOwnMessage: false,
        },
      ]);
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user_typing", (typingUsername) => {
      if (typingUsername === username) {
        return;
      }

      setTypingUser(typingUsername);

      clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        setTypingUser("");
      }, 1500);
    });

    socket.on("kicked", () => {
      toast.error("You were removed from the room");

      socket.emit("leave_room", {
        roomId,
        username,
      });

      navigate("/dashboard");
    });

    socket.on("room_deleted", () => {
      toast.error("Room was deleted");

      navigate("/dashboard");
    });

    return () => {
      socket.off("connect");

      socket.off("receive_message");

      socket.off("online_users");

      socket.off("user_typing");

      socket.off("kicked");

      socket.off("room_deleted");
    };
  }, [roomId, username]);

  return (
    <div className="h-screen bg-black text-white flex relative overflow-hidden">
      {/* MOBILE OVERLAY */}

      {showSidebar && (
        <div
          onClick={() => setShowSidebar(false)}
          className="
            fixed
            inset-0
            bg-black/50
            z-40
            md:hidden
          "
        />
      )}

      {/* SIDEBAR */}

      <motion.div
        initial={{
          x: -100,
          opacity: 0,
        }}
        animate={{
          x: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.25,
        }}
        className={`
          fixed md:static top-0 left-0 z-50
          w-80 h-screen
          bg-zinc-900 border-r border-zinc-800
          flex flex-col
          transition-transform duration-300

          ${showSidebar ? "translate-x-0" : "-translate-x-full"}

          md:translate-x-0
        `}
      >
        {/* ROOM HEADER */}

        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{room?.roomName}</h1>

            <p className="text-zinc-400 text-sm">
              Owner: 👑 {room?.owner?.username}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <p className="text-zinc-400 text-sm">Room ID: {room?.roomId}</p>

              <button
                onClick={handleCopyRoomId}
                className="
                  text-xs
                  bg-zinc-800
                  hover:bg-zinc-700
                  px-2
                  py-1
                  rounded-lg
                  transition
                "
              >
                Copy
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowSidebar(false)}
            className="
              md:hidden
              text-2xl
              text-zinc-400
            "
          >
            ✕
          </button>
        </div>

        {/* MEMBERS */}

        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-zinc-400 text-sm mb-4">ONLINE MEMBERS</h2>

          <div className="space-y-3">
            {onlineUsers.map((user, index) => (
              <div
                key={index}
                onClick={() =>
                  setSelectedUser(selectedUser === user ? null : user)
                }
                className="
                    bg-zinc-800
                    rounded-xl
                    px-4
                    py-3
                    cursor-pointer
                    transition
                    hover:bg-zinc-700
                  "
              >
                <div className="flex items-center justify-between">
                  <div>
                    🟢 {user}
                    {user === room?.owner?.username && (
                      <span className="ml-2">👑</span>
                    )}
                  </div>
                </div>

                {selectedUser === user && isOwner && user !== username && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        handleKickUser(user);
                      }}
                      className="
                            text-xs
                            bg-yellow-500/20
                            text-yellow-400
                            px-3
                            py-1
                            rounded-lg
                          "
                    >
                      Kick
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        handleBanUser(user);
                      }}
                      className="
                            text-xs
                            bg-red-500/20
                            text-red-400
                            px-3
                            py-1
                            rounded-lg
                          "
                    >
                      Ban
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CHAT AREA */}

      <div className="flex-1 flex flex-col">
        {/* CHAT HEADER */}

        <div className="h-20 border-b border-zinc-800 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button
              onClick={() => setShowSidebar(true)}
              className="
                md:hidden
                text-3xl
                mr-4
              "
            >
              ☰
            </button>

            <div>
              <h2 className="text-xl font-semibold">{room?.roomName}</h2>

              <p className="text-zinc-400 text-sm">
                {onlineUsers.length} members online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOwner && (
              <button
                onClick={handleDeleteRoom}
                className="
                  bg-red-600/20
                  text-red-500
                  px-4
                  py-2
                  rounded-xl
                "
              >
                Delete Room
              </button>
            )}

            <button
              onClick={handleLeaveRoom}
              className="
                bg-red-500/20
                text-red-400
                px-4
                py-2
                rounded-xl
              "
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* MESSAGES */}

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              sender={message.sender}
              text={message.text}
              time={message.time}
              isOwnMessage={message.isOwnMessage}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* MESSAGE INPUT */}

        <div className="p-5 border-t border-zinc-800">
          {typingUser && (
            <p className="text-zinc-400 text-sm mb-3 px-1">
              {typingUser} is typing...
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();

              sendMessage();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);

                socket.emit("typing", {
                  roomId,
                  username,
                });
              }}
              className="
                flex-1
                bg-zinc-900
                border
                border-zinc-800
                rounded-2xl
                px-5
                py-4
                outline-none
                focus:border-white
              "
            />

            <button
              type="submit"
              className="
                bg-white
                text-black
                px-6
                rounded-2xl
                font-semibold
              "
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
