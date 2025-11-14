import PropTypes from 'prop-types';
import { useState } from 'react';
import { Sidebar } from '../../components/general/Sidebar';
import { EventsTab } from '../../components/Organizers/EventsTab';
import { AnalyticsTab } from '../../components/Organizers/AnalyticsTab';
import { TeamsTab } from '../../components/Organizers/TeamsTab';
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
    </div>
  );
}

OrganizerDashboard.propTypes = {
  onNavigate: PropTypes.func,
  events: PropTypes.array.isRequired,
  isSidebarCollapsed: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
};
