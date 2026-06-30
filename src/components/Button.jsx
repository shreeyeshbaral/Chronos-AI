function Button({ text, primary = true }) {
  return (
    <button
      className={`
        px-8 py-4
        rounded-2xl
        font-semibold
        transition-all
        duration-300
        hover:scale-105
        active:scale-95

        ${
          primary
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50"
            : "border border-slate-700 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white"
        }
      `}
    >
      {text}
    </button>
  );
}

export default Button;