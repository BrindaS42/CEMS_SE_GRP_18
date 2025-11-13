import { Calendar, Clock, MapPin, Eye, UserPlus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../components/ui/utils';

// Mock data - replace with actual API data
const recommendedEvents = [
  {
    id: '4',
    name: 'Startup Pitch Competition',
    poster: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop',
    date: '2025-11-25',
    time: '11:00 AM',
    location: 'Innovation Hub',
    category: 'Business',
    spotsLeft: 15,
  },
  {
    id: '5',
    name: 'Robotics Workshop',
    poster: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    date: '2025-11-28',
    time: '03:00 PM',
    location: 'Engineering Lab',
    category: 'Technology',
    spotsLeft: 8,
  },
  {
    id: '6',
    name: 'Cultural Fest 2025',
    poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
    date: '2025-12-05',
    time: '05:00 PM',
    location: 'Outdoor Arena',
    category: 'Cultural',
    spotsLeft: 50,
  },
  {
    id: '7',
    name: 'Cybersecurity Bootcamp',
    poster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
    date: '2025-12-10',
    time: '09:00 AM',
    location: 'Computer Center',
    category: 'Technology',
    spotsLeft: 20,
  },
];

export function RecommendedEvents() {
  const handleRegister = (eventId) => {
    console.log('Register for event:', eventId);
    // Implement registration logic
  };

  const handleViewEvent = (eventId) => {
    console.log('View event:', eventId);
    // Implement view event modal/navigation
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-foreground">Recommended For You</h3>
          <p className="text-sm text-muted-foreground">
            Based on your interests and previous registrations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedEvents.map((event, index) => (
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
              <div className="absolute top-3 left-3">
                <Badge className="bg-[var(--student-primary)] text-white shadow-lg dark:bg-[var(--student-primary)]">
                  {event.category}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge 
                  variant="outline" 
                  className={cn(
                    'bg-card/90 backdrop-blur-sm shadow-lg',
                    event.spotsLeft < 10 && 'border-warning text-warning'
                  )}
                >
                  {event.spotsLeft} spots left
                </Badge>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-4 space-y-3">
              <div>
                <h4 className="text-foreground mb-1 line-clamp-1">{event.name}</h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-[var(--student-primary)] dark:text-[var(--student-secondary)]" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-[var(--student-primary)] dark:text-[var(--student-secondary)]" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-[var(--student-primary)] dark:text-[var(--student-secondary)]" />
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleRegister(event.id)}
                  className="flex-1 bg-[var(--student-primary)] text-white hover:bg-[var(--student-secondary)] dark:bg-[var(--student-primary)] dark:hover:bg-[var(--student-secondary)] btn-interact"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register
                </Button>
                <Button
                  onClick={() => handleViewEvent(event.id)}
                  variant="outline"
                  className="btn-interact hover:border-[var(--student-primary)] hover:text-[var(--student-primary)] dark:hover:border-[var(--student-secondary)] dark:hover:text-[var(--student-secondary)]"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}