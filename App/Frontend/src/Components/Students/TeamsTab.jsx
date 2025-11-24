import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Calendar, Crown, User, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';
import { ViewTeamMembersModal } from './Admin/Teams/ViewTeamMembersModal';
import { fetchStudentTeams } from '@/Store/student.slice';

export function TeamsTab() {
  const dispatch = useDispatch();
  const { studentTeams, loading } = useSelector((state) => state.student);
  const { user } = useSelector((state) => state.auth);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [teamToView, setTeamToView] = useState(null);

  useEffect(() => {
    dispatch(fetchStudentTeams());
  }, [dispatch]);

  const teams = studentTeams?.data || [];

  const handleViewTeam = (team) => {
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
          <h3 className="text-foreground">My Teams</h3>
          <p className="text-sm text-muted-foreground">
            {teams.length} team{teams.length !== 1 ? 's' : ''} • {teams.filter(t => t.status === 'Active').length} active
          </p>
        </div>
      </div>

      {loading === false && teams.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Teams</h3>
          <p className="text-muted-foreground text-sm">
            You're not part of any teams yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, index) => (
            <div
              key={team._id}
              className={cn(
                'bg-card rounded-xl border border-border overflow-hidden',
                'card-interact gpu-accelerate',
                'animate-fade-in-up',
                `stagger-${(index % 10) + 1}`
              )}
            >
              {/* Team Header */}
              <div className="p-4 border-b border-border bg-muted/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-foreground mb-1">{team.teamName}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{team.linkedEvent?.name || 'No event linked'}</span>
                    </div>
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
                  {team.leader._id === user.id ? (
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
              </div>

              {/* Team Members */}
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Team Members</span>
                    <span className="text-sm text-foreground">{team.members.length + 1}</span>
                  </div>

                  {/* Member Avatars */}
                  <div className="flex items-center -space-x-2">
                    {team.members.slice(0, 4).map((member) => (
                      <Avatar 
                        key={member.member._id}
                        className="w-8 h-8 border-2 border-card ring-1 ring-border transition-transform duration-200 hover:scale-110 hover:z-10"
                      >
                        <AvatarImage src={member.member.profile?.profilePic} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(member.member.profile.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {team.members.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-card ring-1 ring-border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">+{team.members.length - 4}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleViewTeam(team)}
                  variant="outline"
                  className="w-full btn-interact"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Team
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ViewTeamMembersModal
        open={viewModalOpen}
        onClose={handleCloseModal}
        team={teamToView}
      />
    </div>
  );
}