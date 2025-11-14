import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Calendar, Archive, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ViewTeamModal } from './ViewTeamModal';

const inUseTeamsData = [
  {
    id: 1,
    name: 'Innovators',
    leader: 'Sarah Johnson',
    totalMembers: 5,
    eventName: 'Tech Symposium 2024',
    eventDate: '2024-11-15',
    createdAt: '2025-10-20',
    status: 'Active',
    members: [
      { name: 'Sarah Johnson', email: 'sarah@college.edu', role: 'Leader', status: 'Accepted' },
      { name: 'Mike Chen', email: 'mike@college.edu', role: 'Member', status: 'Accepted' },
      { name: 'Lisa Wang', email: 'lisa@college.edu', role: 'Member', status: 'Accepted' },
      { name: 'Tom Baker', email: 'tom@college.edu', role: 'Member', status: 'Accepted' },
      { name: 'Emma Davis', email: 'emma@college.edu', role: 'Member', status: 'Pending' },
    ],
  },
  {
    id: 2,
    name: 'Tech Giants',
    leader: 'Alex Martinez',
    totalMembers: 4,
    eventName: 'Annual Hackathon',
    eventDate: '2024-12-01',
    createdAt: '2025-10-22',
    status: 'Active',
    members: [
      { name: 'Alex Martinez', email: 'alex@college.edu', role: 'Leader', status: 'Accepted' },
      { name: 'Nina Patel', email: 'nina@college.edu', role: 'Member', status: 'Accepted' },
      { name: 'Ryan Lee', email: 'ryan@college.edu', role: 'Member', status: 'Accepted' },
      { name: 'Sophia Kim', email: 'sophia@college.edu', role: 'Member', status: 'Accepted' },
    ],
  },
];

export function InUseTeamsTab() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [teamToView, setTeamToView] = useState(null);

  const handleMarkCompleted = (teamId) => {
    console.log('Mark team as completed:', teamId);
    toast.success('Team marked as completed');
  };

  const handleArchive = (teamId) => {
    console.log('Archive team:', teamId);
    toast.success('Team archived');
  };

  const handleViewTeam = (team) => {
    setTeamToView({
      id: team.id,
      name: team.name,
      leader: team.leader,
      totalMembers: team.totalMembers,
      members: team.members,
      createdAt: team.createdAt,
      eventName: team.eventName,
      eventDate: team.eventDate,
      status: 'In Use',
    });
    setViewModalOpen(true);
  };

  if (inUseTeamsData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No teams in use</p>
        <p className="text-sm mt-2">Teams assigned to events will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inUseTeamsData.map((team) => (
          <Card key={team.id} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant="outline" className="text-info border-info/50 bg-info/10">
                  In Use
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-accent" />
                <div className="flex-1">
                  <p className="font-medium">{team.eventName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(team.eventDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-secondary" />
                <span className="text-muted-foreground">Leader:</span>
                <span className="font-medium">{team.leader}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Total Members:</span>
                <span className="font-medium">{team.totalMembers}</span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-4">
              {/* View Button - Full Width */}
              <Button
                variant="outline"
                className="w-full text-primary border-primary/50 hover:bg-primary hover:text-black"
                onClick={() => handleViewTeam(team)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Team
              </Button>
              
              {/* Action Buttons - Side by Side */}
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 text-secondary border-secondary/50 hover:bg-secondary hover:text-black"
                  onClick={() => handleMarkCompleted(team.id)}
                >
                  Mark Completed
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-destructive border-destructive/50 hover:bg-destructive hover:text-black"
                  onClick={() => handleArchive(team.id)}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* View Team Modal */}
      <ViewTeamModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setTeamToView(null);
        }}
        team={teamToView}
      />
    </>
  );
}

// No prop-types needed as this component doesn't accept props