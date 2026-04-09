import { useEffect, useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { analyticsAPI } from "../../services/api";

export default function Analytics() {
  const {
    data: performance,
    loading: perfLoading,
    execute: execPerf,
  } = useAsync(() => analyticsAPI.getAIPerformance());

  useEffect(() => {
    execPerf();
  }, []);

  if (perfLoading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Total Queries</p>
          <p className="text-3xl font-bold">
            {performance?.data?.total_queries || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Avg Satisfaction</p>
          <p className="text-3xl font-bold">
            {(performance?.data?.average_satisfaction || 0).toFixed(1)}
          </p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Response Time</p>
          <p className="text-3xl font-bold">
            {performance?.data?.response_time_ms || 0}ms
          </p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-600">Success Rate</p>
          <p className="text-3xl font-bold">
            {((performance?.data?.success_rate || 0) * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
