import FeatureCard from "./FeatureCard";

function Features() {
  return (
    <section className="max-w-6xl mx-auto mt-28 px-6">

      <h2 className="text-4xl font-bold text-center">
        Why Choose Chronos AI?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">

        <FeatureCard
          emoji="🧠"
          title="Smart Prioritization"
          description="AI identifies your most important tasks before deadlines become urgent."
        />

        <FeatureCard
          emoji="📅"
          title="AI Scheduling"
          description="Automatically builds a personalized daily schedule based on your workload."
        />

        <FeatureCard
          emoji="🎯"
          title="Deadline Prediction"
          description="Predicts which tasks are most likely to miss their deadlines."
        />

      </div>

    </section>
  );
}

export default Features;