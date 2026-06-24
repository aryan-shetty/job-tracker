import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { GoogleLogin } from "@react-oauth/google"
import axios from "axios"

const API = "http://localhost:8000"

export default function Register({ onSwitch }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async () => {
    if (!form.email || !form.password) return setError("Please fill in all fields.")
    if (form.password !== form.confirmPassword) return setError("Passwords don't match.")
    if (form.password.length < 6) return setError("Password must be at least 6 characters.")
    setLoading(true)
    setError("")
    try {
      const res = await axios.post(`${API}/auth/register`, {
        email: form.email,
        password: form.password,
        name: form.name,
      })
      login(res.data.access_token, res.data.user)
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API}/auth/google`, {
        token: credentialResponse.credential,
      })
      login(res.data.access_token, res.data.user)
    } catch {
      setError("Google login failed.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-2">🎯 Job Tracker</h1>
        <p className="text-gray-400 mb-6">Create your account</p>

        {error && <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            onKeyDown={e => e.key === "Enter" && handleRegister()}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
          />
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google login failed.")}
            theme="filled_dark"
            shape="rectangular"
            width="100%"
          />
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <button onClick={onSwitch} className="text-blue-400 hover:underline">
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}