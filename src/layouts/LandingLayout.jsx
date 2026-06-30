import Navbar from "../components/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";

function LandingLayout({ children }) {
  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <AnimatedBackground />

      <Navbar />

      <main>
        {children}
      </main>
    </div>
  );
}

export default LandingLayout;