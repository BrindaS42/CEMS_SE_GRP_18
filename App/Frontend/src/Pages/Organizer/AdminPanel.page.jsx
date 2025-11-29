import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom'; // Import useLocation
import { Sidebar } from '../../components/general/Sidebar';
import { TeamsAdminTab } from '../../components/Organizers/Admin/TeamsAdminTab';
import { CreateTeamModal } from '../../components/Organizers/Admin/CreateTeamModal';
import { EventsAdminTab } from '../../components/Organizers/Admin/EventsAdminTab';
import { RegistrationsAdminTab } from '../../components/Organizers/Admin/RegistrationsAdminTab';
import { AnnouncementsAdminTab } from '../../components/Organizers/Admin/AnnouncementsAdminTab';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { CURRENT_USER_EMAIL } from '../../App';
import { fetchDashboardEvents } from '../../store/event.slice';

export default function AdminPanel({
  onNavigate,
  openCreateTeamModal = false,
  highlightTeamId = null,
  editTeamId = null,
  openCreateEventModal = false,
  highlightEventId = null,
  onClearHighlight,
  isSidebarCollapsed,
  onToggleSidebar,
}) {
  const dispatch = useDispatch();
  const location = useLocation(); // Hook to access navigation state
  const navigationState = location.state || {}; // Safe access to state

  // Determine effective values (props take precedence if passed, otherwise check navigation state)
  // Note: In the App.jsx, these props are defaults, so state will drive the behavior when navigating.
  const effectiveOpenCreateTeam = navigationState.openCreateTeamModal || openCreateTeamModal;
  const effectiveOpenCreateEvent = navigationState.openCreateEventModal || openCreateEventModal;
  const effectiveHighlightEventId = navigationState.highlightEventId || highlightEventId;
  const effectiveHighlightTeamId = navigationState.highlightTeamId || highlightTeamId;
  const effectiveEditTeamId = navigationState.editTeamId || editTeamId;

  const [activeTab, setActiveTab] = useState('teams');
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(effectiveOpenCreateTeam);
  const [scrollToRegistrationId, setScrollToRegistrationId] = useState(null);

  // Redux state
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Fetch events on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDashboardEvents());
    }
  }, [dispatch, isAuthenticated]);

  // Open Create Team modal when triggered via prop or navigation state
  useEffect(() => {
    if (effectiveOpenCreateTeam) {
      setIsCreateTeamModalOpen(true);
      setActiveTab('teams');
    }
  }, [effectiveOpenCreateTeam]);

  // Switch to teams tab and highlight/edit when needed
  useEffect(() => {
    if (effectiveHighlightTeamId || effectiveEditTeamId) {
      setActiveTab('teams');
    }
  }, [effectiveHighlightTeamId, effectiveEditTeamId]);

  // Switch to events tab when Create Event modal or Highlight Event is requested
  useEffect(() => {
    if (effectiveOpenCreateEvent || effectiveHighlightEventId) {
      setActiveTab('events');
    }
  }, [effectiveOpenCreateEvent, effectiveHighlightEventId]);

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
                  highlightTeamId={effectiveHighlightTeamId} 
                  editTeamId={effectiveEditTeamId} 
                  onClearHighlight={onClearHighlight} 
                />
              )}
              {activeTab === 'events' && (
                <EventsAdminTab
                  openCreateEventModal={effectiveOpenCreateEvent}
                  highlightEventId={effectiveHighlightEventId}
                  onClearHighlight={onClearHighlight}
                  onNavigateToRegistration={handleNavigateToRegistration}
                />
              )}
              {activeTab === 'registrations' && (
                <RegistrationsAdminTab 
                  onNavigate={onNavigate}
                  scrollToEventId={scrollToRegistrationId}
                  onClearScroll={handleClearScrollToRegistration}
                />
              )}
              {activeTab === 'announcements' && (
                <AnnouncementsAdminTab
                  currentUserEmail={CURRENT_USER_EMAIL}
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
  isSidebarCollapsed: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
};