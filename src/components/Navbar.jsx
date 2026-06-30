import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAuthClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-5 border-b border-slate-800">
      <h1 className="text-2xl font-bold text-white">
        Chronos AI
      </h1>

      <button
        onClick={handleAuthClick}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {user ? "Dashboard" : "Login"}
      </button>
    </nav>
  );
}

export default Navbar;