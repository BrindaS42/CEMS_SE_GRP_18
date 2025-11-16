import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User, Crown, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ViewTeamMembersModal({ open, onClose, team }) {
  if (!team) return null;

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status) => {
    if (status === 'Accepted' || status === 'Approved') {
      return <Badge variant="outline" className="text-success border-success/50 bg-success/10 text-xs gap-1"><CheckCircle className="w-3 h-3" /> Accepted</Badge>;
    }
    if (status === 'Rejected') {
      return <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/10 text-xs gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
    }
    // Default to Pending
    return <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10 text-xs gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
  };

  const allMembers = [
    { ...team.leader, isLeader: true, status: 'Accepted' }, 
    ...team.members
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Team: {team.teamName}</DialogTitle>
          <DialogDescription>
            Viewing members of the team linked to "{team.linkedEvent?.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* Leader Info */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Crown className="w-4 h-4 text-secondary" />
              Team Leader
            </span>
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-foreground">{team.leader?.profile?.name || team.leader?.name}</p>
                  <p className="text-xs text-muted-foreground">{team.leader?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Team Members ({team.members.length + 1})</span>
            <div className="space-y-2">
              {allMembers.map((member) => {
                const user = member.isLeader ? member : member.member;
                return (<div key={user._id} className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                  <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs">{getInitials(user.profile?.name || user.name)}</div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{user.profile?.name || user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(member.status)}
                  </div>
                </div>);
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

ViewTeamMembersModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  team: PropTypes.shape({
    teamName: PropTypes.string,
    leader: PropTypes.object,
    name: PropTypes.string, // Adding name for compatibility with TeamsTab
    members: PropTypes.array,
    linkedEvent: PropTypes.object,
  }),
};