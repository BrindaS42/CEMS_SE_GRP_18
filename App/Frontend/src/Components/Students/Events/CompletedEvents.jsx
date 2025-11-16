import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, MapPin, CheckCircle, Award } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../components/ui/utils';
import { fetchCompletedEvents } from '@/store/student.slice';

export function CompletedEvents() {
  const dispatch = useDispatch();
  const { completedEvents, loading } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchCompletedEvents());
  }, [dispatch]);

  const handleDownloadCertificate = (eventId) => {
    console.log('Download certificate for event:', eventId);
    // Implement certificate download logic
  };

  const handleViewDetails = (eventId) => {
    console.log('View details for event:', eventId);
    // Implement view details logic
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={cn(
              'w-4 h-4',
              i < rating ? 'text-warning fill-warning' : 'text-muted-foreground'
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-foreground">Completed Events</h3>
          <p className="text-sm text-muted-foreground">
            {completedEvents.length} event{completedEvents.length !== 1 ? 's' : ''} completed
          </p>
        </div>
      </div>

      {loading === false && completedEvents.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Completed Events</h3>
          <p className="text-muted-foreground text-sm">
            Your completed events will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedEvents.map((event, index) => (
            <div
              key={event.id}
              className={cn(
                'bg-card rounded-xl border border-border overflow-hidden',
                'card-interact gpu-accelerate',
                'animate-fade-in-up',
                `stagger-${(index % 10) + 1}`
              )}
            >
              {/* Event Poster with Completed Overlay */}
              <div className="relative h-40 bg-muted overflow-hidden">
                <img 
                  src={event.posterUrl} 
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <Badge className="bg-success text-success-foreground shadow-lg">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                  {renderStars(event.rating)}
                </div>
              </div>

              {/* Event Details */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="text-foreground mb-1 line-clamp-1">{event.title}</h4>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(event.timeline?.[0]?.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{event.timeline?.[0]?.duration?.from}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                {event.certificate ? (
                  <Button
                    onClick={() => handleDownloadCertificate(event.id)}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary-hover btn-interact"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Download Certificate
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleViewDetails(event.id)}
                    variant="outline"
                    className="w-full btn-interact"
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}