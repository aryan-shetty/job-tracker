import { useState } from "react"
import axios from "axios"

const API = "http://localhost:8000"

export default function JobForm({ onJobAdded }) {
  const [form, setForm] = useState({
    company: "",
    title: "",
    status: "Applied",
    job_description: "",
    url: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.company || !form.title) return alert("Company and title are required.")
    setLoading(true)
    try {
      await axios.post(`${API}/jobs`, form)
      onJobAdded()
      setForm({ company: "", title: "", status: "Applied", job_description: "", url: "", notes: "" })
    } catch (err) {
      alert("Failed to add job.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Application</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="company"
          placeholder="Company *"
          value={form.company}
          onChange={handleChange}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
        />
        <input
          name="title"
          placeholder="Job Title *"
          value={form.title}
          onChange={handleChange}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
        >
          <option>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
        <input
          name="url"
          placeholder="Job URL (optional)"
          value={form.url}
          onChange={handleChange}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
        />
        <textarea
          name="job_description"
          placeholder="Paste job description (Claude will extract skills automatically)"
          value={form.job_description}
          onChange={handleChange}
          rows={4}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 sm:col-span-2"
        />
        <textarea
          name="notes"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 sm:col-span-2"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition"
      >
        {loading ? "Adding & extracting skills..." : "Add Application"}
      </button>
    </div>
  )
}