import { useState } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import jsPDF from "jspdf"

const API = "http://localhost:8000"

export default function CoverLetter({ job }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!job.job_description) {
      alert("This job has no description. Please add one first.")
      return
    }
    if (!user?.saved_resume_text) {
      alert("No resume found. Please upload your resume in your profile first.")
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${API}/jobs/cover-letter`, {
        job_id: job.id,
      })
      setCoverLetter(res.data.cover_letter)
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to generate cover letter.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const doc = new jsPDF()
    
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    const maxWidth = pageWidth - margin * 2
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    
    const lines = doc.splitTextToSize(coverLetter, maxWidth)
    
    let y = margin
    lines.forEach(line => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage()
        y = margin
        }
        doc.text(line, margin, y)
        y += 7
    })
    
    doc.save(`cover_letter_${job.company}_${job.title}.pdf`.replace(/\s+/g, "_"))
  }

  return (
    <div className="mt-4">
      <div className="text-sm text-gray-400 mb-2">Cover Letter Generator</div>

      {!coverLetter ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {loading ? "✍️ Writing cover letter..." : "✍️ Generate Cover Letter"}
        </button>
      ) : (
        <div>
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1 rounded-lg text-xs transition"
            >
              {loading ? "Regenerating..." : "🔄 Regenerate"}
            </button>
            <button
              onClick={handleCopy}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs transition"
            >
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-xs transition"
            >
              ⬇️ Download
            </button>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
            {coverLetter}
          </div>
        </div>
      )}
    </div>
  )
}