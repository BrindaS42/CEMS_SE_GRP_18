import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mail, 
  Phone, 
  FileText, 
  Edit, 
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Clock3,
} from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

export function ViewEventModal({ 
  open, 
  onClose, 
  event, 
  currentUserEmail,
  onEdit 
}) {
  if (!event) return null;

  const canEdit = event.leaderEmail === currentUserEmail;
  const mainTimeline = event.timeline[0];

  const getStatusBadge = () => {
    const statusConfig = {
      drafted: { label: 'Drafted', className: 'text-muted-foreground border-muted-foreground/50 bg-muted/30' },
      published: { label: 'Published', className: 'text-success border-success/50 bg-success/10' },
      ongoing: { label: 'Ongoing', className: 'text-accent border-accent/50 bg-accent/10' },
      completed: { label: 'Completed', className: 'text-info border-info/50 bg-info/10' },
    };

    const config = statusConfig[event.status] || statusConfig.drafted;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Helper for sub-event badge
  const getSubEventBadge = (status) => {
    if (status === 'Approved') {
      return 'text-success border-success/50 bg-success/10';
    }
    if (status === 'Pending') {
      return 'text-warning border-warning/50 bg-warning/10';
    }
    return 'text-destructive border-destructive/50 bg-destructive/10';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-8">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{event.title}</DialogTitle>
              <DialogDescription>
                {event.description}
              </DialogDescription>
            </div>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Poster */}
          {event.posterUrl && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span className="font-medium">Event Poster</span>
              </div>
              <div className="relative w-full h-64 overflow-hidden rounded-lg border border-border">
                <ImageWithFallback 
                  src={event.posterUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Team Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">Team Information</span>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Name:</span>
                <span className="font-medium">{event.teamName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Leader:</span>
                <span className="font-medium">{event.leaderEmail}</span>
              </div>
            </div>
          </div>

          {/* Point of Contact */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <span className="font-medium">Point of Contact</span>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="font-medium">{event.poc.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contact:</span>
                <span className="font-medium">{event.poc.contact}</span>
              </div>
            </div>
          </div>

          {/* Category Tags */}
          {event.categoryTags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.categoryTags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {mainTimeline && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock3 className="w-4 h-4 text-primary" />
                <span className="font-medium">Event Timeline</span>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                {mainTimeline.title && (
                  <div>
                    <span className="text-xs text-muted-foreground">Title:</span>
                    <p className="font-medium">{mainTimeline.title}</p>
                  </div>
                )}
                {mainTimeline.description && (
                  <div>
                    <span className="text-xs text-muted-foreground">Description:</span>
                    <p className="text-sm">{mainTimeline.description}</p>
                  </div>
                )}
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-info" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {new Date(mainTimeline.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">
                        {mainTimeline.duration.from} - {mainTimeline.duration.to}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-destructive" />
                  <div>
                    <p className="text-xs text-muted-foreground">Venue</p>
                    <p className="font-medium">{mainTimeline.venue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in Required</p>
                    <p className="font-medium">{mainTimeline.checkInRequired ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rule Book */}
          {event.ruleBook && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">Rule Book</span>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <a 
                  href={event.ruleBook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View Rule Book
                </a>
              </div>
            </div>
          )}

          {/* Sub-events */}
          {event.subEvents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">Sub-events ({event.subEvents.length})</span>
              </div>
              <div className="space-y-2">
                {event.subEvents.map((subEvent) => (
                  <div key={subEvent.subevent} className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm">Sub-event #{subEvent.subevent}</span>
                    <Badge 
                      variant="outline" 
                      className={getSubEventBadge(subEvent.status)}
                    >
                      {subEvent.status === 'Approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {subEvent.status === 'Rejected' && <XCircle className="w-3 h-3 mr-1" />}
                      {subEvent.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volunteers */}
          {event.volunteers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">Volunteers ({event.volunteers.length})</span>
              </div>
              <div className="space-y-2">
                {event.volunteers.map((volunteer) => (
                  <div key={volunteer.id} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{volunteer.name}</span>
                      <Badge 
                        variant="outline"
                        className={
                          volunteer.status === 'Accepted' 
                            ? 'text-success border-success/50 bg-success/10'
                            : volunteer.status === 'Pending'
                            ? 'text-warning border-warning/50 bg-warning/10'
                            : 'text-destructive border-destructive/50 bg-destructive/10'
                        }
                      >
                        {volunteer.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span>{volunteer.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {event.gallery.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span className="font-medium">Gallery ({event.gallery.length} images)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {event.gallery.map((image) => (
                  <div key={image} className="relative h-24 overflow-hidden rounded-lg border border-border">
                    <ImageWithFallback 
                      src={image} 
                      alt="Gallery image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          {event.status !== 'drafted' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">Statistics</span>
              </div>
              <div className="bg-muted/30 rounded-lg p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Registrations</p>
                  <p className="text-xl font-medium">{event.registrations}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Check-ins</p>
                  <p className="text-xl font-medium">{event.checkIns}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created:</span>
              <span>{new Date(event.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last Updated:</span>
              <span>{new Date(event.updatedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {canEdit && onEdit && event.status === 'drafted' && (
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => {
                onEdit(event.id);
                onClose();
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Event
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const timelineShape = PropTypes.shape({
  title: PropTypes.string,
  description: PropTypes.string,
  date: PropTypes.string.isRequired,
  duration: PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }).isRequired,
  venue: PropTypes.string.isRequired,
  checkInRequired: PropTypes.bool.isRequired,
});

const subEventShape = PropTypes.shape({
  subevent: PropTypes.number.isRequired,
  status: PropTypes.oneOf(['Approved', 'Pending', 'Rejected']).isRequired,
});

const volunteerShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['Accepted', 'Pending', 'Rejected']).isRequired,
});

const eventShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  leaderEmail: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  posterUrl: PropTypes.string,
  poc: PropTypes.shape({
    name: PropTypes.string.isRequired,
    contact: PropTypes.string.isRequired,
  }).isRequired,
  categoryTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  status: PropTypes.oneOf(['drafted', 'published', 'ongoing', 'completed']).isRequired,
  timeline: PropTypes.arrayOf(timelineShape).isRequired,
  ruleBook: PropTypes.string,
  subEvents: PropTypes.arrayOf(subEventShape).isRequired,
  volunteers: PropTypes.arrayOf(volunteerShape).isRequired,
  gallery: PropTypes.arrayOf(PropTypes.string).isRequired,
  registrations: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  checkIns: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
});

ViewEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: eventShape,
  currentUserEmail: PropTypes.string.isRequired,
  onEdit: PropTypes.func,
};