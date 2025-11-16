import PropTypes from 'prop-types';
import { Users, Crown, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';
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
} from '@/components/ui/alert-dialog';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { fetchStudentTeams, deleteStudentTeam, updateStudentTeam } from '@/store/student.slice';
import { EditStudentTeamModal } from './EditStudentTeamModal';

export function CreatedTeams() {
  const dispatch = useDispatch();
  const { studentTeams, loading } = useSelector((state) => state.student);
  const [deleteTeam, setDeleteTeam] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);

  useEffect(() => {
    dispatch(fetchStudentTeams());
  }, [dispatch]);

  const teams = useMemo(() => {
    if (!studentTeams.leader) return [];
    return studentTeams.leader.filter(team => {
      const hasPending = team.members.some(m => m.status === 'Pending');
      return !hasPending && !team.isRegisteredForEvent;
    });
  }, [studentTeams.leader]);

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
          <h3 className="text-foreground">Created Teams</h3>
          <p className="text-sm text-muted-foreground">
            {teams.length} team{teams.length !== 1 ? 's' : ''} ready for events
          </p>
        </div>
      </div>

      {loading === false && teams.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Created Teams</h3>
          <p className="text-muted-foreground text-sm">
            Your finalized teams will appear here
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
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-foreground mb-1">{team.teamName}</h4>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(team.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Badge className="bg-success text-success-foreground">Active</Badge>
                </div>

                {/* Leader Info */}
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-3.5 h-3.5 text-secondary" />
                    <p className="text-xs text-muted-foreground">Team Leader</p>
                  </div>
                  <p className="text-sm text-foreground">{team.leader.name}</p>
                  <p className="text-xs text-muted-foreground">{team.leader.email}</p>
                </div>

                {/* Members */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Team Members</p>
                    <p className="text-xs text-foreground">{team.members.length}</p>
                  </div>

                  {/* Member Avatars */}
                  <div className="flex items-center -space-x-2">
                    {team.members.slice(0, 5).map((member) => (
                      <div
                        key={member.member._id}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs border-2 border-card ring-1 ring-border transition-transform duration-200 hover:scale-110 hover:z-10"
                        title={member.name}
                      >
                        {getInitials(member.name)}
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

                  {/* Members List (expandable on hover/click) */}
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {team.members.map((member) => (
                      <div
                        key={member.member._id}
                        className="flex items-center gap-2 p-2 bg-muted/30 rounded text-xs"
                      >
                        <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px]">
                          {getInitials(member.member.profile.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground truncate">{member.member.profile.name}</p>
                        </div>
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTeam} onOpenChange={() => setDeleteTeam(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTeam?.teamName}"? This will also remove it from any events it's registered with and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
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