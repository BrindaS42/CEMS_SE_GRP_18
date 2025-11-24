import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { X, Check, Ban } from 'lucide-react';

export function ViewCollegeModal({
  open,
  onOpenChange,
  college,
  onAccept,
  onReject,
  onSuspend,
  onUnsuspend,
}) {
  // Refactored nested ternary to a helper function/variable
  const getBadgeVariant = (status) => {
    if (status === 'Pending') return 'secondary';
    if (status === 'Approved') return 'default';
    return 'destructive'; // For 'Suspended' or any other status
  };
  const badgeVariant = getBadgeVariant(college.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                {college.logo ? (
                  <img src={college.logo} alt={college.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl">{college.name[0]}</span>
                )}
              </div>
              <div>
                <DialogTitle>{college.name}</DialogTitle>
                <Badge variant={badgeVariant} className="mt-1">
                  {college.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {college.status === 'Pending' && onAccept && (
                <button
                  onClick={onAccept}
                  className="px-3 py-1.5 rounded-md bg-success text-success-foreground hover:bg-success-hover transition-colors micro-interact flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </button>
              )}
              {college.status === 'Pending' && onReject && (
                <button
                  onClick={onReject}
                  className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors micro-interact flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              )}
              {college.status === 'Approved' && onSuspend && (
                <button
                  onClick={onSuspend}
                  className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors micro-interact flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </button>
              )}
              {college.status === 'Suspended' && onUnsuspend && (
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
          {/* Basic Information */}
          <div>
            <h4 className="font-medium mb-3">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Registration Date</span>
                <p>{new Date(college.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <p>{college.status}</p>
              </div>
            </div>
          </div>

          {/* Point of Contact */}
          <div>
            <h4 className="font-medium mb-3">Point of Contact</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Name</span>
                <p>{college.poc?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email</span>
                <p>{college.poc?.contactEmail || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Phone</span>
                <p>{college.poc?.contactNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          {college.address && (
            <div>
              <h4 className="font-medium mb-3">Address</h4>
              <p className="text-sm">
                {`${college.address.localAddress || ''}, ${college.address.city || ''}, ${college.address.state || ''} - ${college.address.pincode || ''}, ${college.address.country || ''}`}
              </p>
            </div>
          )}

          {/* Website */}
          {college.website && (
            <div>
              <h4 className="font-medium mb-3">Website</h4>
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                {college.website}
              </a>
            </div>
          )}

          {/* Description */}
          {college.description && (
            <div>
              <h4 className="font-medium mb-3">Description</h4>
              <p className="text-sm text-muted-foreground">{college.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

ViewCollegeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  college: PropTypes.shape({
    logo: PropTypes.string,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    poc: PropTypes.shape({
      name: PropTypes.string,
      contactEmail: PropTypes.string,
      contactNumber: PropTypes.string,
    }),
    address: PropTypes.shape({
      localAddress: PropTypes.string,
      city: PropTypes.string,
    }),
    website: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  onSuspend: PropTypes.func,
  onUnsuspend: PropTypes.func,
};