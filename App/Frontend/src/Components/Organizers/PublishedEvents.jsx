import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, Users, CheckCircle, Download, Eye, FileText } from 'lucide-react';

export function PublishedEvents({ events, onViewEvent }) {
  const handleViewLogs = (eventId, e) => {
    e.stopPropagation();
    console.log('View logs for event:', eventId);
    // Navigate to event logs page
  };

  const handleExportSheet = (eventId, e) => {
    e.stopPropagation();
    console.log('Export sheet for event:', eventId);
    // Implement CSV/Excel export logic for this event
  };

  // Filter only published events
  const publishedEvents = events.filter(event => event.status === 'published');

  if (publishedEvents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground animate-fade-in-up">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No published events yet</p>
        <p className="text-sm mt-2">Publish drafted events to see them here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger-container>
      {publishedEvents.map((event, index) => {
        const mainTimeline = event.timeline[0];

        return (
          <Card 
            key={event.id} 
            className={`card-interact cursor-pointer animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
            onClick={() => onViewEvent(event.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Date */}
              {mainTimeline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary icon-interact" />
                  <span>{new Date(mainTimeline.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
              )}
              
              {/* Team Name */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-secondary icon-interact" />
                <span className="font-medium">{event.teamName}</span>
              </div>
              
              {/* Registrations */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4 text-info icon-interact" />
                <span>{event.registrations} Registrations</span>
              </div>
              
              {/* Check-ins */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-accent icon-interact" />
                <span>{event.checkIns} Check-ins</span>
              </div>

              {/* Action buttons - responsive layout */}
              <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-border">
                <div className="flex gap-2">
                  <Button 
                    onClick={(e) => handleViewLogs(event.id, e)} 
                    className="flex-1 h-9 btn-interact"
                    variant="outline"
                    size="sm"
                  >
                    View Logs
                  </Button>
                  <Button 
                    onClick={(e) => handleExportSheet(event.id, e)} 
                    className="flex-1 gap-2 h-9 btn-interact"
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </Button>
                </div>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewEvent(event.id);
                  }}
                  className="w-full gap-2 btn-interact"
                  variant="default"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

const eventShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  registrations: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  checkIns: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  timeline: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
  })).isRequired,
});

PublishedEvents.propTypes = {
  events: PropTypes.arrayOf(eventShape).isRequired,
  onViewEvent: PropTypes.func.isRequired,
};