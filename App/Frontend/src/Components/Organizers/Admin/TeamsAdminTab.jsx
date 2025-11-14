import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { PendingTeamsTab } from './PendingTeamsTab';
import { CreatedTeamsTab } from './CreatedTeamsTab';
import { InUseTeamsTab } from './InUseTeamsTab';
import { ArchivedTeamsTab } from './ArchivedTeamsTab';
import { EditTeamModal } from './EditTeamModal';
import { SegmentedControl } from '@/components/ui/segmented-control';

// Mock current logged-in organiser email
const CURRENT_USER_EMAIL = 'john@college.edu';

const initialPendingTeams = [
  {
    id: 1,
    name: 'Web Wizards',
    createdAt: '2025-10-28',
    members: [
      { name: 'John Doe', email: 'john@college.edu', role: 'Leader', status: 'Accepted' },
      { name: 'Jane Smith', email: 'jane@college.edu', role: 'Member', status: 'Accepted' },
      { name: 'Bob Wilson', email: 'bob@college.edu', role: 'Member', status: 'Pending' },
    ],
  },
  {
    id: 2,
    name: 'Data Dynamos',
    createdAt: '2025-10-29',
    members: [
      { name: 'Alice Cooper', email: 'alice@college.edu', role: 'Leader', status: 'Accepted' },
      { name: 'Charlie Brown', email: 'charlie@college.edu', role: 'Member', status: 'Accepted' },
      { name: 'David Lee', email: 'david@college.edu', role: 'Member', status: 'Accepted' },
      { name: 'Eva Martinez', email: 'eva@college.edu', role: 'Member', status: 'Accepted' },
    ],
  },
  {
    id: 3,
    name: 'AI Architects',
    createdAt: '2025-10-30',
    members: [
      { name: 'Frank Johnson', email: 'frank@college.edu', role: 'Leader', status: 'Accepted' },
      { name: 'Grace Kim', email: 'grace@college.edu', role: 'Member', status: 'Declined' },
      { name: 'Henry Davis', email: 'henry@college.edu', role: 'Member', status: 'Pending' },
    ],
  },
];

const initialCreatedTeams = [
  {
    id: 1,
    name: 'Innovators',
    leader: 'Sarah Johnson',
    totalMembers: 6,
    createdAt: '2025-10-20',
    status: 'In Use',
    members: [
      { name: 'Sarah Johnson', email: 'sarah@college.edu', role: 'Leader' },
      { name: 'Mike Chen', email: 'mike@college.edu', role: 'Member' },
      { name: 'Lisa Wang', email: 'lisa@college.edu', role: 'Member' },
      { name: 'Tom Baker', email: 'tom@college.edu', role: 'Member' },
      { name: 'Emma Davis', email: 'emma@college.edu', role: 'Member' },
      { name: 'John Doe', email: 'john@college.edu', role: 'Member' },
    ],
  },
  {
    id: 2,
    name: 'Tech Giants',
    leader: 'Alex Martinez',
    totalMembers: 4,
    createdAt: '2025-10-22',
    status: 'In Use',
    members: [
      { name: 'Alex Martinez', email: 'alex@college.edu', role: 'Leader' },
      { name: 'Nina Patel', email: 'nina@college.edu', role: 'Member' },
      { name: 'Ryan Lee', email: 'ryan@college.edu', role: 'Member' },
      { name: 'Sophia Kim', email: 'sophia@college.edu', role: 'Member' },
    ],
  },
  {
    id: 3,
    name: 'Code Warriors',
    leader: 'Daniel Brown',
    totalMembers: 4,
    createdAt: '2025-10-25',
    status: 'Active',
    members: [
      { name: 'Daniel Brown', email: 'daniel@college.edu', role: 'Leader' },
      { name: 'Olivia Taylor', email: 'olivia@college.edu', role: 'Member' },
      { name: 'James Wilson', email: 'james@college.edu', role: 'Member' },
      { name: 'John Doe', email: 'john@college.edu', role: 'Member' },
    ],
  },
  {
    id: 4,
    name: 'Digital Pioneers',
    leader: 'John Doe',
    totalMembers: 6,
    createdAt: '2025-10-26',
    status: 'Active',
    members: [
      { name: 'John Doe', email: 'john@college.edu', role: 'Leader' },
      { name: 'Chris Garcia', email: 'chris@college.edu', role: 'Member' },
      { name: 'Rachel Green', email: 'rachel@college.edu', role: 'Member' },
      { name: 'Kevin White', email: 'kevin@college.edu', role: 'Member' },
      { name: 'Amy Chen', email: 'amy@college.edu', role: 'Member' },
      { name: 'Sam Murphy', email: 'sam@college.edu', role: 'Member' },
    ],
  },
];

