import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useAsync } from "../../hooks/useAsync";
import { userAPI, analyticsAPI } from "../../services/api";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { data: profile, execute: execProfile } = useAsync(() =>
    userAPI.getProfile(user?.id || ""),
  );
  const { data: progress, execute: execProgress } = useAsync(() =>
    analyticsAPI.getUserProgress(user?.id || ""),
  );

  useEffect(() => {
    if (user?.id) {
      execProfile();
      execProgress();
    }
  }, [user?.id]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.username}</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Questions Asked</p>
          <p className="text-3xl font-bold">
            {progress?.data?.total_questions_asked || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Learning Time</p>
          <p className="text-3xl font-bold">
            {progress?.data?.learning_time_hours || 0}h
          </p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Progress</p>
          <p className="text-3xl font-bold">
            {(progress?.data?.progress_percentage || 0).toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Your Statistics</h2>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Average Satisfaction:</span>{" "}
            {(progress?.data?.avg_satisfaction || 0).toFixed(1)} / 5
          </p>
          <p>
            <span className="font-semibold">Last Consultation:</span>{" "}
            {progress?.data?.last_consultation_date
              ? new Date(
                  progress.data.last_consultation_date,
                ).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
