import PropTypes from 'prop-types';
import { Users, Calendar, CheckCircle, Clock, Eye, Crown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentTeams } from '@/store/student.slice';
import { ViewTeamMembersModal } from './ViewTeamMembersModal';

export function OngoingCompletedTeams() {
  const dispatch = useDispatch();
  const { studentTeams, loading } = useSelector((state) => state.student);
  const { user } = useSelector((state) => state.auth);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [teamToView, setTeamToView] = useState(null);

  useEffect(() => {
    dispatch(fetchStudentTeams());
  }, [dispatch]);

  const teams = useMemo(() => {
    if (!studentTeams.data || !user) return [];
    return studentTeams.data.filter(team => {
      const isMember = team.leader._id === user.id || team.members.some(m => m.member._id === user.id && m.status === 'Approved');
      // Assuming isRegisteredForEvent is a boolean flag on the team object from the backend
      return isMember && team.isRegisteredForEvent;
    });
  }, [studentTeams.data, user]);

  const handleViewMembers = (team) => {
    setTeamToView(team);
    setViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setTeamToView(null);
  };

  const getInitials = (name) => {
    if (!name) return '??';
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
          <h3 className="text-foreground">Ongoing Teams</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {teams.length} active team{teams.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {loading === false && teams.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Event Teams</h3>
          <p className="text-muted-foreground text-sm">
            Teams linked to events will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, index) => (
            <TeamCard
              key={team._id}
              team={team}
              index={index}
              onViewMembers={handleViewMembers}
              getInitials={getInitials}
              currentUser={user}
            />
          ))}
        </div>
      )}

      {/* View Team Members Modal */}
      <ViewTeamMembersModal
        open={viewModalOpen}
        onClose={handleCloseModal}
        team={teamToView}
      />
    </div>
  );
}

function TeamCard({ team, index, onViewMembers, getInitials, currentUser }) {
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
              Leader: {team.leader.profile.name}
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

        {/* Role Badge */}
        <div className="flex items-center gap-2">
          {team.leader._id === currentUser.id ? (
            <Badge className="bg-secondary text-secondary-foreground">
              <Crown className="w-3 h-3 mr-1" />
              Team Leader
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-card">
              <User className="w-3 h-3 mr-1" />
              Member
            </Badge>
          )}
        </div>
        {/* Linked Event */}
        {team.linkedEvent && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs text-primary">Linked Event</p>
            </div>
            <p className="text-sm text-foreground">{team.linkedEvent.title}</p>
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
            <p className="text-xs text-foreground">{team.members.length + 1}</p>
          </div>

          {/* Member Avatars */}
          <div className="flex items-center -space-x-2">
            {team.members.slice(0, 5).map((member) => (
              <div
                key={member.member._id}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs border-2 border-card ring-1 ring-border transition-transform duration-200 hover:scale-110 hover:z-10"
                title={member.member.profile.name}
              >
                {getInitials(member.member.profile.name)}
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
          onClick={() => onViewMembers(team)}
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
  member: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    profile: PropTypes.shape({ name: PropTypes.string.isRequired }),
    email: PropTypes.string.isRequired,
  })
});

const ongoingCompletedTeamShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  leader: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    profile: PropTypes.shape({ name: PropTypes.string.isRequired }),
    email: PropTypes.string.isRequired,
  }).isRequired,
  members: PropTypes.arrayOf(teamMemberShape).isRequired,
  linkedEvent: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    date: PropTypes.string.isRequired,
  }),
  status: PropTypes.oneOf(['Active', 'Completed']).isRequired,
  createdAt: PropTypes.string.isRequired,
  isRegisteredForEvent: PropTypes.bool,
});

TeamCard.propTypes = {
  team: ongoingCompletedTeamShape.isRequired,
  index: PropTypes.number.isRequired,
  onViewMembers: PropTypes.func.isRequired,
  getInitials: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
};