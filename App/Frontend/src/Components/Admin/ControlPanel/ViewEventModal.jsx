import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { X, Ban, Check, Calendar, MapPin, Users, Building } from 'lucide-react';
import PropTypes from 'prop-types';

export function ViewEventModal({
  open,
  onOpenChange,
  event,
  onSuspend,
  onUnsuspend,
}) {
  // --- FIX 1: Logic extracted from nested ternary ---
  const getEventBadgeVariant = (status) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'suspended':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  const eventBadgeVariant = getEventBadgeVariant(event.status);
  // --- End Fix 1 ---

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{event.title}</DialogTitle>
              <Badge 
                variant={eventBadgeVariant} // Use the extracted variable
                className="mt-1"
              >
                {event.status}
              </Badge> 
            </div>
            <div className="flex items-center gap-2">
              {event.status === 'published' && onSuspend && (
                <button
                  onClick={onSuspend}
                  className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors micro-interact flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </button>
              )}
              {event.status === 'suspended' && onUnsuspend && (
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
          {/* Event Poster */}
          {event.posterUrl && (
            <div className="w-full h-64 rounded-lg overflow-hidden bg-muted">
              <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Event Details */}
          <div>
            <h4 className="font-medium mb-3">Event Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Date</span>
                  <p>{event.timeline?.[0]?.date ? new Date(event.timeline[0].date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Venue</span>
                  <p>{event.venue}</p>
                </div> 
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">Registrations</span>
                  <p>{event.registrations?.length || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <div>
                  <span className="text-sm text-muted-foreground">College</span>
                  <p>{event.college?.name || 'N/A'}</p>
                </div> 
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium mb-3">Description</h4>
            <p className="text-sm text-muted-foreground">{event.description || 'No description provided.'}</p>
          </div>

          {/* Organizer Information */}
          <div>
            <h4 className="font-medium mb-3">Organizer Information</h4>
            <div>
              <span className="text-sm text-muted-foreground">Organized By</span>
              <p>{event.createdBy?.name || 'Unknown'}</p>
            </div>
          </div>

          {/* Categories */}
          {event.categoryTags.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {/* --- FIX 2: Use `tag` as key instead of `index` --- */}
                {event.categoryTags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
                {/* --- End Fix 2 --- */}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

ViewEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  event: PropTypes.shape({
    title: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['draft', 'published', 'completed', 'suspended']).isRequired,
    posterUrl: PropTypes.string,
    timeline: PropTypes.arrayOf(PropTypes.shape({ date: PropTypes.string })),
    venue: PropTypes.string,
    registrations: PropTypes.array,
    description: PropTypes.string,
    createdBy: PropTypes.shape({
      name: PropTypes.string,
    }),
    college: PropTypes.shape({
      name: PropTypes.string,
    }),
    categoryTags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onSuspend: PropTypes.func,
  onUnsuspend: PropTypes.func,
};