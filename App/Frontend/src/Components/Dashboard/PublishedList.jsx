import React from 'react'

export default function PublishedList({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm text-gray-600">No published events.</p>
  }
  return (
    <div className="grid gap-3">
      {items.map((e) => (
        <div key={e._id || e.id} className="rounded border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{e.title}</h3>
            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">published</span>
          </div>
          <p className="text-sm text-gray-700 mt-2 line-clamp-2">{e.description}</p>
        </div>
      ))}
    </div>
  )
}


