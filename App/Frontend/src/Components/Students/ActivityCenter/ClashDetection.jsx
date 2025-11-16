import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, Calendar, Clock, ArrowLeftRight } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { cn } from '../../ui/utils';
import { fetchClashWarnings } from '@/store/student.slice';

export function ClashDetection() {
  const dispatch = useDispatch();
  const { clashWarnings, loading } = useSelector((state) => state.student);
  const clashes = clashWarnings?.data || [];

  useEffect(() => {
    dispatch(fetchClashWarnings());
  }, [dispatch]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const calculateOverlapDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m overlap`;
    }
    return `${diffMinutes}m overlap`;
  };

  const handleResolveClash = (clashId) => {
    console.log('Resolve clash:', clashId);
    // Implement clash resolution logic (e.g., cancel one event, reschedule, etc.)
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-foreground">Schedule Conflicts</h3>
          <p className="text-sm text-muted-foreground">
            Detected overlapping event schedules
          </p>
        </div>
        {clashes.length > 0 && (
          <Badge className="bg-destructive text-destructive-foreground">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {clashes.length} Clash{clashes.length !== 1 ? 'es' : ''}
          </Badge>
        )}
      </div>

      {clashes.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Calendar className="w-12 h-12 text-success mx-auto mb-4" />
          <h3 className="text-foreground mb-2">No Schedule Conflicts</h3>
          <p className="text-muted-foreground text-sm">
            All your registered events are perfectly scheduled without any overlaps.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {clashes.map((clash, index) => {
            const event1DateTime = formatDateTime(clash.eventA.starts);
            const event2DateTime = formatDateTime(clash.eventB.starts);
            const overlapDuration = calculateOverlapDuration(clash.eventA.starts, clash.eventA.ends);

            return (
              <div
                key={clash.id}
                className={cn(
                  'rounded-xl border-2 border-destructive bg-destructive/5 overflow-hidden',
                  'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  'hover:shadow-lg',
                  'gpu-accelerate animate-fade-in-up',
                  `stagger-${(index % 10) + 1}`
                )}
              >
                <div className="p-5 space-y-4">
                  {/* Warning Header */}
                  <div className="flex items-center gap-2 pb-3 border-b border-destructive/20">
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-foreground">Time Clash Detected</h4>
                      <p className="text-xs text-muted-foreground">{overlapDuration}</p>
                    </div>
                    <Badge variant="outline" className="border-destructive text-destructive">
                      Conflict
                    </Badge>
                  </div>

                  {/* Event 1 */}
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <h4 className="text-foreground mb-2">{clash.eventA.title}</h4>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{event1DateTime.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>
                          {formatDateTime(clash.eventA.starts).time} - {formatDateTime(clash.eventA.ends).time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conflict Indicator */}
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full">
                      <ArrowLeftRight className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive">Overlaps with</span>
                    </div>
                  </div>

                  {/* Event 2 */}
                  <div className="bg-card rounded-lg p-4 border border-border">
                    <h4 className="text-foreground mb-2">{clash.eventB.title}</h4>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{event2DateTime.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>
                          {formatDateTime(clash.eventB.starts).time} - {formatDateTime(clash.eventB.ends).time}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleResolveClash(clash.id)}
                    variant="outline"
                    className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground btn-interact"
                  >
                    Resolve Conflict
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Help Section */}
          <div className="mt-6 p-4 bg-warning/10 rounded-xl border border-warning/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h4 className="text-foreground mb-1 text-sm">Need to resolve a conflict?</h4>
                <p className="text-xs text-muted-foreground">
                  You can cancel one event registration or contact the organizers to discuss rescheduling options.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}