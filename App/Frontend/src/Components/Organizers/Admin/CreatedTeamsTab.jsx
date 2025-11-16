import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Edit, Trash2, Lock, Eye } from 'lucide-react';
import { toast } from 'sonner';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ViewTeamModal } from './ViewTeamModal';

export function CreatedTeamsTab({ 
  teams, 
  onDeleteTeam, 
  onEditTeam, 
  highlightTeamId, 
  onHighlightComplete,
  currentUserEmail
}) {
  const { teamList } = useSelector((state) => state.team);
  const { user } = useSelector((state) => state.auth);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [highlightedTeam, setHighlightedTeam] = useState(null);
  const teamRefs = useRef({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [teamToView, setTeamToView] = useState(null);

  // Handle highlighting when highlightTeamId changes
  useEffect(() => {
    if (highlightTeamId) {
      setHighlightedTeam(highlightTeamId);
      
      // Scroll to the team
      setTimeout(() => {
        const teamElement = teamRefs.current[highlightTeamId];
        if (teamElement) {
          teamElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      // Flash yellow twice (2 flashes = 4 transitions)
      setTimeout(() => {
        setHighlightedTeam(null);
        if (onHighlightComplete) {
          onHighlightComplete();
        }
      }, 2000);
    }
  }, [highlightTeamId, onHighlightComplete]);

  const handleDeleteClick = (teamId) => {
    setTeamToDelete(teamId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (teamToDelete) {
      const team = teams.find(t => t.id === teamToDelete);
      onDeleteTeam(teamToDelete);
      toast.success(`Team "${team?.name}" deleted successfully`);
      setTeamToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status || status === 'Approved') {
      return (
        <Badge variant="outline" className="text-success border-success/50 bg-success/10 gap-1 text-xs">
          ✅ Accepted
        </Badge>
      );
    }
    
    if (status === 'Rejected') {
      return (
        <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/10 gap-1 text-xs">
          ❌ Declined
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10 gap-1 text-xs">
        ⏳ Pending
      </Badge>
    );
  };

  const canUserEdit = (team) => {
    const leaderMember = team.leader;
    if (leaderMember && leaderMember === user.profile.name) return true;
    return false; // Or add other roles that can edit here.
  };

  const handleViewTeam = (team) => {
    setTeamToView(team);
    setViewModalOpen(true);
  };

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No created teams yet</p>
        <p className="text-sm mt-2">Teams with all members confirmed will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((teamFromList) => {
          const userCanEdit = canUserEdit(teamFromList);
          const team = teamList.find(t => t._id === teamFromList.id);
          
          return (
            <div 
              key={teamFromList.id} 
              ref={(el) => (teamRefs.current[teamFromList.id] = el)}
              className="h-full"
            >
              <Card 
                className={`h-full flex flex-col hover:shadow-lg transition-all duration-500 ${
                  highlightedTeam === teamFromList.id ? 'bg-warning/20 border-warning animate-pulse' : ''
                }`}
              >
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{teamFromList.name}</CardTitle>
                  {teamFromList.status === 'Active' ? (
                    <Badge variant="outline" className="text-success border-success/50 bg-success/10">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-info border-info/50 bg-info/10">
                      In Use
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(teamFromList.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3 flex-grow flex flex-col">
                <div className="flex items-center gap-2 text-sm flex-shrink-0">
                  <Crown className="w-4 h-4 text-secondary" />
                  <span className="text-muted-foreground">Leader:</span>
                  <span className="font-medium">{teamFromList.leader}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm flex-shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Total Members:</span>
                  <span className="font-medium">{teamFromList.totalMembers}</span>
                </div>

                {/* Member List with Status Badges */}
                <div className="pt-2 border-t border-border flex-grow flex flex-col min-h-0">
                  <p className="text-sm font-medium mb-2 flex-shrink-0">Team Members</p>
                  <div className="space-y-2 overflow-y-auto flex-grow">
                    {teamFromList.members.map((member) => (
                      <div key={member.email} className="text-sm flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <span className="text-muted-foreground truncate">{member.name}</span>
                          {member.role === 'Leader' && (
                            <Crown className="w-3 h-3 text-secondary flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(member.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Access control notice */}
                {!userCanEdit && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                    <Lock className="w-3 h-3" />
                    <span>View-only access</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-2 pt-4 flex-shrink-0">
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full text-secondary border-secondary/50 hover:bg-secondary hover:text-black"
                            onClick={() => onEditTeam(teamFromList.id)}
                            disabled={!userCanEdit}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!userCanEdit && (
                        <TooltipContent>
                          <p>Only accepted members can edit</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full text-destructive border-destructive/50 hover:bg-destructive hover:text-black"
                            onClick={() => handleDeleteClick(teamFromList.id)}
                            disabled={!userCanEdit}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!userCanEdit && (
                        <TooltipContent>
                          <p>Only accepted members can delete</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardFooter>
            </Card>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the team "{teams.find(t => t.id === teamToDelete)?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
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
    </>
  );
}

CreatedTeamsTab.propTypes = {
  teams: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    leader: PropTypes.string.isRequired,
    totalMembers: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['Active', 'In Use']).isRequired,
    members: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['Pending', 'Accepted', 'Declined']),
    })).isRequired,
  })).isRequired,
  onDeleteTeam: PropTypes.func.isRequired,
  onEditTeam: PropTypes.func.isRequired,
  highlightTeamId: PropTypes.number,
  onHighlightComplete: PropTypes.func,
  currentUserEmail: PropTypes.string,
};

CreatedTeamsTab.defaultProps = {
  currentUserEmail: 'john@college.edu',
};