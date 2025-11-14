import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Ban, Check, MapPin, Phone, Eye } from 'lucide-react';
import PropTypes from 'prop-types';

export function ViewAdModal({ open, onOpenChange, ad, onSuspend, onUnsuspend }) {
  // --- FIX: Logic extracted from nested ternary ---
  const getBadgeVariant = (status) => {
    if (status === 'Registered') return 'default';
    if (status === 'Suspended') return 'destructive';
    return 'secondary';
  };
  const badgeVariant = getBadgeVariant(ad.status);
  // --- End Fix ---

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{ad.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{ad.firmName}</p>
              <Badge 
                variant={badgeVariant} // Use the extracted variable
                className="mt-2"
              >
                {ad.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {ad.status === 'Registered' && onSuspend && (
                <button
                  onClick={onSuspend}
                  className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors micro-interact flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </button>
              )}
              {ad.status === 'Suspended' && onUnsuspend && (
                <button
                  onClick={onUnsuspend}
                  className="px-3 py-1.5 rounded-md bg-success text-success-foreground hover:bg-success-hover transition-colors micro-interact flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Unsuspend
                </button>
              )}
              <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {ad.poster && (
            <div className="w-full h-64 rounded-lg overflow-hidden bg-muted">
              <img src={ad.poster} alt={ad.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <h4 className="font-medium mb-3">Description</h4>
            <p className="text-sm text-muted-foreground">{ad.description}</p>
          </div>

          <div>
            <h4 className="font-medium mb-3">Contact Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Contact</span>
                  <p className="text-sm">{ad.contact}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Address</span>
                  <p className="text-sm">{ad.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Views</span>
                  <p>{ad.views || 0}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Published Date</span>
                <p>{new Date(ad.publishedDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

ViewAdModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  ad: PropTypes.shape({
    title: PropTypes.string.isRequired,
    firmName: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['Registered', 'Suspended']).isRequired,
    poster: PropTypes.string,
    description: PropTypes.string.isRequired,
    contact: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    views: PropTypes.number,
    publishedDate: PropTypes.string.isRequired,
  }).isRequired,
  onSuspend: PropTypes.func,
  onUnsuspend: PropTypes.func,
};