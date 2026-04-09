import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function StudentLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-blue-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">AI Learning</h1>
        <div className="space-y-4">
          <Link
            to="/student/dashboard"
            className="block px-4 py-2 rounded hover:bg-blue-700"
          >
            Dashboard
          </Link>
          <Link
            to="/student/consultation"
            className="block px-4 py-2 rounded hover:bg-blue-700"
          >
            AI Consultation
          </Link>
          <Link
            to="/student/history"
            className="block px-4 py-2 rounded hover:bg-blue-700"
          >
            Learning History
          </Link>
          <Link
            to="/student/progress"
            className="block px-4 py-2 rounded hover:bg-blue-700"
          >
            Progress
          </Link>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
