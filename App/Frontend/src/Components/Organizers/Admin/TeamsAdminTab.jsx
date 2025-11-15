import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PendingTeamsTab } from './PendingTeamsTab';
import { CreatedTeamsTab } from './CreatedTeamsTab';
import { EditTeamModal } from './EditTeamModal';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { fetchTeamList, deleteTeam, editTeam } from '../../../store/team.slice';

export function TeamsAdminTab({ onCreateTeam, highlightTeamId, editTeamId, onClearHighlight }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { teamList } = useSelector((state) => state.team);
  const [activeSubTab, setActiveSubTab] = useState('created');
  const [pendingTeams, setPendingTeams] =useState([]);
  const [createdTeams, setCreatedTeams] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [isEditingFromPending, setIsEditingFromPending] = useState(false);
  const [processedHighlightId, setProcessedHighlightId] = useState(null);

  // Fetch teams on component mount
  useEffect(() => {
    dispatch(fetchTeamList());
  }, [dispatch]);

  // Process teamList into pending and created, filtering for teams where user is leader
  useEffect(() => {
    if (!user || !teamList || !Array.isArray(teamList)) {
      return; // Stop execution until both are loaded
    }

    const pending = [];
    const created = [];

    teamList.forEach(team => {
      // Only include teams where current user is the leader
      const isLeader = team.leader && team.leader._id === user.id; // Use user._id

      // Only add team to list if user is the leader
      if (isLeader) {
        const hasPending = team.members && Array.isArray(team.members) && team.members.some(m => m.status === 'Pending');
        if (hasPending) {
          pending.push({
            id: team._id,
            name: team.name,
            createdAt: team.createdAt,
            members: team.members.map(m => ({
              name: m?.user?.profile?.name,
              email: m?.user?.email,
              role: m?.role,
              status: m?.status,
            })),
          });
        } else {
          created.push({
            id: team._id,
            name: team.name,
            leader: team.leader?.profile?.name || 'Unknown',
            totalMembers: team.members ? team.members.length : 0,
            members: team.members ? team.members.map(m => ({
              name: m?.user?.profile?.name,
              email: m.user?.email,
              role: m.role,
              status: m.status,
            })) : [],
            createdAt: team.createdAt,
            status: 'Active',
          });
        }
      }

    });

    setPendingTeams(pending);
    setCreatedTeams(created);
    
  }, [teamList, user]); // Depend on both teamList and the user object

  // Handle opening edit modal when editTeamId is provided
  useEffect(() => {
    if (editTeamId) {
      // Try to find team in created teams first
      const createdTeam = createdTeams.find(t => t.id === editTeamId);
      if (createdTeam) {
        handleEditCreatedTeam(editTeamId);
        return;
      }

      // Try to find in pending teams
      const pendingTeam = pendingTeams.find(t => t.id === editTeamId);
      if (pendingTeam) {
        handleEditPendingTeam(editTeamId);
        return;
      }
    }
  }, [editTeamId, createdTeams, pendingTeams]); // Added dependencies

  // Reset processed highlight when switching tabs manually
  useEffect(() => {
    setProcessedHighlightId(null);
  }, [activeSubTab]);

  // Clear highlight when switching to non-created sub-tabs
  useEffect(() => {
    if (activeSubTab !== 'created' && onClearHighlight) {
      onClearHighlight();
    }
  }, [activeSubTab, onClearHighlight]);

  // Handle highlight completion callback
  const handleHighlightComplete = () => {
    setProcessedHighlightId(highlightTeamId);
    if (onClearHighlight) {
      onClearHighlight();
    }
  };

  const handleMoveToCreated = (teamId) => {
    const team = pendingTeams.find(t => t.id === teamId);
    if (!team) return;

    // Include all members with their status (no longer filtering by accepted only)
    const leader = team.members.find(m => m.role === 'Leader');
    
    if (!leader) return;

    // Create new team in created list with all members and their statuses
    const newCreatedTeam = {
      id: Date.now(), // Generate new ID
      name: team.name,
      leader: leader.name,
      totalMembers: team.members.length,
      members: team.members.map(m => ({
        name: m.name,
        email: m.email,
        role: m.role,
        status: m.status, // Preserve status
      })),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Active',
    };

    setCreatedTeams(prev => [...prev, newCreatedTeam]);
    setPendingTeams(prev => prev.filter(t => t.id !== teamId));
  };

  const handleDeleteCreatedTeam = (teamId) => {
    dispatch(deleteTeam(teamId));
  };

  const handleDeletePendingTeam = (teamId) => {
    dispatch(deleteTeam(teamId));
  };

  const handleEditCreatedTeam = (teamId) => {
  const fullTeam = teamList.find(t => t._id === teamId);
  if (!fullTeam) return;

  setTeamToEdit(fullTeam);
  setIsEditingFromPending(false);
  setEditModalOpen(true);
};

const handleEditPendingTeam = (teamId) => {
  const fullTeam = teamList.find(t => t._id === teamId);
  if (!fullTeam) return;

  setTeamToEdit(fullTeam);
  setIsEditingFromPending(true);
  setEditModalOpen(true);
};


  const handleSaveEditedTeam = (teamId, updatedTeam, hasNewMembers) => {
    dispatch(editTeam({ teamId, updatedTeam }));
  };

  // Filter teams for Created tab (Active teams first, In Use at the end)
  const activeTeams = createdTeams.filter(t => t.status === 'Active');
  const inUseTeams = createdTeams.filter(t => t.status === 'In Use');
  const sortedCreatedTeams = [...activeTeams, ...inUseTeams];

  return (
    <div className="space-y-6">
      {/* Sub-tabs with Create Team Button */}
      <div className="flex items-center justify-between">
        <SegmentedControl
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'created', label: 'Created' },
          ]}
          value={activeSubTab}
          onChange={(value) => setActiveSubTab(value)}
          variant="orange"
        />

        {/* Create Team Button */}
        <Button onClick={onCreateTeam} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Team
        </Button>
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === 'pending' && (
        <PendingTeamsTab 
          teams={pendingTeams} 
          onMoveToCreated={handleMoveToCreated}
          onEditTeam={handleEditPendingTeam}
          onDeleteTeam={handleDeletePendingTeam}
        />
      )}
      {activeSubTab === 'created' && (
        <CreatedTeamsTab
          teams={sortedCreatedTeams}
          onDeleteTeam={handleDeleteCreatedTeam}
          onEditTeam={handleEditCreatedTeam}
          highlightTeamId={processedHighlightId === highlightTeamId ? null : highlightTeamId}
          onHighlightComplete={handleHighlightComplete}
          currentUserEmail={user?.email}
        />
      )}


      {/* Edit Team Modal */}
      <EditTeamModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setTeamToEdit(null);
        }}
        team={teamToEdit}
        onSave={handleSaveEditedTeam}
        onDelete={isEditingFromPending ? handleDeletePendingTeam : undefined}
        isPending={isEditingFromPending}
      />
    </div>
  );
}

const memberShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['Leader', 'Member']).isRequired,
  status: PropTypes.oneOf(['Pending', 'Approved', 'Rejected']),
});

// Note: `id` from the backend is a string, but you are creating
// new ones with Date.now() (a number). This might be ok,
// but PropTypes.oneOfType([PropTypes.string, PropTypes.number]) is safer.
const teamShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  members: PropTypes.arrayOf(memberShape).isRequired,
});

TeamsAdminTab.propTypes = {
  onCreateTeam: PropTypes.func.isRequired,
  highlightTeamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  editTeamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClearHighlight: PropTypes.func,
};