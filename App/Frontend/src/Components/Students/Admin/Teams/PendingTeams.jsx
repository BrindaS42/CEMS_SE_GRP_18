import PropTypes from 'prop-types';
import { Users, CheckCircle, Clock, XCircle, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
import { useState } from 'react';
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

// Mock data - replace with actual API data
const mockPendingTeams = [
  {
    id: 'pending_1',
    teamName: 'Innovation Squad',
    leader: {
      name: 'John Doe',
      email: 'john@college.edu',
    },
    members: [
      { id: 'm1', name: 'Sarah Johnson', email: 'sarah@college.edu', status: 'Approved' },
      { id: 'm2', name: 'Mike Chen', email: 'mike@college.edu', status: 'Pending' },
      { id: 'm3', name: 'Emma Wilson', email: 'emma@college.edu', status: 'Pending' },
    ],
    createdAt: '2025-11-05',
  },
  {
    id: 'pending_2',
    teamName: 'Creative Minds',
    leader: {
      name: 'John Doe',
      email: 'john@college.edu',
    },
    members: [
      { id: 'm4', name: 'Alex Brown', email: 'alex@college.edu', status: 'Pending' },
      { id: 'm5', name: 'Olivia Taylor', email: 'olivia@college.edu', status: 'Rejected' },
    ],
    createdAt: '2025-11-07',
  },
];

export function PendingTeams({ onMoveToCreated }) {
  const [teams] = useState(mockPendingTeams);
  const [confirmTeam, setConfirmTeam] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-success text-success-foreground">Accepted</Badge>;
      case 'Rejected':
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>;
      default:
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
    }
  };

  const getPendingCount = (team) => {
    return team.members.filter(m => m.status === 'Pending').length;
  };

  const handleCreateTeam = (team) => {
    const pendingCount = getPendingCount(team);
    
    if (pendingCount > 0) {
      setConfirmTeam(team);
    } else {
      finalizeTeam(team);
    }
  };

  const finalizeTeam = (team) => {
    console.log('Finalizing team:', team);
    // Implement team finalization logic
    // Move to Created tab
    if (onMoveToCreated) {
      onMoveToCreated();
    }
    setConfirmTeam(null);
  };

  const handleEdit = (teamId) => {
    console.log('Edit team:', teamId);
    // Implement edit functionality
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-foreground">Pending Teams</h3>
          <p className="text-sm text-muted-foreground">
            Teams awaiting member confirmation
          </p>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Pending Teams</h3>
          <p className="text-muted-foreground text-sm">
            Teams with pending invitations will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, index) => {
            const pendingCount = getPendingCount(team);
            const approvedCount = team.members.filter(m => m.status === 'Approved').length;
            const rejectedCount = team.members.filter(m => m.status === 'Rejected').length;

            return (
              <div
                key={team.id}
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
                        Created {new Date(team.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-warning/10 border-warning text-warning">
                      Pending
                    </Badge>
                  </div>

                  {/* Leader */}
                  <div className="p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Team Leader</p>
                    <p className="text-sm text-foreground">{team.leader.name}</p>
                  </div>

                  {/* Members Status Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Members ({team.members.length})</span>
                      <div className="flex gap-2">
                        {approvedCount > 0 && (
                          <span className="text-success flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {approvedCount}
                          </span>
                        )}
                        {pendingCount > 0 && (
                          <span className="text-warning flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {pendingCount}
                          </span>
                        )}
                        {rejectedCount > 0 && (
                          <span className="text-destructive flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {rejectedCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Members List */}
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {team.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getStatusIcon(member.status)}
                            <span className="text-foreground truncate">{member.name}</span>
                          </div>
                          {getStatusBadge(member.status)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      onClick={() => handleCreateTeam(team)}
                      className="flex-1 btn-interact"
                    >
                      Create Team
                    </Button>
                    <Button
                      onClick={() => handleEdit(team.id)}
                      variant="outline"
                      size="sm"
                      className="btn-interact"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Warning if pending invites */}
                  {pendingCount > 0 && (
                    <p className="text-xs text-warning flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {pendingCount} member{pendingCount !== 1 ? 's' : ''} haven't responded
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmTeam} onOpenChange={() => setConfirmTeam(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Team with Pending Invites?</AlertDialogTitle>
            <AlertDialogDescription>
              Some members have not accepted the invites yet. You can still create the team, and
              pending members can join later when they accept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmTeam && finalizeTeam(confirmTeam)}>
              Create Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

PendingTeams.propTypes = {
  onMoveToCreated: PropTypes.func,
};