<<<<<<< HEAD
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { logoutSuccess } from '../../Store/auth.slice.js';
import { fetchDraftEvents, fetchPublishedEvents, fetchEventRegistrations, fetchEventCheckIns } from '../../Store/event.slice.js'
import PublishedList from '../../Components/Organizers/Dashboard/PublishedList.jsx'
import DraftList from '../../Components/Organizers/Dashboard/DraftList.jsx'

export default function Dashboard() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { published, drafts, logsByEventId, checkInsByEventId, status } = useSelector((s) => s.events)
  const [selectedEventId, setSelectedEventId] = useState('')

  const logout = () => {
    // Backend doesn't expose logout; clear client state. Cookie will expire later or can be cleared via server in future.
    dispatch(logoutSuccess());
  };

  useEffect(() => {
    dispatch(fetchPublishedEvents())
    dispatch(fetchDraftEvents())
  }, [dispatch])

  useEffect(() => {
    if (selectedEventId) {
      dispatch(fetchEventRegistrations(selectedEventId))
      dispatch(fetchEventCheckIns(selectedEventId))
    }
  }, [dispatch, selectedEventId])

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
          <p className="text-sm text-gray-600">Manage events, view history, registrations, and check-ins.</p>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button onClick={logout} className="bg-gray-200 rounded px-3 py-1">Logout</button>
          )}
          <a href="/admin?tab=create-event" className="px-4 py-2 bg-blue-600 text-white rounded">Create Event</a>
          <a href="/admin?tab=create-team" className="px-4 py-2 bg-gray-900 text-white rounded">Create Team</a>
        </div>
      </div>

      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-2">Published Events</h2>
          {status === 'loading' ? <p>Loading…</p> : <PublishedList items={published} />}
        </div>
        <div>
          <h2 className="font-semibold mb-2">Drafted Events</h2>
          <DraftList drafts={drafts} getAdminUrl={(e) => `/admin/events/${e._id || e.id}` } /> 
        </div>
      </section>

      <section className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Select Event for Logs & Check-ins</h2>
        <select className="w-full border rounded px-3 py-2 bg-white" onChange={(e) => setSelectedEventId(e.target.value)}>
          <option value="">-- Choose an event --</option>
          {[...published, ...drafts].map((e) => (
            <option key={e._id || e.id} value={e._id || e.id}>{e.title}</option>
          ))}
        </select>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Registration Logs</h3>
            <ul className="max-h-48 overflow-auto text-sm divide-y">
              {((selectedEventId ? (logsByEventId[selectedEventId] || []) : [])).map((log, i) => (
                <li key={i} className="py-2 flex items-center justify-between">
                  <span>{log.name} ({log.email})</span>
                  <span className="text-xs text-gray-600">{new Date(log.createdAt).toLocaleString?.() || ''}</span>
                </li>
              ))}
              {!selectedEventId && <li className="text-sm text-gray-600">Choose an event to view logs.</li>}
            </ul>
          </div>
          <div className="bg-white border rounded p-4">
            <h3 className="font-semibold mb-2">Check-ins</h3>
            <ul className="max-h-48 overflow-auto text-sm divide-y">
              {((selectedEventId ? (checkInsByEventId[selectedEventId] || []) : [])).map((c, i) => (
                <li key={i} className="py-2 flex items-center justify-between">
                  <span>{c.name} ({c.ticketId})</span>
                  <span className="text-xs text-gray-600">{new Date(c.checkedInAt).toLocaleString?.() || ''}</span>
                </li>
              ))}
              {!selectedEventId && <li className="text-sm text-gray-600">Choose an event to view check-ins.</li>}
            </ul>
          </div>
        </div>
      </section>
=======
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Sidebar } from '../../Components/Organizers/Sidebar';
import { EventsTab } from '../../Components/Organizers/EventsTab';
import { AnalyticsTab } from '../../Components/Organizers/AnalyticsTab';
import { TeamsTab } from '../../Components/Organizers/TeamsTab';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { SegmentedControl } from '../../components/ui/segmented-control';

export default function OrganizerDashboard({ onNavigate, events, isSidebarCollapsed, onToggleSidebar }) {
  const [activeTab, setActiveTab] = useState('events');

  const handleCreateEvent = () => {
    // Navigate to admin panel and open create event modal
    if (onNavigate) {
      onNavigate('admin', { openCreateEventModal: true });
    }
  };

  const handleCreateTeam = () => {
    // Navigate to admin panel and open create team modal
    if (onNavigate) {
      onNavigate('admin', { openCreateTeamModal: true });
    }
  };

  const handleViewEvent = (eventId) => {
    // Navigate to admin panel and highlight the event
    if (onNavigate) {
      onNavigate('admin', { highlightEventId: eventId });
    }
  };

  return (
    <div className="flex h-screen bg-background pt-16">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={onToggleSidebar}
        activePage="dashboard"
        onNavigate={onNavigate}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto smooth-scroll" data-page-content>
          <div className="max-w-7xl mx-auto p-6">
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between mb-6 animate-fade-in-up">
              <SegmentedControl
                options={[
                  { value: 'events', label: 'Events' },
                  { value: 'analytics', label: 'Analytics' },
                  { value: 'teams', label: 'Teams' },
                ]}
                value={activeTab}
                onChange={(value) => setActiveTab(value)}
                variant="blue"
              />

              {/* Action Buttons */}
              <div className="flex gap-3 animate-fade-in-up stagger-1">
                <Button onClick={handleCreateEvent} className="gap-2 btn-interact">
                  <Plus className="w-4 h-4" />
                  Create Event
                </Button>
                <Button onClick={handleCreateTeam} variant="outline" className="gap-2 btn-interact">
                  <Plus className="w-4 h-4" />
                  Create Team
                </Button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="tab-transition">
              {activeTab === 'events' && <EventsTab events={events} onViewEvent={handleViewEvent} />}
              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'teams' && onNavigate && <TeamsTab onNavigate={onNavigate} />}
            </div>
          </div>
        </main>
      </div>
>>>>>>> feature/organiser/frontend
    </div>
  );
}

<<<<<<< HEAD

=======
OrganizerDashboard.propTypes = {
  onNavigate: PropTypes.func,
  events: PropTypes.array.isRequired,
  isSidebarCollapsed: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
};
>>>>>>> feature/organiser/frontend
