function Input({
  label,
  type,
  placeholder,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="text-zinc-300 text-sm block mb-2">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl outline-none border border-zinc-700 focus:border-white"
      />

    </div>
  );
}

export default Input;