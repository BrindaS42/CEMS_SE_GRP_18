import PropTypes from 'prop-types';
import { useState } from 'react';
import { Sidebar } from '../../Components/general/Sidebar';
import { EventsTab } from '../../Components/Students/EventsTab';
import { TeamsTab } from '../../Components/Students/TeamsTab';
import { ActivityCenterTab } from '../../Components/Students/ActivityCenterTab';
import { SegmentedControl } from '../../Components/ui/segmented-control';

// Updated to accept isSidebarCollapsed and onToggleSidebar props
export default function StudentDashboard({ 
  onNavigate, 
  isSidebarCollapsed, 
  onToggleSidebar 
}) {
  const [activeTab, setActiveTab] = useState('events');
  const [activePage, setActivePage] = useState('dashboard');

  const handleNavigation = (page) => {
    setActivePage(page);
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="flex h-screen bg-background pt-16">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onToggleSidebar}
        activePage={activePage}
        onNavigate={handleNavigation}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto smooth-scroll p-6 page-transition">
          {/* Page Header */}
          <div className="mb-6 animate-fade-in-up">
            <h2 className="text-foreground mb-2">Student Dashboard</h2>
            <p className="text-muted-foreground">
              Manage your event registrations, teams, and activities
            </p>
          </div>

          {/* Apple-style Segmented Control Tabs */}
          <div className="mb-6 animate-fade-in-up stagger-1">
            <SegmentedControl
              options={[
                { value: 'events', label: 'Events' },
                { value: 'teams', label: 'Teams' },
                { value: 'activity', label: 'Activity Center' },
              ]}
              value={activeTab}
              onChange={(value) => setActiveTab(value)}
              variant="student"
            />
          </div>

          {/* Tab Content */}
          <div className="tab-transition">
            {activeTab === 'events' && <EventsTab />}
            {activeTab === 'teams' && <TeamsTab />}
            {activeTab === 'activity' && <ActivityCenterTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

StudentDashboard.propTypes = {
  onNavigate: PropTypes.func,
  isSidebarCollapsed: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
};