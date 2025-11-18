import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Users, CheckCircle, Eye, FileText, UserCheck } from 'lucide-react';
import { ViewLogModal } from './Admin/ViewLogModal';
import { ViewAttendanceModal } from './Admin/ViewAttendanceModal';
import { ViewReviewModal } from './Admin/ViewReviewModal';

export function LiveEvents({ events, onViewEvent }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground animate-fade-in-up">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No live events</p>
        <p className="text-sm mt-2">Events currently in progress will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger-container>
      {events.map((event, index) => {
        const mainTimeline = event.timeline[0];

        return (
          <Card 
            key={event._id} 
            className={`card-interact cursor-pointer border-accent/50 animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
            onClick={() => onViewEvent(event.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <div className="flex items-center gap-1 bg-accent text-accent-foreground px-2 py-1 rounded-full animate-spring-bounce">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-pulse-gentle" />
                  <span className="text-xs font-medium">LIVE</span>
                </div>
              </div>
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
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setLogModalOpen(true); }}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" /> View Logs
                  </Button>
                  <Button 
                    onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setAttendanceModalOpen(true); }}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <UserCheck className="w-4 h-4" /> Attendees
                  </Button>
                  <Button 
                    onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setReviewModalOpen(true); }}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" /> Reviews
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      </div>

      <ViewLogModal open={logModalOpen} onClose={() => setLogModalOpen(false)} event={selectedEvent} />
      <ViewAttendanceModal open={attendanceModalOpen} onClose={() => setAttendanceModalOpen(false)} event={selectedEvent} />
      <ViewReviewModal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} event={selectedEvent} />
    </>
  );
}

const eventShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  registrations: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  checkIns: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  timeline: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
  })).isRequired,
});

LiveEvents.propTypes = {
  events: PropTypes.arrayOf(eventShape).isRequired,
  onViewEvent: PropTypes.func.isRequired,
};