import { useNavigate } from "react-router-dom";

function RoomCard({ roomName, roomId, members, maxMembers, isOwner }) {
  const navigate = useNavigate();

  return (
    <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">{roomName}</h2>

          <p className="text-zinc-400 text-sm">Room ID: {roomId}</p>
        </div>

        <div className="text-sm text-zinc-400">
          {members}/{maxMembers} online
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/chat/${roomId}`)}
          className="bg-white text-black px-4 py-2 rounded-xl font-medium"
        >
          Enter
        </button>

        {isOwner && (
          <button className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl font-medium">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default RoomCard;
