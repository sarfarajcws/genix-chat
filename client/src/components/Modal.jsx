
function Modal({
  title,
  children,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">

      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-6 border border-zinc-800">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold text-white">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-zinc-400 text-xl"
          >
            ✕
          </button>

        </div>

        {children}

      </div>

    </div>
  );
}

export default Modal;