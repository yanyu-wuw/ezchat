import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useAsync } from "../../hooks/useAsync";
import { analyticsAPI } from "../../services/api";

export default function Progress() {
  const { user } = useAuthStore();
  const { data: progress, execute } = useAsync(() =>
    analyticsAPI.getUserProgress(user?.id || ""),
  );

  useEffect(() => {
    if (user?.id) {
      execute();
    }
  }, [user?.id]);

  const progressData = progress?.data;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Learning Progress</h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Overall Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: `${progressData?.progress_percentage || 0}%` }}
            />
          </div>
          <p className="text-right mt-2 font-semibold">
            {(progressData?.progress_percentage || 0).toFixed(0)}%
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600">Total Questions</p>
            <p className="text-3xl font-bold">
              {progressData?.total_questions_asked || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600">Learning Time</p>
            <p className="text-3xl font-bold">
              {progressData?.learning_time_hours || 0}h
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600">Satisfaction</p>
            <p className="text-3xl font-bold">
              {(progressData?.avg_satisfaction || 0).toFixed(1)}
            </p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-600">Last Active</p>
            <p className="text-sm font-bold">
              {progressData?.last_consultation_date
                ? new Date(
                    progressData.last_consultation_date,
                  ).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Tips for Better Learning</h2>
          <ul className="space-y-2 text-gray-700">
            <li>1. Ask specific questions to get better AI responses</li>
            <li>2. Keep track of your learning progress regularly</li>
            <li>3. Review previous consultations to reinforce learning</li>
            <li>4. Practice consistently for better understanding</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
