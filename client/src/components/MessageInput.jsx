function MessageInput({
  value,
  onChange,
  onSubmit,
}) {

  const handleKeyDown = (e) => {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }

  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex gap-3"
    >

      <textarea
        placeholder="Type a message..."
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        rows={1}
        className="
          flex-1
          bg-zinc-900
          border border-zinc-800
          rounded-2xl
          px-5 py-4
          outline-none
          focus:border-white
          resize-none
          min-h-15
        "
      />

      <button
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
  );
}

export default MessageInput;