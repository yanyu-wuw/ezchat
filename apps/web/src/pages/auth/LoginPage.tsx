import { useNavigate } from "react-router-dom";import { useNavigate } from "react-router-dom";import { useNavigate } from "react-router-dom";












































































































































}  );    </div>      </div>        </div>          <p>Admin: admin@test.com / pass123</p>          <p>Student: student@test.com / pass123</p>          <p className="font-semibold mb-2">Demo Credentials:</p>        <div className="mt-6 p-4 bg-gray-100 rounded text-sm text-gray-600">        </button>          {isSignUp ? "Already have account? Sign In" : "Need account? Sign Up"}        >          className="w-full mt-4 text-blue-600 hover:text-blue-700 font-semibold"          }}            setError("");            setIsSignUp(!isSignUp);          onClick={() => {          type="button"        <button        </form>          </button>            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}          >            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"            disabled={loading}            type="submit"          <button          )}            </select>              <option value="admin">Admin</option>              <option value="teacher">Teacher</option>              <option value="student">Student</option>            >              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"              onChange={(e) => setRole(e.target.value)}              value={role}            <select          {isSignUp && (          />            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"            required            onChange={(e) => setPassword(e.target.value)}            value={password}            placeholder="Password"            type="password"          <input          />            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"            required            onChange={(e) => setEmail(e.target.value)}            value={email}            placeholder="Email"            type="email"          <input          )}            />              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"              required              onChange={(e) => setUsername(e.target.value)}              value={username}              placeholder="Username"              type="text"            <input          {isSignUp && (        <form onSubmit={handleSubmit} className="space-y-4">        )}          </div>            {error}          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">        {error && (        </p>          {isSignUp ? "Create account" : "Sign in"}        <p className="text-gray-600 text-center mb-8">        </h1>          AI Learning Platform        <h1 className="text-3xl font-bold text-center mb-2">      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">  return (  };    }      setLoading(false);    } finally {      setError(err instanceof Error ? err.message : "An error occurred");    } catch (err) {      navigate(role === "admin" ? "/admin/dashboard" : "/student/dashboard");      }        await login(email, password);      } else {        });          role: role as any,          username,          email,          ...newUser,        setAuth("demo-token", {        const newUser = data.data;        const data = await response.json();        if (!response.ok) throw new Error("Registration failed");        );          },            body: JSON.stringify({ email, password, username, role }),            headers: { "Content-Type": "application/json" },            method: "POST",          {          "http://localhost:3000/api/auth/register",        const response = await fetch(      if (isSignUp) {    try {    setLoading(true);    setError("");    e.preventDefault();  const handleSubmit = async (e: React.FormEvent) => {  const [error, setError] = useState("");  const [loading, setLoading] = useState(false);  const [role, setRole] = useState("student");  const [username, setUsername] = useState("");  const [isSignUp, setIsSignUp] = useState(false);  const [password, setPassword] = useState("");  const [email, setEmail] = useState("");  const { login, setAuth } = useAuthStore();  const navigate = useNavigate();export default function LoginPage() {import { useState } from "react";import { useAuthStore } from "../../store/authStore";











































































































































}  );    </div>      </div>        </div>          <p>Admin: admin@test.com / pass123</p>          <p>Student: student@test.com / pass123</p>          <p className="font-semibold mb-2">Demo Credentials:</p>        <div className="mt-6 p-4 bg-gray-100 rounded text-sm text-gray-600">        </button>          {isSignUp ? "Already have account? Sign In" : "Need account? Sign Up"}        >          className="w-full mt-4 text-blue-600 hover:text-blue-700 font-semibold"          }}            setError("");            setIsSignUp(!isSignUp);          onClick={() => {          type="button"        <button        </form>          </button>            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}          >            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"            disabled={loading}            type="submit"          <button          )}            </select>              <option value="admin">Admin</option>              <option value="teacher">Teacher</option>              <option value="student">Student</option>            >              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"              onChange={(e) => setRole(e.target.value)}              value={role}            <select          {isSignUp && (          />            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"            required            onChange={(e) => setPassword(e.target.value)}            value={password}            placeholder="Password"            type="password"          <input          />            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"            required            onChange={(e) => setEmail(e.target.value)}            value={email}            placeholder="Email"            type="email"          <input          )}            />              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"              required              onChange={(e) => setUsername(e.target.value)}              value={username}              placeholder="Username"              type="text"            <input          {isSignUp && (        <form onSubmit={handleSubmit} className="space-y-4">        )}          </div>            {error}          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">        {error && (        </p>          {isSignUp ? "Create account" : "Sign in"}        <p className="text-gray-600 text-center mb-8">        </h1>          AI Learning Platform        <h1 className="text-3xl font-bold text-center mb-2">      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">  return (  };    }      setLoading(false);    } finally {      setError(err instanceof Error ? err.message : "An error occurred");    } catch (err) {      navigate(role === "admin" ? "/admin/dashboard" : "/student/dashboard");      }        await login(email, password);      } else {        });          role: role as any,          username,          email,          ...newUser,        setAuth("demo-token", {        const newUser = data.data;        const data = await response.json();        if (!response.ok) throw new Error("Registration failed");        );          },            body: JSON.stringify({ email, password, username, role }),            headers: { "Content-Type": "application/json" },            method: "POST",          {          "http://localhost:3000/api/auth/register",        const response = await fetch(      if (isSignUp) {    try {    setLoading(true);    setError("");    e.preventDefault();  const handleSubmit = async (e: React.FormEvent) => {  const [error, setError] = useState("");  const [loading, setLoading] = useState(false);  const [role, setRole] = useState("student");  const [username, setUsername] = useState("");  const [isSignUp, setIsSignUp] = useState(false);  const [password, setPassword] = useState("");  const [email, setEmail] = useState("");  const { login, setAuth } = useAuthStore();  const navigate = useNavigate();export default function LoginPage() {import { useState } from "react";import { useAuthStore } from "../../store/authStore";import { useAuthStore } from "../../../../../store/authStore";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const response = await fetch(
          "http://localhost:3000/api/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, username, role }),
          },
        );

        if (!response.ok) throw new Error("Registration failed");

        const data = await response.json();
        const newUser = data.data;
        setAuth("demo-token", {
          ...newUser,
          email,
          username,
          role: role as any,
        });
      } else {
        await login(email, password);
      }

      navigate(role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">
          AI Learning Platform
        </h1>
        <p className="text-gray-600 text-center mb-8">
          {isSignUp ? "Create account" : "Sign in"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {isSignUp && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
          }}
          className="w-full mt-4 text-blue-600 hover:text-blue-700 font-semibold"
        >
          {isSignUp ? "Already have account? Sign In" : "Need account? Sign Up"}
        </button>

        <div className="mt-6 p-4 bg-gray-100 rounded text-sm text-gray-600">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p>Student: student@test.com / pass123</p>
          <p>Admin: admin@test.com / pass123</p>
        </div>
      </div>
    </div>
  );
}
