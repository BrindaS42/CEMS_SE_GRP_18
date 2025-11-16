import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, MapPin, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../components/ui/utils';
import { fetchRegisteredEvents } from '@/store/student.slice';

export function RegisteredEvents() {
  const dispatch = useDispatch();
  const { registeredEvents, loading } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchRegisteredEvents());
  }, [dispatch]);

  const handleViewEvent = (eventId) => {
    console.log('View event:', eventId);
    // Implement view event modal/navigation
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-foreground">Your Registered Events</h3>
          <p className="text-sm text-muted-foreground">
            {registeredEvents.length} event{registeredEvents.length !== 1 ? 's' : ''} registered
          </p>
        </div>
      </div>

      {loading === false && registeredEvents.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Registered Events</h3>
          <p className="text-muted-foreground text-sm">
            You haven't registered for any events yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {registeredEvents.map((event, index) => (
            <div
              key={event.id}
              className={cn(
                'bg-card rounded-xl border border-border overflow-hidden',
                'card-interact gpu-accelerate',
                'animate-fade-in-up',
                `stagger-${(index % 10) + 1}`
              )}
            >
              {/* Event Poster */}
              <div className="relative h-40 bg-muted overflow-hidden">
                <img 
                  src={event.posterUrl} 
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                  <Badge 
                    className={cn(
                      'shadow-lg',
                      event.status === 'Ongoing' 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-info text-info-foreground'
                    )}
                  >
                    {event.status}
                  </Badge>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-foreground mb-1 line-clamp-1">{event.title}</h4>
                  <p className="text-xs text-muted-foreground">ID: {event._id}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(event.timeline?.[0]?.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{event.timeline?.[0]?.duration?.from}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleViewEvent(event.id)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary-hover btn-interact"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Event
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}