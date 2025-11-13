import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Crown, Users, Calendar } from 'lucide-react';
import { ScrollArea } from '../../../components/ui/scroll-area';

export function ViewTeamModal({ open, onClose, team }) {
  if (!team) return null;

  const getStatusBadge = (status) => {
    if (!status || status === 'Accepted') {
      return <Badge variant="outline" className="text-success border-success/50 bg-success/10 text-xs">✅ Accepted</Badge>;
    }
    if (status === 'Declined') {
      return <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/10 text-xs">❌ Declined</Badge>;
    }
    return <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10 text-xs">⏳ Pending</Badge>;
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
            {team.status && (
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
          {/* Event Information (if applicable) */}
          {team.eventName && team.eventDate && (
            <div className="p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 text-sm mb-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="font-medium">Assigned Event</span>
              </div>
              <p className="text-sm font-medium ml-6">{team.eventName}</p>
              <p className="text-xs text-muted-foreground ml-6">
                {new Date(team.eventDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          )}

          {/* Team Leader */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold">Team Leader</h3>
            </div>
            <div className="p-4 border border-border rounded-lg bg-muted/30">
              {team.members
                .filter(m => m.role === 'Leader')
                .map((leader) => (
                  <div key={leader.email} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{leader.name}</p>
                      <p className="text-sm text-muted-foreground">{leader.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(leader.status)}
                      <Crown className="w-4 h-4 text-secondary" />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">
                Team Members ({team.members.filter(m => m.role === 'Member').length})
              </h3>
            </div>
            
            <ScrollArea className={team.members.filter(m => m.role === 'Member').length > 5 ? 'h-64 pr-4' : ''}>
              <div className="space-y-2">
                {team.members
                  .filter(m => m.role === 'Member')
                  .map((member) => (
                    <div 
                      key={member.email} 
                      className="p-4 border border-border rounded-lg bg-background hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        <div className="flex-shrink-0">
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
                <p className="font-semibold text-lg">{team.totalMembers}</p>
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
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['Leader', 'Member']).isRequired,
  status: PropTypes.oneOf(['Pending', 'Accepted', 'Declined']),
});

ViewTeamModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  team: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    leader: PropTypes.string.isRequired,
    totalMembers: PropTypes.number.isRequired,
    members: PropTypes.arrayOf(teamMemberShape).isRequired,
    createdAt: PropTypes.string,
    eventName: PropTypes.string,
    eventDate: PropTypes.string,
    status: PropTypes.oneOf(['Active', 'In Use', 'Completed']),
  }),
};