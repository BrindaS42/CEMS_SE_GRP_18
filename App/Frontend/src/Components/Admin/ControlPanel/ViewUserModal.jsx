import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Ban, Check, Mail, Phone, Building, Calendar, Users, Trophy, User as UserIcon } from 'lucide-react';

export function ViewUserModal({
  open,
  onOpenChange,
  user,
  onSuspend,
  onUnsuspend,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <DialogTitle className="truncate">{user.profile?.name || 'Unnamed User'}</DialogTitle>
              <Badge
                variant={user.status === 'active' ? 'default' : 'destructive'}
                className="mt-1"
              >
                {user.role} - {user.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {user.status === 'active' && onSuspend && (
                <button
                  onClick={onSuspend}
                  className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors micro-interact flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </button>
              )}
              {user.status === 'suspended' && onUnsuspend && (
                <button
                  onClick={onUnsuspend}
                  className="px-3 py-1.5 rounded-md bg-success text-success-foreground hover:bg-success-hover transition-colors micro-interact flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Unsuspend
                </button>
              )}
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Contact Information */}
          <div>
            <h4 className="font-medium mb-3">Contact Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
              {user.profile?.contactNo && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <p className="text-sm">{user.profile.contactNo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* College Information */}
          <div>
            <h4 className="font-medium mb-3">College Information</h4>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-sm text-muted-foreground">College</span>
                <p>{user.college?.name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Registration Date */}
          <div>
            <h4 className="font-medium mb-3">Registration Information</h4>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <span className="text-sm text-muted-foreground">Registered On</span>
                <p>{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div>
            <h4 className="font-medium mb-3">Activity Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Role</span>
                  <p>{user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Events Participated</span>
                  <p>{user.eventsParticipated || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

ViewUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    profile: PropTypes.shape({
      name: PropTypes.string,
      contactNo: PropTypes.string,
    }),
    email: PropTypes.string.isRequired,
    college: PropTypes.shape({
      name: PropTypes.string,
    }),
    role: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['active', 'suspended']).isRequired,
    eventsParticipated: PropTypes.number,
  }).isRequired,
  onSuspend: PropTypes.func,
  onUnsuspend: PropTypes.func,
};