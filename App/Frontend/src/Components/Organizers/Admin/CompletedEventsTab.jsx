import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Calendar, Clock, MapPin, Eye, Users, CheckCircle, FileText } from 'lucide-react';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';
import { ViewEventModal } from './ViewEventModal';

export function CompletedEventsTab({ 
  events, 
  currentUserEmail,
}) {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setViewModalOpen(true);
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No completed events yet</p>
        <p className="text-sm mt-2">Successfully finished events will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const mainTimeline = event.timeline[0];

          return (
            <Card 
              key={event.id}
              className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300 opacity-90"
            >
              {/* Poster with overlay */}
              {event.posterUrl && (
                <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                  <ImageWithFallback 
                    src={event.posterUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover grayscale-[30%]"
                  />
                  {/* Completed badge overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-success text-success-foreground px-3 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">COMPLETED</span>
                  </div>
                </div>
              )}

              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge variant="outline" className="text-muted-foreground border-muted-foreground/50 bg-muted/30">
                    Completed
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

                {/* Summary Stats */}
                <div className="pt-2 border-t border-border flex-shrink-0 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total Attendees:</span>
                    <span className="font-medium">--</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Feedback Score:</span>
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
                  className="flex-1 text-success border-success/50 hover:bg-success hover:text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Report
                </Button>
              </CardFooter>
            </Card>
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

CompletedEventsTab.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentUserEmail: PropTypes.string.isRequired,
};