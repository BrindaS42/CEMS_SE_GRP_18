import { Calendar, Clock, MapPin, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../components/ui/utils';

// Mock data - replace with actual API data
const registeredEvents = [
  {
    id: '1',
    name: 'Tech Hackathon 2025',
    poster: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    date: '2025-11-15',
    time: '09:00 AM',
    location: 'Main Auditorium',
    status: 'Upcoming',
    registrationId: 'REG001',
  },
  {
    id: '2',
    name: 'AI Workshop Series',
    poster: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    date: '2025-11-20',
    time: '02:00 PM',
    location: 'Lab 203',
    status: 'Upcoming',
    registrationId: 'REG002',
  },
  {
    id: '3',
    name: 'Design Sprint Challenge',
    poster: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
    date: '2025-11-10',
    time: '10:00 AM',
    location: 'Creative Studio',
    status: 'Ongoing',
    registrationId: 'REG003',
  },
];

export function RegisteredEvents() {
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

      {registeredEvents.length === 0 ? (
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
                  src={event.poster} 
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
                  <h4 className="text-foreground mb-1 line-clamp-1">{event.name}</h4>
                  <p className="text-xs text-muted-foreground">ID: {event.registrationId}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{event.location}</span>
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