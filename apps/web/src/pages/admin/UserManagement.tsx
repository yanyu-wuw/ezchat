import { useEffect, useState } from "react";
import { useAsync } from "../../hooks/useAsync";
import { userAPI } from "../../services/api";

export default function UserManagement() {
  const { data: users, loading, execute } = useAsync(() => userAPI.getAll());
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);

  useEffect(() => {
    execute();
  }, []);

  useEffect(() => {
    if (users?.data) {
      setFilteredUsers(users.data);
    }
  }, [users]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      try {
        await userAPI.delete(id);
        execute();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">Username</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3">{user.username}</td>
                <td className="px-6 py-3">{user.email}</td>
                <td className="px-6 py-3">{user.role}</td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1 rounded bg-green-100 text-green-800">
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
