import React from 'react'

export default function DraftList({ drafts = [], getAdminUrl }) {
  if (!drafts.length) {
    return <p className="text-sm text-gray-600">No drafts found.</p>
  }
  return (
    <div className="grid gap-3">
      {drafts.map((e) => (
        <div key={e._id || e.id} className="rounded border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{e.title}</h3>
            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">draft</span>
          </div>
          <p className="text-sm text-gray-700 mt-2 line-clamp-2">{e.description}</p>
          <div className="mt-3 flex items-center justify-between text-sm">
            <a href={getAdminUrl?.(e)} className="text-blue-600 hover:underline">View in Admin</a>
          </div>
        </div>
      ))}
    </div>
  )
}


