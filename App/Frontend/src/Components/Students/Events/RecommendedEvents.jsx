import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, MapPin, Eye, UserPlus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../components/ui/utils';
import { getRecommendations } from '@/store/ai.slice';

export function RecommendedEvents() {
  const dispatch = useDispatch();
  const { recommendations: recommendedEvents, loading } = useSelector((state) => state.ai);

  useEffect(() => {
    dispatch(getRecommendations());
  }, [dispatch]);

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

      {loading === false && recommendedEvents.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground text-sm">No recommendations available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedEvents.map(({ event }, index) => (
            <div
            key={event._id}
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
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-[var(--student-primary)] text-white shadow-lg dark:bg-[var(--student-primary)]">
                  {event.categoryTags?.[0] || 'General'}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge 
                  variant="outline" 
                  className={cn(
                    'bg-card/90 backdrop-blur-sm shadow-lg',
                    (event.config?.maxRegistrations - (event.registrations?.length || 0)) < 10 && 'border-warning text-warning'
                  )}
                >
                  {event.config?.maxRegistrations - (event.registrations?.length || 0)} spots left
                </Badge>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-4 space-y-3">
              <div>
                <h4 className="text-foreground mb-1 line-clamp-1">{event.title}</h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-[var(--student-primary)] dark:text-[var(--student-secondary)]" />
                  <span>{new Date(event.timeline?.[0]?.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-[var(--student-primary)] dark:text-[var(--student-secondary)]" />
                  <span>{event.timeline?.[0]?.duration?.from}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-[var(--student-primary)] dark:text-[var(--student-secondary)]" />
                  <span>{event.venue?.address || 'Online'}</span>
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
      )}
    </div>
  );
}