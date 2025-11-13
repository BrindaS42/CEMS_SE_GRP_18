import { Calendar, Clock, MapPin, Bell } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../components/ui/utils';

// Helper function to calculate days until event
const getDaysUntil = (dateString) => {
  const eventDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper function to format countdown
const formatCountdown = (days) => {
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return 'Past event';
  return `In ${days} days`;
};

// Mock data - replace with actual API data fetching events within 7 days
const upcomingEvents = [
  {
    id: '1',
    name: 'Tech Hackathon 2025',
    date: '2025-11-15',
    time: '09:00 AM',
    location: 'Main Auditorium',
    duration: '2 days',
  },
  {
    id: '2',
    name: 'AI Workshop Series',
    date: '2025-11-20',
    time: '02:00 PM',
    location: 'Lab 203',
    duration: '3 hours',
  },
  {
    id: '3',
    name: 'Design Sprint Challenge',
    date: '2025-11-10',
    time: '10:00 AM',
    location: 'Creative Studio',
    duration: '1 day',
  },
  {
    id: '4',
    name: 'Startup Pitch Day',
    date: '2025-11-12',
    time: '11:00 AM',
    location: 'Innovation Hub',
    duration: '4 hours',
  },
].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export function TimelineReminders() {
  
  // Refactored from nested ternary to avoid linter warnings
  const getUrgencyColor = (days) => {
    if (days === 0) return 'border-destructive bg-destructive/5';
    if (days <= 2) return 'border-warning bg-warning/5';
    return 'border-info bg-info/5';
  };

  // Refactored from nested ternary to avoid linter warnings
  const getCountdownColor = (days) => {
    if (days === 0) return 'bg-destructive text-destructive-foreground';
    if (days <= 2) return 'bg-warning text-warning-foreground';
    return 'bg-info text-info-foreground';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-foreground">Upcoming Events</h3>
          <p className="text-sm text-muted-foreground">
            Events happening within the next 7 days
          </p>
        </div>
        <Badge className="bg-info text-info-foreground">
          <Bell className="w-3 h-3 mr-1" />
          {upcomingEvents.length} Reminders
        </Badge>
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Upcoming Events</h3>
          <p className="text-muted-foreground text-sm">
            You have no events scheduled in the next 7 days.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map((event, index) => {
            const daysUntil = getDaysUntil(event.date);
            
            return (
              <div
                key={event.id}
                className={cn(
                  'rounded-xl border-2 overflow-hidden',
                  'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  'hover:shadow-md hover:scale-[1.01]',
                  'gpu-accelerate animate-fade-in-up',
                  `stagger-${(index % 10) + 1}`,
                  getUrgencyColor(daysUntil)
                )}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className="text-foreground mb-1">{event.name}</h4>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={cn('shrink-0 shadow-lg', getCountdownColor(daysUntil))}>
                      {formatCountdown(daysUntil)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          daysUntil === 0 && 'bg-destructive',
                          daysUntil > 0 && daysUntil <= 2 && 'bg-warning',
                          daysUntil > 2 && 'bg-info'
                        )}
                        style={{
                          width: `${Math.max(10, Math.min(100, ((7 - daysUntil) / 7) * 100))}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{event.duration}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-foreground mb-1 text-sm">Stay Prepared</h4>
            <p className="text-xs text-muted-foreground">
              We'll notify you as events approach. Make sure to check the event details and requirements in advance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}