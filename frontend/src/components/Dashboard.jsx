export default function Dashboard({ stats }) {
  const cards = [
    { label: "Total", value: stats.total || 0, color: "bg-blue-600" },
    { label: "Applied", value: stats.applied || 0, color: "bg-yellow-600" },
    { label: "Interview", value: stats.interview || 0, color: "bg-purple-600" },
    { label: "Offer", value: stats.offer || 0, color: "bg-green-600" },
    { label: "Rejected", value: stats.rejected || 0, color: "bg-red-600" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {cards.map(card => (
        <div key={card.label} className={`${card.color} rounded-xl p-4 text-center`}>
          <div className="text-3xl font-bold">{card.value}</div>
          <div className="text-sm mt-1 opacity-80">{card.label}</div>
        </div>
      ))}
    </div>
  )
}