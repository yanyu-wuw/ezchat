import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./pages/auth/LoginPage";
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import Analytics from "./pages/admin/Analytics";
import AIModelConfig from "./pages/admin/AIModelConfig";
import StudentDashboard from "./pages/student/Dashboard";
import AIConsultation from "./pages/student/AIConsultation";
import LearningHistory from "./pages/student/LearningHistory";
import Progress from "./pages/student/Progress";
import NotFound from "./pages/NotFound";

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {user?.role === "admin" && (
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/content" element={<ContentManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/ai-config" element={<AIModelConfig />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" />} />
          </Route>
        )}

        {(user?.role === "student" || user?.role === "teacher") && (
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/consultation" element={<AIConsultation />} />
            <Route path="/student/history" element={<LearningHistory />} />
            <Route path="/student/progress" element={<Progress />} />
            <Route path="*" element={<Navigate to="/student/dashboard" />} />
          </Route>
        )}

        <Route path="/login" element={<LoginPage />} />
        <Route path="/404" element={<NotFound />} />
        <Route
          path="*"
          element={
            <Navigate
              to={
                user?.role === "admin"
                  ? "/admin/dashboard"
                  : "/student/dashboard"
              }
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
