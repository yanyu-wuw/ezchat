import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useAsync } from "../../hooks/useAsync";
import { consultationAPI } from "../../services/api";

export default function LearningHistory() {
  const { user } = useAuthStore();
  const { data: history, execute } = useAsync(() =>
    consultationAPI.getHistory(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    execute();
  }, []);

  const selected = selectedId
    ? history?.data?.find((h: any) => h.id === selectedId)
    : null;

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <h2 className="text-xl font-bold mb-4">Query History</h2>
        <div className="space-y-2">
          {history?.data?.map((item: any) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`w-full text-left p-3 rounded ${
                selectedId === item.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <p className="text-sm font-semibold truncate">{item.question}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-2">
        {selected ? (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Query Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Question</p>
                <p className="text-gray-900 mt-1">{selected.question}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  AI Response
                </p>
                <p className="text-gray-900 mt-1">{selected.ai_response}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Status</p>
                <p className="text-gray-900 mt-1">
                  <span className="px-3 py-1 rounded bg-green-100 text-green-800">
                    {selected.status}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Date</p>
                <p className="text-gray-900 mt-1">
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded flex items-center justify-center h-96">
            <p className="text-gray-500">Select a query to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
