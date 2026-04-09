import { useEffect, useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { contentAPI } from "../../services/api";

export default function ContentManagement() {
  const {
    data: knowledge,
    loading,
    execute,
  } = useAsync(() => contentAPI.getKnowledge());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    execute();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contentAPI.createKnowledge(title, content, category);
      setTitle("");
      setContent("");
      setCategory("general");
      execute();
    } catch (err) {
      alert("Failed to create content");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this content?")) {
      try {
        await contentAPI.deleteKnowledge(id);
        execute();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <h2 className="text-xl font-bold mb-4">Add Content</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded"
          >
            <option value="general">General</option>
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="language">Language</option>
          </select>
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      <div className="col-span-2">
        <h2 className="text-xl font-bold mb-4">Knowledge Base</h2>
        <div className="space-y-4">
          {loading ? (
            <div>Loading...</div>
          ) : (
            knowledge?.data?.map((item: any) => (
              <div key={item.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="text-gray-600">{item.category}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {item.content.substring(0, 100)}...
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
