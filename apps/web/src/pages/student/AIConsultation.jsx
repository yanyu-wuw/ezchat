import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { consultationAPI } from "../../services/api";

export default function AIConsultation() {
  const { user } = useAuthStore();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { role: "student", content: question }]);
    setLoading(true);

    try {
      const response = await consultationAPI.ask(question);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: response.data.ai_response },
      ]);
      setQuestion("");
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Error: Failed to get response" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">AI Consultation</h1>

      <div className="bg-white rounded shadow p-6 mb-6 h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            Ask your question to get started
          </p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "student" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded ${
                    msg.role === "student"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded">Thinking...</div>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question..."
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Send
        </button>
      </form>
    </div>
  );
}
