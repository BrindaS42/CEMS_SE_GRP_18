import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Crown, Users, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';

export function ViewTeamModal({ open, onClose, team }) {
  if (!team) return null;

  const getStatusBadge = (status) => {
    if (status === 'Approved') {
      return <Badge variant="outline" className="text-success border-success/50 bg-success/10 text-xs gap-1"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
    }
    if (status === 'Rejected') {
      return <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/10 text-xs gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
    }
    return <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10 text-xs gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
  };

  // Refactored nested ternary for team status badge
  const getTeamStatusBadge = () => {
    if (team.status === 'Active') {
      return 'text-success border-success/50 bg-success/10';
    }
    if (team.status === 'In Use') {
      return 'text-info border-info/50 bg-info/10';
    }
    return 'text-muted-foreground border-muted bg-muted/10';
  };

  const leader = team.leader;
  const members = team.members || [];
  const totalMembers = members.length + (leader ? 1 : 0);
  const hasPendingMembers = members.some(m => m.status === 'Pending');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{team.name}</DialogTitle>
              <DialogDescription>
                View team details and member information
              </DialogDescription>
            </div>
            {hasPendingMembers ? (
              <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10">Pending</Badge>
            ) : (
              <Badge 
                variant="outline" 
                className={getTeamStatusBadge()}
              >
                {team.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Team Leader */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold">Team Leader</h3>
            </div>
            {leader ? (
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${leader.profile?.name}`} />
                      <AvatarFallback>{leader.profile?.name?.charAt(0) || 'L'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{leader.profile?.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{leader.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
                    <Crown className="w-4 h-4" />
                    Leader
                  </div>
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground">No leader assigned.</p>}
          </div>

          {/* Team Members */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Team Members ({members.length})</h3>
            </div>
            
            <ScrollArea className={members.length > 4 ? 'h-64 pr-4' : ''}>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.user?._id || member._id} className="p-4 border border-border rounded-lg bg-background hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user?.profile?.name}`} />
                          <AvatarFallback>{member.user?.profile?.name?.charAt(0) || 'M'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{member.user?.profile?.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{member.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{member.role}</Badge>
                        {getStatusBadge(member.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Team Summary */}
          <div className="p-4 border border-border rounded-lg bg-muted/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Members</span>
                <p className="font-semibold text-lg">{totalMembers}</p>
              </div>
              {team.createdAt && (
                <div>
                  <span className="text-muted-foreground">Created On</span>
                  <p className="font-semibold text-lg">
                    {new Date(team.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const teamMemberShape = PropTypes.shape({
  user: PropTypes.shape({
    _id: PropTypes.string,
    profile: PropTypes.shape({ name: PropTypes.string }),
    email: PropTypes.string,
  }),
  role: PropTypes.string,
  status: PropTypes.string,
});

ViewTeamModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  team: PropTypes.shape({
    name: PropTypes.string.isRequired,
    leader: PropTypes.object,
    members: PropTypes.arrayOf(teamMemberShape).isRequired,
    createdAt: PropTypes.string,
  }),
};