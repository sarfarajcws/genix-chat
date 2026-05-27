import { motion } from "framer-motion";

function MessageBubble({ sender, text, time, isOwnMessage }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.2,
      }}
      className={`
        flex
        ${isOwnMessage ? "justify-end" : "justify-start"}
      `}
    >
      <div
        className={`
          max-w-xl rounded-2xl px-5 py-4

          ${isOwnMessage ? "bg-white text-black" : "bg-zinc-900 text-white"}
        `}
      >
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="font-semibold">{sender}</span>

          <span
            className={`
              text-xs
              ${isOwnMessage ? "text-black/60" : "text-zinc-400"}
            `}
          >
            {time}
          </span>
        </div>

        <p>{text}</p>
      </div>
    </motion.div>
  );
}

export default MessageBubble;
