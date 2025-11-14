import { Users, Calendar, Crown, User, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '../ui/utils';

// Mock data - replace with actual API data
const teams = [
  {
    id: '1',
    name: 'CodeMasters',
    eventName: 'Tech Hackathon 2025',
    role: 'Leader',
    membersCount: 4,
    status: 'Active',
    members: [
      { id: '1', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
      { id: '2', name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
      { id: '3', name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
      { id: '4', name: 'Sarah Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    ],
  },
  {
    id: '2',
    name: 'AI Innovators',
    eventName: 'AI Workshop Series',
    role: 'Member',
    membersCount: 3,
    status: 'Active',
    members: [
      { id: '5', name: 'Alex Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
      { id: '6', name: 'Emma Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
      { id: '7', name: 'Chris Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris' },
    ],
  },
  {
    id: '3',
    name: 'Design Thinkers',
    eventName: 'Design Sprint Challenge',
    role: 'Leader',
    membersCount: 5,
    status: 'Completed',
    members: [
      { id: '8', name: 'Olivia Taylor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia' },
      { id: '9', name: 'Noah Martinez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah' },
      { id: '10', name: 'Ava Anderson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava' },
      { id: '11', name: 'Liam Thomas', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
      { id: '12', name: 'Sophia Garcia', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' },
    ],
  },
];

export function TeamsTab() {
  const handleViewTeam = (teamId) => {
    console.log('View team:', teamId);
    // Implement view team details
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
          <h3 className="text-foreground">My Teams</h3>
          <p className="text-sm text-muted-foreground">
            {teams.length} team{teams.length !== 1 ? 's' : ''} • {teams.filter(t => t.status === 'Active').length} active
          </p>
        </div>
      </div>

      {teams.length === 0 ? (
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
              key={team.id}
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
                    <h4 className="text-foreground mb-1">{team.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{team.eventName}</span>
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
                  {team.role === 'Leader' ? (
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
                    <span className="text-sm text-foreground">{team.membersCount}</span>
                  </div>

                  {/* Member Avatars */}
                  <div className="flex items-center -space-x-2">
                    {team.members.slice(0, 4).map((member) => (
                      <Avatar 
                        key={member.id}
                        className="w-8 h-8 border-2 border-card ring-1 ring-border transition-transform duration-200 hover:scale-110 hover:z-10"
                      >
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {team.membersCount > 4 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-card ring-1 ring-border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">+{team.membersCount - 4}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleViewTeam(team.id)}
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
    </div>
  );
}