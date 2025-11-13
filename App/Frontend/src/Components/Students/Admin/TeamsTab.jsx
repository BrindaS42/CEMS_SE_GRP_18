import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';
import { PendingTeams } from './Teams/PendingTeams';
import { CreatedTeams } from './Teams/CreatedTeams';
import { OngoingCompletedTeams } from './Teams/OngoingCompletedTeams';
import { CreateTeamModal } from './CreateTeamModal';
import { SegmentedControl } from '../../../components/ui/segmented-control';

export function TeamsTab({ openCreateModal, onOpenCreateModal, onCloseCreateModal }) {
  const [activeSubTab, setActiveSubTab] = useState('created');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(openCreateModal || false);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    if (onOpenCreateModal) onOpenCreateModal();
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    if (onCloseCreateModal) onCloseCreateModal();
  };

  const handleCreateTeam = (teamData) => {
    console.log('Creating team:', teamData);
    // Implement team creation logic here
    // This would send invites and move team to Pending tab
    handleCloseCreateModal();
    setActiveSubTab('pending');
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs and Create Button */}
      <div className="flex items-center justify-between animate-fade-in-up stagger-1">
        <SegmentedControl
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'created', label: 'Created' },
            { value: 'ongoing', label: 'Ongoing / Completed' },
          ]}
          value={activeSubTab}
          onChange={(value) => setActiveSubTab(value)}
          variant="orange"
        />

        <Button
          onClick={handleOpenCreateModal}
          className="gap-2 btn-interact animate-fade-in-up stagger-2"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </Button>
      </div>

      {/* Sub-tab Content */}
      <div className="tab-transition">
        {activeSubTab === 'pending' && <PendingTeams onMoveToCreated={() => setActiveSubTab('created')} />}
        {activeSubTab === 'created' && <CreatedTeams />}
        {activeSubTab === 'ongoing' && <OngoingCompletedTeams />}
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateTeam}
      />
    </div>
  );
}

TeamsTab.propTypes = {
  openCreateModal: PropTypes.bool,
  onOpenCreateModal: PropTypes.func,
  onCloseCreateModal: PropTypes.func,
};