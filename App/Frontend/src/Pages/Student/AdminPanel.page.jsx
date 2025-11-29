import PropTypes from 'prop-types';
import { useState } from 'react';
import { Sidebar } from '../../components/general/Sidebar';
import { TeamsTab } from '../../components/Students/Admin/TeamsTab';

export default function StudentAdminPanel({ 
  onNavigate, 
  isSidebarCollapsed, // Accept from parent
  onToggleSidebar     // Accept from parent
}) {
  // Removed local sidebar state
  const [openCreateTeamModal, setOpenCreateTeamModal] = useState(false);
  const [activePage, setActivePage] = useState('admin');

  const handleNavigation = (page) => {
    setActivePage(page);
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="flex h-screen bg-background pt-16">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} // Use prop
        onToggleCollapse={onToggleSidebar} // Use prop
        activePage={activePage}
        onNavigate={handleNavigation}
        role="student"
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto smooth-scroll page-transition" data-page-content>
          <div className="max-w-7xl mx-auto p-6">
            {/* Page Header */}
            <div className="mb-6 animate-fade-in-up">
              <h2 className="text-foreground mb-2">Admin Panel</h2>
              <p className="text-muted-foreground">
                Manage your teams and collaborations
              </p>
            </div>

            {/* Teams Tab - Only tab for students */}
            <TeamsTab 
              openCreateModal={openCreateTeamModal}
              onOpenCreateModal={() => setOpenCreateTeamModal(true)}
              onCloseCreateModal={() => setOpenCreateTeamModal(false)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

StudentAdminPanel.propTypes = {
  onNavigate: PropTypes.func,
  isSidebarCollapsed: PropTypes.bool,
  onToggleSidebar: PropTypes.func,
};