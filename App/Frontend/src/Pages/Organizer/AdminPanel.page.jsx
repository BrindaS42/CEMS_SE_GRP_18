import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Sidebar } from '../../Components/Organizers/Sidebar';
import { TeamsAdminTab } from '../../Components/Organizers/Admin/TeamsAdminTab';
import { CreateTeamModal } from '../../Components/Organizers/Admin/CreateTeamModal';
import { EventsAdminTab } from '../../Components/Organizers/Admin/EventsAdminTab';
import { RegistrationsAdminTab } from '../../Components/Organizers/Admin/RegistrationsAdminTab';
import { AnnouncementsAdminTab } from '../../Components/Organizers/Admin/AnnouncementsAdminTab';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { CURRENT_USER_EMAIL } from '../../App';

export default function AdminPanel({ 
  onNavigate, 
  openCreateTeamModal = false, 
  highlightTeamId = null, 
  editTeamId = null,
  openCreateEventModal = false,
  highlightEventId = null,
  onClearHighlight,
  events,
  onUpdateEvents,
  isSidebarCollapsed,
  onToggleSidebar,
}) {
  const [activeTab, setActiveTab] = useState('teams');
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(openCreateTeamModal);
  const [scrollToRegistrationId, setScrollToRegistrationId] = useState(null);

  // Open modal when openCreateTeamModal prop changes
  useEffect(() => {
    if (openCreateTeamModal) {
      setIsCreateTeamModalOpen(true);
    }
  }, [openCreateTeamModal]);

  // Switch to teams tab and highlight when highlightTeamId is provided
  useEffect(() => {
    if (highlightTeamId) {
      setActiveTab('teams');
    }
  }, [highlightTeamId]);

  // Switch to teams tab when editTeamId is provided
  useEffect(() => {
    if (editTeamId) {
      setActiveTab('teams');
    }
  }, [editTeamId]);

  // Switch to events tab when openCreateEventModal or highlightEventId is provided
  useEffect(() => {
    if (openCreateEventModal || highlightEventId) {
      setActiveTab('events');
    }
  }, [openCreateEventModal, highlightEventId]);

  // Clear highlight when switching away from respective tabs
  useEffect(() => {
    if (activeTab !== 'teams' && activeTab !== 'events' && onClearHighlight) {
      onClearHighlight();
    }
  }, [activeTab, onClearHighlight]);

  const handleCreateTeam = () => {
    setIsCreateTeamModalOpen(true);
  };

  const handleNavigateToRegistration = (eventId) => {
    setActiveTab('registrations');
    setScrollToRegistrationId(eventId);
  };

  const handleClearScrollToRegistration = () => {
    setScrollToRegistrationId(null);
  };

  // Get drafted events for registrations tab
  const draftedEvents = events.filter(e => e.status === 'drafted');

  return (
    <div className="flex h-screen bg-background pt-16">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={onToggleSidebar}
        activePage="admin"
        onNavigate={onNavigate}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Admin Panel Content */}
        <main className="flex-1 overflow-y-auto smooth-scroll" data-page-content>
          <div className="max-w-7xl mx-auto p-6">
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between mb-6 animate-fade-in-up">
              <SegmentedControl
                options={[
                  { value: 'teams', label: 'Teams' },
                  { value: 'events', label: 'Events' },
                  { value: 'registrations', label: 'Registrations' },
                  { value: 'announcements', label: 'Announcements' },
                ]}
                value={activeTab}
                onChange={(value) => setActiveTab(value)}
                variant="blue"
              />
            </div>

            {/* Tab Content */}
            <div className="tab-transition">
              {activeTab === 'teams' && (
                <TeamsAdminTab 
                  onCreateTeam={handleCreateTeam} 
                  highlightTeamId={highlightTeamId} 
                  editTeamId={editTeamId} 
                  onClearHighlight={onClearHighlight} 
                />
              )}
              {activeTab === 'events' && (
                <EventsAdminTab 
                  openCreateEventModal={openCreateEventModal}
                  highlightEventId={highlightEventId}
                  onClearHighlight={onClearHighlight}
                  events={events}
                  onUpdateEvents={onUpdateEvents}
                  onNavigateToRegistration={handleNavigateToRegistration}
                />
              )}
              {activeTab === 'registrations' && (
                <RegistrationsAdminTab 
                  onNavigate={onNavigate}
                  draftedEvents={draftedEvents}
                  scrollToEventId={scrollToRegistrationId}
                  onClearScroll={handleClearScrollToRegistration}
                />
              )}
              {activeTab === 'announcements' && (
                <AnnouncementsAdminTab
                  events={events}
                  currentUserEmail={CURRENT_USER_EMAIL}
                  onUpdateEvent={(eventId, eventData) => {
                    const updatedEvents = events.map(e => 
                      e.id === eventId ? { ...e, ...eventData } : e
                    );
                    onUpdateEvents(updatedEvents);
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal 
        open={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
      />
    </div>
  );
}

AdminPanel.propTypes = {
  onNavigate: PropTypes.func,
  openCreateTeamModal: PropTypes.bool,
  highlightTeamId: PropTypes.number,
  editTeamId: PropTypes.number,
  openCreateEventModal: PropTypes.bool,
  highlightEventId: PropTypes.number,
  onClearHighlight: PropTypes.func,
  events: PropTypes.array.isRequired,
  onUpdateEvents: PropTypes.func.isRequired,
  isSidebarCollapsed: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
};