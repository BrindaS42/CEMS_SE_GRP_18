import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, UserPlus, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// Mock current logged-in organiser email
const CURRENT_USER_EMAIL = 'john@college.edu';

// These teams match the created teams in the Admin Panel
// Only showing Active teams (In Use teams are shown in Admin Panel only)
const teamsData = [
  {
    id: 1,
    name: 'Innovators',
    lead: 'Sarah Johnson',
    description: 'Cutting-edge tech innovation team',
    createdAt: '2025-10-20',
    status: 'In Use',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    ],
    members: [
      { name: 'Sarah Johnson', email: 'sarah@college.edu', role: 'Leader' },
      { name: 'Mike Chen', email: 'mike@college.edu', role: 'Member' },
      { name: 'Lisa Wang', email: 'lisa@college.edu', role: 'Member' },
      { name: 'Tom Baker', email: 'tom@college.edu', role: 'Member' },
      { name: 'Emma Davis', email: 'emma@college.edu', role: 'Member' },
      { name: 'John Doe', email: 'john@college.edu', role: 'Member' },
    ]
  },
  {
    id: 3,
    name: 'Code Warriors',
    lead: 'Daniel Brown',
    description: 'Elite programming and development team',
    createdAt: '2025-10-25',
    status: 'Active',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    ],
    members: [
      { name: 'Daniel Brown', email: 'daniel@college.edu', role: 'Leader' },
      { name: 'Olivia Taylor', email: 'olivia@college.edu', role: 'Member' },
      { name: 'James Wilson', email: 'james@college.edu', role: 'Member' },
      { name: 'John Doe', email: 'john@college.edu', role: 'Member' },
    ]
  },
  {
    id: 4,
    name: 'Digital Pioneers',
    lead: 'John Doe',
    description: 'Leading digital transformation initiatives',
    createdAt: '2025-10-26',
    status: 'Active',
    avatars: [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel',
    ],
    members: [
      { name: 'John Doe', email: 'john@college.edu', role: 'Leader' },
      { name: 'Chris Garcia', email: 'chris@college.edu', role: 'Member' },
      { name: 'Rachel Green', email: 'rachel@college.edu', role: 'Member' },
      { name: 'Kevin White', email: 'kevin@college.edu', role: 'Member' },
      { name: 'Amy Chen', email: 'amy@college.edu', role: 'Member' },
      { name: 'Sam Murphy', email: 'sam@college.edu', role: 'Member' },
    ]
  },
];

export function TeamsTab({ onNavigate }) {
  // Filter teams to only show those where current user is a participant
  const userTeams = teamsData.filter(team => 
    team.members.some(member => member.email === CURRENT_USER_EMAIL)
  );

  const handleViewMembers = (teamId) => {
    // Navigate to Admin Panel and highlight the team
    onNavigate('admin', { highlightTeamId: teamId });
  };

  const handleAddMember = (teamId) => {
    // Navigate to Admin Panel and open edit modal for this team
    onNavigate('admin', { editTeamId: teamId });
  };

  if (userTeams.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>You are not part of any team yet</p>
        <p className="text-sm mt-2">Teams you create or join will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {userTeams.map((team, index) => (
        <Card 
          key={team.id} 
          className={`hover:shadow-lg hover:translate-y-[-2px] hover:scale-[1.01] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary icon-interact" />
              {team.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{team.description}</p>
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Team Lead:</span>
                <span className="ml-2 text-foreground">{team.lead}</span>
              </div>
              
              <div className="text-sm">
                <span className="text-muted-foreground">Members:</span>
                <span className="ml-2 text-foreground">{team.members.length}</span>
              </div>
            </div>

            {/* Team Members Avatars */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {team.avatars.map((avatar) => (
                  <Avatar key={avatar} className="w-8 h-8 border-2 border-card ring-1 ring-primary/20">
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">M</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {team.members.length > 3 && (
                <span className="text-xs text-muted-foreground">+{team.members.length - 3} more</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => handleViewMembers(team.id)} 
                variant="outline"
                className="flex-1 gap-2"
              >
                <Eye className="w-4 h-4 icon-interact" />
                View
              </Button>
              <Button 
                onClick={() => handleAddMember(team.id)} 
                className="flex-1 gap-2"
              >
                <UserPlus className="w-4 h-4 icon-interact" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

TeamsTab.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};