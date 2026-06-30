function AICard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-16 max-w-xl shadow-lg">

      <h3 className="text-xl font-semibold text-white">
        🤖 AI Suggestion
      </h3>

      <p className="text-slate-400 mt-4 leading-7">
        Based on your deadlines, you should finish your ADA assignment today before 7 PM.
      </p>

      <div className="mt-6">

        <p className="text-sm text-slate-500">
          Deadline Risk
        </p>

        <p className="text-red-400 font-bold text-lg">
          84%
        </p>

      </div>

    </div>
  );
}

export default AICard;