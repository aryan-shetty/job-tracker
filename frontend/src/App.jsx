import { useState, useEffect } from "react"
import axios from "axios"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { useAuth } from "./context/AuthContext"
import { AuthProvider } from "./context/AuthContext"
import JobForm from "./components/JobForm"
import JobCard from "./components/JobCard"
import Dashboard from "./components/Dashboard"
import Login from "./components/Login"
import Register from "./components/Register"
import Profile from "./components/Profile"

const API = "http://localhost:8000"
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function AppContent() {
  const { user, loading } = useAuth()
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState("All")
  const [search, setSearch] = useState("")
  const [showProfile, setShowProfile] = useState(false)
  const [authMode, setAuthMode] = useState("login")

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs`)
      setJobs(res.data)
    } catch {}
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/stats`)
      setStats(res.data)
    } catch {}
  }

  useEffect(() => {
    if (user) {
      fetchJobs()
      fetchStats()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return authMode === "login"
      ? <Login onSwitch={() => setAuthMode("register")} />
      : <Register onSwitch={() => setAuthMode("login")} />
  }

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === "All" || job.status === filterStatus
    const matchesSearch = job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.title.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">🎯 Job Tracker</h1>
            <p className="text-gray-400 mt-1">AI-powered job application tracker</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <span className="text-sm">{user.name}</span>
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              {showForm ? "Cancel" : "+ Add Job"}
            </button>
          </div>
        </div>

        {/* Profile Modal */}
        {showProfile && <Profile onClose={() => setShowProfile(false)} />}

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <JobForm onJobAdded={() => { fetchJobs(); fetchStats(); setShowForm(false) }} />
          </div>
        )}

        {/* Dashboard */}
        <Dashboard stats={stats} />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mt-8 mb-6">
          <input
            type="text"
            placeholder="Search company or title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 flex-1 min-w-48"
          />
          {["All", "Applied", "Interview", "Offer", "Rejected"].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              No jobs found. Add your first application!
            </div>
          ) : (
            filteredJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onDeleted={() => { fetchJobs(); fetchStats() }}
                onUpdated={() => { fetchJobs(); fetchStats() }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}