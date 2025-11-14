import PropTypes from 'prop-types';
import { Users, Calendar, CheckCircle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { useState } from 'react';

// Mock data - replace with actual API data
// Active teams first, then completed
const mockTeams = [
  {
    id: 'ongoing_1',
    teamName: 'Code Warriors',
    leader: {
      name: 'John Doe',
      email: 'john@college.edu',
    },
    members: [
      { id: 'm1', name: 'Sarah Johnson', email: 'sarah@college.edu' },
      { id: 'm2', name: 'Mike Chen', email: 'mike@college.edu' },
      { id: 'm3', name: 'Emma Wilson', email: 'emma@college.edu' },
    ],
    linkedEvent: {
      id: 'event_1',
      name: 'Tech Hackathon 2025',
      date: '2025-11-15',
    },
    status: 'Active',
    createdAt: '2025-10-20',
  },
  {
    id: 'ongoing_2',
    teamName: 'AI Innovators',
    leader: {
      name: 'John Doe',
      email: 'john@college.edu',
    },
    members: [
      { id: 'm4', name: 'Alex Brown', email: 'alex@college.edu' },
      { id: 'm5', name: 'Olivia Taylor', email: 'olivia@college.edu' },
    ],
    linkedEvent: {
      id: 'event_2',
      name: 'AI Workshop Series',
      date: '2025-11-20',
    },
    status: 'Active',
    createdAt: '2025-10-28',
  },
  {
    id: 'completed_1',
    teamName: 'Design Thinkers',
    leader: {
      name: 'John Doe',
      email: 'john@college.edu',
    },
    members: [
      { id: 'm6', name: 'Noah Martinez', email: 'noah@college.edu' },
      { id: 'm7', name: 'Ava Anderson', email: 'ava@college.edu' },
      { id: 'm8', name: 'Liam Thomas', email: 'liam@college.edu' },
    ],
    linkedEvent: {
      id: 'event_3',
      name: 'Design Sprint Challenge',
      date: '2025-10-10',
    },
    status: 'Completed',
    createdAt: '2025-09-15',
  },
  {
    id: 'completed_2',
    teamName: 'Data Wizards',
    leader: {
      name: 'John Doe',
      email: 'john@college.edu',
    },
    members: [
      { id: 'm9', name: 'Sophia Garcia', email: 'sophia@college.edu' },
    ],
    linkedEvent: {
      id: 'event_4',
      name: 'Data Science Summit',
      date: '2025-09-20',
    },
    status: 'Completed',
    createdAt: '2025-08-25',
  },
];

export function OngoingCompletedTeams() {
  const [teams] = useState(mockTeams);

  // Sort: Active first, then Completed
  const sortedTeams = [...teams].sort((a, b) => {
    if (a.status === 'Active' && b.status === 'Completed') return -1;
    if (a.status === 'Completed' && b.status === 'Active') return 1;
    return 0;
  });

  const activeCount = teams.filter(t => t.status === 'Active').length;
  const completedCount = teams.filter(t => t.status === 'Completed').length;

  const handleViewMembers = (teamId) => {
    console.log('View members for team:', teamId);
    // Implement view members functionality
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-foreground">Ongoing & Completed Teams</h3>
          <p className="text-sm text-muted-foreground">
            {activeCount} active • {completedCount} completed
          </p>
        </div>
      </div>

      {sortedTeams.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Event Teams</h3>
          <p className="text-muted-foreground text-sm">
            Teams linked to events will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Teams Section */}
          {activeCount > 0 && (
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-success" />
                Active Teams ({activeCount})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedTeams
                  .filter(team => team.status === 'Active')
                  .map((team, index) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      index={index}
                      onViewMembers={handleViewMembers}
                      getInitials={getInitials}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Completed Teams Section */}
          {completedCount > 0 && (
            <div>
              <h4 className="text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                Completed Teams ({completedCount})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedTeams
                  .filter(team => team.status === 'Completed')
                  .map((team, index) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      index={index}
                      onViewMembers={handleViewMembers}
                      getInitials={getInitials}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TeamCard({ team, index, onViewMembers, getInitials }) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border border-border overflow-hidden',
        'card-interact gpu-accelerate',
        'animate-fade-in-up',
        `stagger-${(index % 10) + 1}`
      )}
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-foreground mb-1">{team.teamName}</h4>
            <p className="text-xs text-muted-foreground">
              Leader: {team.leader.name}
            </p>
          </div>
          <Badge
            className={cn(
              team.status === 'Active'
                ? 'bg-success text-success-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {team.status === 'Active' ? (
              <Clock className="w-3 h-3 mr-1" />
            ) : (
              <CheckCircle className="w-3 h-3 mr-1" />
            )}
            {team.status}
          </Badge>
        </div>

        {/* Linked Event */}
        {team.linkedEvent && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs text-primary">Linked Event</p>
            </div>
            <p className="text-sm text-foreground">{team.linkedEvent.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(team.linkedEvent.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Members */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Team Members</p>
            <p className="text-xs text-foreground">{team.members.length}</p>
          </div>

          {/* Member Avatars */}
          <div className="flex items-center -space-x-2">
            {team.members.slice(0, 5).map((member) => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs border-2 border-card ring-1 ring-border transition-transform duration-200 hover:scale-110 hover:z-10"
                title={member.name}
              >
                {getInitials(member.name)}
              </div>
            ))}
            {team.members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-card ring-1 ring-border flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{team.members.length - 5}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <Button
          onClick={() => onViewMembers(team.id)}
          variant="outline"
          className="w-full btn-interact"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Members
        </Button>
      </div>
    </div>
  );
}

const teamMemberShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
});

const ongoingCompletedTeamShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  leader: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  members: PropTypes.arrayOf(teamMemberShape).isRequired,
  linkedEvent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  }),
  status: PropTypes.oneOf(['Active', 'Completed']).isRequired,
  createdAt: PropTypes.string.isRequired,
});

TeamCard.propTypes = {
  team: ongoingCompletedTeamShape.isRequired,
  index: PropTypes.number.isRequired,
  onViewMembers: PropTypes.func.isRequired,
  getInitials: PropTypes.func.isRequired,
};