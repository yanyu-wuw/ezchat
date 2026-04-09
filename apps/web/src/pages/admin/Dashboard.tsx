import { useEffect, useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { analyticsAPI } from "../../services/api";

export default function AdminDashboard() {
  const {
    data: analytics,
    loading,
    execute,
  } = useAsync(() => analyticsAPI.getDashboard());

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">Total Users</p>
          <p className="text-3xl font-bold">
            {analytics?.data?.total_users || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">Active Users</p>
          <p className="text-3xl font-bold">
            {analytics?.data?.active_users || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">New Today</p>
          <p className="text-3xl font-bold">
            {analytics?.data?.new_users_today || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">Consultations</p>
          <p className="text-3xl font-bold">
            {analytics?.data?.total_consultations || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600">Avg Response</p>
          <p className="text-3xl font-bold">
            {analytics?.data?.average_response_time || 0}s
          </p>
        </div>
      </div>
    </div>
  );
}
