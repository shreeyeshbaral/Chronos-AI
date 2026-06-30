function FeatureCard({ emoji, title, description }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition">

      <div className="text-4xl">
        {emoji}
      </div>

      <h3 className="text-xl font-semibold mt-4">
        {title}
      </h3>

      <p className="text-slate-400 mt-3">
        {description}
      </p>

    </div>
  );
}

export default FeatureCard;