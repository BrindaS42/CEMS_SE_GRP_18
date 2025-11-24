import PropTypes from 'prop-types';
import { Users, CheckCircle, Clock, XCircle, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { cn } from '@/Components/ui/utils';
import { useState, useEffect, useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { fetchStudentTeams, deleteStudentTeam, updateStudentTeam } from '@/Store/student.slice';
import { EditStudentTeamModal } from './EditStudentTeamModal';

export function PendingTeams({ onMoveToCreated }) {
  const dispatch = useDispatch();
  const { studentTeams, loading } = useSelector((state) => state.student);
  const { user } = useSelector((state) => state.auth);
  const [deleteTeam, setDeleteTeam] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);

  useEffect(() => {
    dispatch(fetchStudentTeams());
  }, [dispatch]);

  
  const teams = useMemo(() => {
    if (!studentTeams.data || !user) return [];

    return studentTeams.data.filter(team => 
      team.leader._id === user.id &&
      team.members.some(m => m.status === 'Pending') && 
      !team.isRegisteredForEvent
    );
  }, [studentTeams.data, user]);
  
  console.log('Student Teams:', studentTeams);
  console.log('Filtered Pending Teams:', teams);
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

  const handleEdit = (team) => {
    setTeamToEdit(team);
    setEditModalOpen(true);
  };

  const handleSaveTeam = async (teamId, updatedData) => {
    const promise = dispatch(updateStudentTeam({ teamId, updatedData })).unwrap();
    toast.promise(promise, {
      loading: 'Saving changes...',
      success: 'Team updated successfully!',
      error: (err) => err || 'Failed to update team.',
    });
    setEditModalOpen(false);
    setTeamToEdit(null);
  };

  const handleDelete = (team) => {
    setDeleteTeam(team);
  };

  const confirmDelete = () => {
    if (deleteTeam) {
      const promise = dispatch(deleteStudentTeam(deleteTeam._id)).unwrap();
      toast.promise(promise, {
        loading: `Deleting team "${deleteTeam.teamName}"...`,
        success: `Team "${deleteTeam.teamName}" deleted.`,
        error: (err) => err || 'Failed to delete team.',
      });
      setDeleteTeam(null);
    }
  };

  console.log('Pending Teams:', teams);
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

      {loading === false && teams.length === 0 ? (
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
            const approvedCount = team.members.filter(m => m.status === 'Approved' || m.status === 'Accepted').length;
            const rejectedCount = team.members.filter(m => m.status === 'Rejected').length;

            return (
              <div
                key={team._id}
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
                          key={member.member._id}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getStatusIcon(member.status)}
                            <span className="text-foreground truncate">{member.member.profile.name}</span>
                          </div>
                          {getStatusBadge(member.status)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                     <Button
                      onClick={() => handleEdit(team)}
                      variant="outline"
                      className="flex-1 btn-interact"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(team)}
                      variant="outline"
                      className="flex-1 btn-interact hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
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
      <AlertDialog open={!!deleteTeam} onOpenChange={() => setDeleteTeam(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTeam?.teamName}"? This will withdraw all pending invitations and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Team Modal */}
      <EditStudentTeamModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setTeamToEdit(null);
        }}
        onSave={handleSaveTeam}
        team={teamToEdit}
      />
    </div>
  );
}

PendingTeams.propTypes = {
  onMoveToCreated: PropTypes.func,
};