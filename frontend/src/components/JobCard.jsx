import { useState } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

const API = "http://localhost:8000"

const STATUS_COLORS = {
  Applied: "bg-yellow-600",
  Interview: "bg-purple-600",
  Offer: "bg-green-600",
  Rejected: "bg-red-600",
}

export default function JobCard({ job, onDeleted, onUpdated }) {
  const [expanded, setExpanded] = useState(false)
  const [resumeText, setResumeText] = useState("")
  const [scoring, setScoring] = useState(false)
  const [scoreResult, setScoreResult] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const { user } = useAuth()
  const savedResume = user?.saved_resume_text || null

  const skills = job.extracted_skills ? JSON.parse(job.extracted_skills) : []

  const handleDelete = async () => {
    if (!confirm("Delete this application?")) return
    await axios.delete(`${API}/jobs/${job.id}`)
    onDeleted()
  }

  const handleStatusChange = async (e) => {
    setUpdatingStatus(true)
    await axios.put(`${API}/jobs/${job.id}`, { status: e.target.value })
    onUpdated()
    setUpdatingStatus(false)
  }

  const handleScoreResume = async () => {
    if (!resumeText.trim()) return alert("Paste your resume text first.")
    setScoring(true)
    try {
      const res = await axios.post(`${API}/jobs/score-resume`, {
        job_id: job.id,
        resume_text: resumeText,
      })
      setScoreResult(res.data)
    } catch (err) {
      alert("Failed to score resume.")
    } finally {
      setScoring(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{job.title}</h3>
          <p className="text-gray-400">{job.company}</p>
          {job.url && (
            <a href={job.url} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline">
              View Posting ↗
            </a>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={job.status}
            onChange={handleStatusChange}
            disabled={updatingStatus}
            className={`${STATUS_COLORS[job.status]} text-white text-sm px-3 py-1 rounded-lg border-0 cursor-pointer`}
          >
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-white text-sm">
            {expanded ? "▲ Less" : "▼ More"}
          </button>
          <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm">
            Delete
          </button>
        </div>
      </div>

      {/* Match Score */}
      {job.match_score && (
        <div className="mt-3 flex items-center gap-2">
          <div className="text-sm text-gray-400">Match Score:</div>
          <div className={`text-sm font-bold ${job.match_score >= 70 ? "text-green-400" : job.match_score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
            {job.match_score}%
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span key={i} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Expanded Section */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {job.notes && (
            <div>
              <div className="text-sm text-gray-400 mb-1">Notes</div>
              <p className="text-gray-300 text-sm">{job.notes}</p>
            </div>
          )}

          {job.match_feedback && (
            <div>
              <div className="text-sm text-gray-400 mb-1">AI Feedback</div>
              <p className="text-gray-300 text-sm">{job.match_feedback}</p>
            </div>
          )}

          {job.job_description && (
            <div>
                <div className="text-sm text-gray-400 mb-2">Score My Resume</div>
                
                {/* Resume upload or saved resume */}
                {!resumeText ? (
                <div className="space-y-2">
                    <input
                    type="file"
                    accept=".pdf"
                    onChange={async (e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        const formData = new FormData()
                        formData.append("file", file)
                        const res = await axios.post(`${API}/parse-resume`, formData)
                        setResumeText(res.data.text)
                        localStorage.setItem("saved_resume", res.data.text)
                    }}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 text-sm"
                    />
                    {savedResume && (
                      <button
                        onClick={() => setResumeText(savedResume)}
                        className="text-blue-400 text-sm hover:underline"
                      >
                        ↩ Use saved resume from profile
                      </button>
                    )}
                </div>
                ) : (
                <div className="bg-gray-800 rounded-lg px-4 py-2 text-sm text-gray-300 flex justify-between items-center">
                    <span>✅ Resume loaded</span>
                    <button
                    onClick={() => setResumeText("")}
                    className="text-red-400 hover:text-red-300 text-xs"
                    >
                    Clear
                    </button>
                </div>
                )}

                <button
                onClick={handleScoreResume}
                disabled={scoring || !resumeText}
                className="mt-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                {scoring ? "Analyzing..." : "⚡ Score Resume with AI"}
                </button>
                
              {scoreResult && (
                <div className="mt-3 bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-center mb-2">
                    <span className={scoreResult.score >= 70 ? "text-green-400" : scoreResult.score >= 40 ? "text-yellow-400" : "text-red-400"}>
                      {scoreResult.score}% Match
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm text-center">{scoreResult.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}