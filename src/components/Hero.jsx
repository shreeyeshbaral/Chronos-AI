import Button from "./Button";
import AICard from "./AICard";
function Hero() {
  return (
    <section className="flex flex-col items-center justify-center text-center mt-24 px-6">

      <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium">
        ⚡ AI Powered Productivity
      </span>

      <h1 className="text-6xl font-bold mt-8">
        Chronos AI
      </h1>

      <h2 className="text-3xl text-slate-300 mt-4">
        Never Miss Another Deadline
      </h2>

      <p className="max-w-2xl text-slate-400 mt-6 leading-8">
        Plan smarter, prioritize tasks, and let AI organize your schedule before deadlines become emergencies.
      </p>

      <div className="flex gap-4 mt-10">
        <Button text="Start Planning" />
        <Button text="Learn More" />
      </div>

      <AICard />

    </section>
  );
}

export default Hero;