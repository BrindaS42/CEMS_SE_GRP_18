import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CreateTeam from '../../Components/Organizers/CreateTeam.jsx'
import EventForm from '../../Components/Organizers/EventForm.jsx'

export default function AdminPage() {
  const location = useLocation()

  const currentTab = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('tab') || 'create-event'
  }, [location.search])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-sm text-gray-600">Create events and manage your team</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin?tab=create-event"
            className={`px-4 py-2 rounded border ${currentTab === 'create-event' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800'}`}
          >
            Create Event
          </Link>
          <Link
            to="/admin?tab=create-team"
            className={`px-4 py-2 rounded border ${currentTab === 'create-team' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800'}`}
          >
            Create Team
          </Link>
        </div>
      </div>

      <div>
        {currentTab === 'create-event' && <EventForm />}
        {currentTab === 'create-team' && <CreateTeam />}
      </div>
    </div>
  )
}


