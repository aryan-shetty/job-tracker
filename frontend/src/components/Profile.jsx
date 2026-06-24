import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API = "http://localhost:8000"

export default function Profile({ onClose }) {
  const { user, logout, fetchProfile } = useAuth()
  const [resumeUploading, setResumeUploading] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setResumeUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      await axios.post(`${API}/parse-resume`, formData)
      await fetchProfile()
      setSuccess("Resume saved to your profile!")
    } catch {
      alert("Failed to upload resume.")
    } finally {
      setResumeUploading(false)
    }
  }

  const handleSaveName = async () => {
    setSaving(true)
    try {
      await axios.put(`${API}/auth/me`, { name })
      await fetchProfile()
      setSuccess("Profile updated!")
    } catch {
      alert("Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">👤 Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {success && (
          <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-2 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="avatar" className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
          <div>
            <div className="text-white font-semibold">{user?.name}</div>
            <div className="text-gray-400 text-sm">{user?.email}</div>
            <div className="text-gray-500 text-xs mt-1">
              Member since {new Date(user?.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Edit Name */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-1 block">Display Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
            />
            <button
              onClick={handleSaveName}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Resume */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-1 block">Saved Resume</label>
          {user?.saved_resume_text ? (
            <div className="bg-gray-800 rounded-lg px-4 py-3 flex items-center justify-between">
              <span className="text-green-400 text-sm">✅ Resume on file</span>
              <label className="text-blue-400 text-sm hover:underline cursor-pointer">
                Update
                <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
              </label>
            </div>
          ) : (
            <div>
              <label className="w-full bg-gray-800 border border-dashed border-gray-600 rounded-lg px-4 py-3 text-gray-400 text-sm text-center block cursor-pointer hover:border-gray-400 transition">
                {resumeUploading ? "Uploading..." : "📄 Upload Resume PDF"}
                <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full bg-red-900 hover:bg-red-800 text-red-300 py-2 rounded-lg font-medium transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}   