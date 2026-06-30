import Hero from "../components/Hero";
import LandingLayout from "../layouts/LandingLayout";
import Features from "../components/Features";
import Footer from "../components/Footer";

function Landing() {
  return (
    <LandingLayout>
      <Hero />
      <Features />
      <Footer />
    </LandingLayout>
  );
}

export default Landing;