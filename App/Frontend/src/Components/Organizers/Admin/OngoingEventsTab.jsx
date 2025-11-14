import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Eye, Users, Activity } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { ViewEventModal } from './ViewEventModal';

export function OngoingEventsTab({
  events,
  currentUserEmail,
  highlightEventId,
  onClearHighlight,
}) {
  // 4. Removed generic type from useRef
  const cardRefs = useRef({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  // 5. Removed generic type from useState
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 6. Removed type annotation from 'event' parameter
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
        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No ongoing events</p>
        <p className="text-sm mt-2">Events currently in progress will appear here</p>
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
      `}</style>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const mainTimeline = event.timeline[0];

          return (
            <div
              key={event.id}
              ref={el => cardRefs.current[event.id] = el}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 border-accent/50">
                {/* Poster */}
                {event.posterUrl && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                    <ImageWithFallback
                      src={event.posterUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Live indicator */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent text-accent-foreground px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-accent-foreground rounded-full animate-pulse" />
                      <span className="text-xs font-medium">LIVE</span>
                    </div>
                  </div>
                )}

                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge variant="outline" className="text-accent border-accent/50 bg-accent/10">
                      Ongoing
                    </Badge>
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
                      {event.categoryTags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
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

                  {/* Active Stats */}
                  <div className="pt-2 border-t border-border flex-shrink-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Active Check-ins:</span>
                      <span className="font-medium">--</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2 pt-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-info border-info/50 hover:bg-info hover:text-white"
                    onClick={() => handleViewEvent(event)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-accent border-accent/50 hover:bg-accent hover:text-black"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    View Live Stats
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
      />
    </>
  );
}