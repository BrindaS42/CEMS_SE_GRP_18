import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, CheckCircle, XCircle, Edit, AlertCircle, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ViewTeamModal } from './ViewTeamModal';

export function PendingTeamsTab({ teams, onMoveToCreated, onEditTeam, onDeleteTeam }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [teamToView, setTeamToView] = useState(null);

  const handleDeleteClick = (teamId) => {
    setTeamToDelete(teamId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (teamToDelete) {
      const team = teams.find(t => t.id === teamToDelete);
      onDeleteTeam(teamToDelete);
      
      // Notify members
      if (team) {
        team.members.forEach(member => {
          toast.info(`Notification sent to ${member.name}: Team "${team.name}" has been deleted.`);
        });
        toast.success(`Team "${team.name}" deleted and members notified`);
      }
      
      setTeamToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return (
          <Badge variant="outline" className="text-success border-success/50 bg-success/10 gap-1">
            <span>✅</span> Accepted
          </Badge>
        );
      case 'Declined':
        return (
          <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/10 gap-1">
            <span>❌</span> Declined
          </Badge>
        );
      case 'Pending':
      default:
        return (
          <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10 gap-1">
            <span>⏳</span> Pending
          </Badge>
        );
    }
  };

  const hasPendingMembers = (team) => {
    return team.members.some(m => m.status === 'Pending');
  };

  const handleMoveToCreated = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const pendingCount = team.members.filter(m => m.status === 'Pending').length;
    
    if (pendingCount > 0) {
      toast.success(`Team "${team.name}" moved to Created Teams. ${pendingCount} member(s) have not accepted yet.`);
    } else {
      toast.success(`Team "${team.name}" moved to Created Teams!`);
    }
    
    onMoveToCreated(teamId);
  };

  const handleViewTeam = (team) => {
    setTeamToView({
      id: team.id,
      name: team.name,
      leader: team.members.find(m => m.role === 'Leader')?.name || '',
      totalMembers: team.members.length,
      members: team.members,
      createdAt: team.createdAt,
    });
    setViewModalOpen(true);
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No pending teams</p>
        <p className="text-sm mt-2">Teams awaiting member responses will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => {
        const showWarning = hasPendingMembers(team);
        
        return (
          <Card key={team.id} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{team.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(team.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-3 flex-1">
              <div className="space-y-2">
                <p className="text-sm font-medium">Members ({team.members.length})</p>
                <ScrollArea className={team.members.length > 3 ? 'h-32' : ''}>
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div key={member.email} className="flex items-center justify-between gap-2 text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          {member.role === 'Leader' && (
                            <Badge variant="outline" className="text-xs mt-1">Leader</Badge>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(member.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {showWarning && (
                <Alert className="bg-warning/10 border-warning/50">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-warning text-sm">
                    Some members have not accepted yet. You can still move this team to Created.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-4">
              {/* View Button - Full Width */}
              <Button
                variant="outline"
                className="w-full text-primary border-primary/50 hover:bg-primary hover:text-black"
                onClick={() => handleViewTeam(team)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>

              {/* Action Buttons - Side by Side */}
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1 text-secondary border-secondary/50 hover:bg-secondary hover:text-black"
                  onClick={() => onEditTeam(team.id)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-destructive border-destructive/50 hover:bg-destructive hover:text-black"
                  onClick={() => handleDeleteClick(team.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>

              {/* Move to Created - Full Width */}
              <Button
                className="w-full"
                onClick={() => handleMoveToCreated(team.id)}
              >
                Move to Created
              </Button>
            </CardFooter>
          </Card>
        );
      })}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the team "{teams.find(t => t.id === teamToDelete)?.name}".
              All team members will be notified of this deletion. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete and Notify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Team Modal */}
      <ViewTeamModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setTeamToView(null);
        }}
        team={teamToView}
      />
    </div>
  );
}

PendingTeamsTab.propTypes = {
  teams: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['Pending', 'Accepted', 'Declined']).isRequired,
    })).isRequired,
  })).isRequired,
  onMoveToCreated: PropTypes.func.isRequired,
  onEditTeam: PropTypes.func.isRequired,
  onDeleteTeam: PropTypes.func.isRequired,
};