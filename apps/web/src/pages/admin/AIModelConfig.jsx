import { useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { aiAPI } from "../../services/api";

export default function AIModelConfig() {
  const { data: config, execute } = useAsync(() => aiAPI.getConfig());
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await aiAPI.updateConfig({
        temperature,
        max_tokens: maxTokens,
      });
      execute();
      alert("Config updated successfully");
    } catch (err) {
      alert("Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">AI Model Configuration</h1>
      <div className="max-w-2xl bg-white p-6 rounded shadow">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Model: {config?.data?.model_name}
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Temperature
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-600 mt-1">Current: {temperature}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              System Prompt
            </label>
            <p className="text-gray-600 p-3 bg-gray-100 rounded">
              {config?.data?.system_prompt}
            </p>
          </div>

          <button
            onClick={handleUpdate}
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? "Updating..." : "Update Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