export function TeamsAdminTab({ onCreateTeam, highlightTeamId, editTeamId, onClearHighlight }) {
  const [activeSubTab, setActiveSubTab] = useState('created');
  const [pendingTeams, setPendingTeams] = useState(initialPendingTeams);
  const [createdTeams, setCreatedTeams] = useState(initialCreatedTeams);
  const [archivedTeams, setArchivedTeams] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [isEditingFromPending, setIsEditingFromPending] = useState(false);
  const [processedHighlightId, setProcessedHighlightId] = useState(null);

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
    const team = createdTeams.find(t => t.id === teamId);
    if (!team) return;

    // Move to archived
    const archivedTeam = {
      id: team.id,
      name: team.name,
      leader: team.leader,
      members: team.members,
      archivedAt: new Date().toISOString(),
      reason: 'deleted',
    };

    setArchivedTeams(prev => [archivedTeam, ...prev]);
    setCreatedTeams(prev => prev.filter(t => t.id !== teamId));
  };

  const handleDeletePendingTeam = (teamId) => {
    const team = pendingTeams.find(t => t.id === teamId);
    if (!team) return;

    const leader = team.members.find(m => m.role === 'Leader');

    // Move to archived
    const archivedTeam = {
      id: team.id,
      name: team.name,
      leader: leader?.name || 'Unknown',
      members: team.members.map(m => ({
        name: m.name,
        email: m.email,
        role: m.role,
      })),
      archivedAt: new Date().toISOString(),
      reason: 'deleted',
    };

    setArchivedTeams(prev => [archivedTeam, ...prev]);
    setPendingTeams(prev => prev.filter(t => t.id !== teamId));
  };

  const handleEditCreatedTeam = (teamId) => {
    const team = createdTeams.find(t => t.id === teamId);
    if (!team) return;

    setTeamToEdit({
      id: team.id,
      name: team.name,
      members: team.members.map(m => ({ ...m })),
    });
    setIsEditingFromPending(false);
    setEditModalOpen(true);
  };

  const handleEditPendingTeam = (teamId) => {
    const team = pendingTeams.find(t => t.id === teamId);
    if (!team) return;

    setTeamToEdit({
      id: team.id,
      name: team.name,
      members: team.members.map(m => ({ ...m })),
    });
    setIsEditingFromPending(true);
    setEditModalOpen(true);
  };

  const handleSaveEditedTeam = (teamId, updatedTeam, hasNewMembers) => {
    if (isEditingFromPending) {
      // Update pending team
      setPendingTeams(prev => prev.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            name: updatedTeam.name,
            members: updatedTeam.members.map(m => ({
              name: m.name,
              email: m.email,
              role: m.role,
              status: m.isNew ? 'Pending' : (t.members.find(om => om.email === m.email)?.status || 'Accepted'),
            })),
          };
        }
        return t;
      }));
    } else {
      // Editing from created teams
      if (hasNewMembers) {
        // Move to pending
        const team = createdTeams.find(t => t.id === teamId);
        if (!team) return;

        const newPendingTeam = {
          id: Date.now(),
          name: updatedTeam.name,
          createdAt: new Date().toISOString().split('T')[0],
          members: updatedTeam.members.map(m => ({
            name: m.name,
            email: m.email,
            role: m.role,
            status: m.isNew ? 'Pending' : 'Accepted',
          })),
        };

        setPendingTeams(prev => [...prev, newPendingTeam]);
        setCreatedTeams(prev => prev.filter(t => t.id !== teamId));
        setActiveSubTab('pending');
      } else {
        // Update in place
        setCreatedTeams(prev => prev.map(t => {
          if (t.id === teamId) {
            const leader = updatedTeam.members.find(m => m.role === 'Leader');
            return {
              ...t,
              name: updatedTeam.name,
              leader: leader?.name || t.leader,
              totalMembers: updatedTeam.members.length,
              members: updatedTeam.members.map(m => ({
                name: m.name,
                email: m.email,
                role: m.role,
              })),
            };
          }
          return t;
        }));
      }
    }
  };

  // Filter to only show teams where current user is a participant
  const userTeamsFilter = (team) => {
    return team.members.some(m => m.email === CURRENT_USER_EMAIL);
  };

  // Filter pending teams
  const filteredPendingTeams = pendingTeams.filter(userTeamsFilter);

  // Filter teams for Created tab (Active teams first, In Use at the end)
  const userCreatedTeams = createdTeams.filter(userTeamsFilter);
  const activeTeams = userCreatedTeams.filter(t => t.status === 'Active');
  const inUseTeams = userCreatedTeams.filter(t => t.status === 'In Use');
  const sortedCreatedTeams = [...activeTeams, ...inUseTeams];

  return (
    <div className="space-y-6">
      {/* Sub-tabs with Create Team Button */}
      <div className="flex items-center justify-between">
        <SegmentedControl
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'created', label: 'Created' },
            { value: 'inuse', label: 'In Use' },
            { value: 'archived', label: 'Archived' },
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
          teams={filteredPendingTeams} 
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
          currentUserEmail={CURRENT_USER_EMAIL}
        />
      )}
      {activeSubTab === 'inuse' && <InUseTeamsTab />}
      {activeSubTab === 'archived' && <ArchivedTeamsTab teams={archivedTeams} />}

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
  status: PropTypes.oneOf(['Pending', 'Accepted', 'Declined']),
});

const teamShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  members: PropTypes.arrayOf(memberShape).isRequired,
});

TeamsAdminTab.propTypes = {
  onCreateTeam: PropTypes.func.isRequired,
  highlightTeamId: PropTypes.number,
  editTeamId: PropTypes.number,
  onClearHighlight: PropTypes.func,
};