import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">AI Learning Admin</h1>
        <div className="space-y-4">
          <Link
            to="/admin/dashboard"
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/users"
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            User Management
          </Link>
          <Link
            to="/admin/content"
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            Content Management
          </Link>
          <Link
            to="/admin/analytics"
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            Analytics
          </Link>
          <Link
            to="/admin/ai-config"
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            AI Config
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
