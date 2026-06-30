import { Link } from "react-router-dom";
function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
      <h1 className="text-2xl font-bold text-white">
        Chronos AI
      </h1>

     <Link
        to="/login"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
>
        Login
</Link>
    </nav>
  );
}

export default Navbar;