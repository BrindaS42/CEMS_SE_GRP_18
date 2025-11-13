import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Calendar, Clock, MapPin, Eye, Users } from 'lucide-react';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';
import { ViewEventModal } from './ViewEventModal';

export function PublishedEventsTab({ 
  events, 
  currentUserEmail,
  onEditEvent,
  highlightEventId,
  onClearHighlight,
  maintenanceEventIds = [],
}) {
  const cardRefs = useRef({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Sort events: maintenance events first, then by date
  const sortedEvents = [...events].sort((a, b) => {
    const aInMaintenance = maintenanceEventIds.includes(a.id);
    const bInMaintenance = maintenanceEventIds.includes(b.id);
    
    if (aInMaintenance && !bInMaintenance) return -1;
    if (!aInMaintenance && bInMaintenance) return 1;
    return 0;
  });

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setViewModalOpen(true);
  };

  useEffect(() => {
    if (highlightEventId && cardRefs.current[highlightEventId]) {
      const card = cardRefs.current[highlightEventId];
      
      // Scroll to the card
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Flash effect: add flash class twice
      setTimeout(() => {
        card.classList.add('flash-highlight');
        setTimeout(() => {
          card.classList.remove('flash-highlight');
          setTimeout(() => {
            card.classList.add('flash-highlight');
            setTimeout(() => {
              card.classList.remove('flash-highlight');
              if (onClearHighlight) onClearHighlight();
            }, 500);
          }, 100);
        }, 500);
      }, 500);
    }
  }, [highlightEventId, onClearHighlight]);

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No published events yet</p>
        <p className="text-sm mt-2">Publish drafted events to see them here</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes flash {
          0%, 100% { box-shadow: 0 0 0 0 transparent; }
          50% { box-shadow: 0 0 0 4px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.3); }
        }
        .flash-highlight {
          animation: flash 0.5s ease-in-out;
        }
        .maintenance-mode {
          border: 2px solid #FF3B30;
          box-shadow: 0 0 0 1px #FF3B30;
        }
      `}</style>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedEvents.map((event) => {
          const mainTimeline = event.timeline[0];
          const isInMaintenance = maintenanceEventIds.includes(event.id);

          return (
            <div 
              key={event.id}
              ref={el => (cardRefs.current[event.id] = el)}
            >
              <Card className={`h-full flex flex-col hover:shadow-lg transition-all duration-300 ${isInMaintenance ? 'maintenance-mode' : ''}`}>
            {/* Poster */}
            {event.posterUrl && (
              <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                <ImageWithFallback 
                  src={event.posterUrl} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <div className="flex flex-col gap-1">
                  {isInMaintenance && (
                    <Badge variant="outline" className="text-[#FF3B30] border-[#FF3B30]/50 bg-[#FF3B30]/10 text-xs whitespace-nowrap">
                      In Maintenance
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-success border-success/50 bg-success/10">
                    Published
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-3 flex-grow flex flex-col">
              {/* Team */}
              <div className="flex items-center gap-2 text-sm flex-shrink-0">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Team:</span>
                <span className="font-medium">{event.teamName}</span>
              </div>

              {/* Category Tags */}
              {event.categoryTags.length > 0 && (
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {event.categoryTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Timeline Info */}
              {mainTimeline && (
                <div className="space-y-2 text-sm flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-info" />
                    <span className="text-muted-foreground">
                      {new Date(mainTimeline.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">
                      {mainTimeline.duration.from} - {mainTimeline.duration.to}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-destructive" />
                    <span className="text-muted-foreground truncate">
                      {mainTimeline.venue}
                    </span>
                  </div>
                </div>
              )}

              {/* Sub-events count */}
              {event.subEvents.length > 0 && (
                <div className="pt-2 border-t border-border flex-shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {event.subEvents.length} Sub-event{event.subEvents.length > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Volunteers count */}
              {event.volunteers.length > 0 && (
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {event.volunteers.filter(v => v.status === 'Accepted').length} Volunteer{event.volunteers.filter(v => v.status === 'Accepted').length !== 1 ? 's' : ''}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex gap-2 pt-4 flex-shrink-0">
              <Button
                variant="outline"
                className="w-full text-info border-info/50 hover:bg-info hover:text-white"
                onClick={() => handleViewEvent(event)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </CardFooter>
              </Card>
            </div>
          );
      })}
    </div>

      <ViewEventModal 
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        event={selectedEvent}
        currentUserEmail={currentUserEmail}
        onEdit={undefined}
      />
    </>
  );
}

PublishedEventsTab.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentUserEmail: PropTypes.string.isRequired,
  onEditEvent: PropTypes.func,
  highlightEventId: PropTypes.number,
  onClearHighlight: PropTypes.func,
  maintenanceEventIds: PropTypes.arrayOf(PropTypes.number),
};

PublishedEventsTab.defaultProps = {
  maintenanceEventIds: [],
};