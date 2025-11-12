import PropTypes from 'prop-types';
import { Users, Crown, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { cn } from '../../../../components/ui/utils';
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
} from '../../../../components/ui/alert-dialog';

// Mock data - replace with actual API data
const mockCreatedTeams = [
  {
    id: 'team_1',
    teamName: 'Code Warriors',
    leader: {
      name: 'John Doe',
      email: 'john@college.edu',
    },
    members: [
      { id: 'm1', name: 'Sarah Johnson', email: 'sarah@college.edu' },
      { id: 'm2', name: 'Mike Chen', email: 'mike@college.edu' },
      { id: 'm3', name: 'Emma Wilson', email: 'emma@college.edu' },
      { id: 'm4', name: 'Alex Brown', email: 'alex@college.edu' },
    ],
    createdAt: '2025-10-25',
  },
  {
    id: 'team_2',
    teamName: 'Tech Titans',
    leader: {
      name: 'John Doe',
      email: 'john@college.edu',
    },
    members: [
      { id: 'm5', name: 'Daniel Brown', email: 'daniel@college.edu' },
      { id: 'm6', name: 'Olivia Taylor', email: 'olivia@college.edu' },
    ],
    createdAt: '2025-11-01',
  },
  {
    id: 'team_3',
    teamName: 'Digital Pioneers',
    leader: {
      name: 'John Doe',
      email: 'john@college.edu',
    },
    members: [
      { id: 'm7', name: 'Noah Martinez', email: 'noah@college.edu' },
      { id: 'm8', name: 'Ava Anderson', email: 'ava@college.edu' },
      { id: 'm9', name: 'Liam Thomas', email: 'liam@college.edu' },
    ],
    createdAt: '2025-11-03',
  },
];

export function CreatedTeams() {
  const [teams] = useState(mockCreatedTeams);
  const [deleteTeam, setDeleteTeam] = useState(null);

  const handleEdit = (teamId) => {
    console.log('Edit team:', teamId);
    // Implement edit functionality
  };

  const handleDelete = (team) => {
    setDeleteTeam(team);
  };

  const confirmDelete = () => {
    if (deleteTeam) {
      console.log('Delete team:', deleteTeam.id);
      // Implement delete logic
      setDeleteTeam(null);
    }
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
          <h3 className="text-foreground">Created Teams</h3>
          <p className="text-sm text-muted-foreground">
            {teams.length} team{teams.length !== 1 ? 's' : ''} ready for events
          </p>
        </div>
      </div>

      {teams.length === 0 ? (
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
                        key={member.id}
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
                        key={member.id}
                        className="flex items-center gap-2 p-2 bg-muted/30 rounded text-xs"
                      >
                        <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px]">
                          {getInitials(member.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground truncate">{member.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    onClick={() => handleEdit(team.id)}
                    variant="outline"
                    className="flex-1 btn-interact"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(team)}
                    variant="outline"
                    className="btn-interact hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
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
              Are you sure you want to delete "{deleteTeam?.teamName}"? This action cannot be undone.
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
    </div>
  );
}