import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Archive, Users, Crown, Eye } from 'lucide-react';
import { ViewTeamModal } from './ViewTeamModal';

export function ArchivedTeamsTab({ teams }) {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [teamToView, setTeamToView] = useState(null);

  const handleViewTeam = (team) => {
    setTeamToView({
      id: team.id,
      name: team.name,
      leader: team.leader,
      totalMembers: team.members.length,
      members: team.members,
      createdAt: team.archivedAt,
    });
    setViewModalOpen(true);
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No archived teams</p>
        <p className="text-sm mt-2">Deleted teams will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="opacity-75 hover:opacity-100 transition-opacity flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant="outline" className="text-muted-foreground border-muted-foreground/50 bg-muted/10">
                  {team.reason === 'deleted' ? 'Deleted' : 'Archived'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {team.reason === 'deleted' ? 'Deleted' : 'Archived'}: {new Date(team.archivedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <Crown className="w-4 h-4 text-secondary" />
                <span className="text-muted-foreground">Leader:</span>
                <span className="font-medium">{team.leader}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Total Members:</span>
                <span className="font-medium">{team.members.length}</span>
              </div>

              {/* Member List */}
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium mb-2">Team Members</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {team.members.map((member) => (
                    <div key={member.name} className="text-sm flex items-center justify-between">
                      <span className="text-muted-foreground">{member.name}</span>
                      {member.role === 'Leader' && (
                        <Crown className="w-3 h-3 text-secondary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                variant="outline"
                className="w-full text-primary border-primary/50 hover:bg-primary hover:text-black"
                onClick={() => handleViewTeam(team)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
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

ArchivedTeamsTab.propTypes = {
  teams: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    leader: PropTypes.string.isRequired,
    archivedAt: PropTypes.string.isRequired,
    reason: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    })).isRequired,
  })).isRequired,
};