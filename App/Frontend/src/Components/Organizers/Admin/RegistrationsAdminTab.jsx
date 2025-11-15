import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Calendar, Clock } from 'lucide-react';
import { RegistrationConfigModal } from './RegistrationConfigModal';
import { RegistrationPreviewModal } from './RegistrationPreviewModal';

export function RegistrationsAdminTab({
  onNavigate,
  scrollToEventId = null,
  onClearScroll,
}) {
  const { drafts: draftedEvents } = useSelector((state) => state.events);

  const cardRefs = useRef({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Scroll to event when scrollToEventId changes
  useEffect(() => {
    if (scrollToEventId && cardRefs.current[scrollToEventId]) {
      const card = cardRefs.current[scrollToEventId];
      
      // Scroll to the card with Apple-like smooth animation
      setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Flash effect
        card.classList.add('flash-highlight');
        setTimeout(() => {
          card.classList.remove('flash-highlight');
          setTimeout(() => {
            card.classList.add('flash-highlight');
            setTimeout(() => {
              card.classList.remove('flash-highlight');
              if (onClearScroll) onClearScroll();
            }, 500);
          }, 100);
        }, 500);
      }, 300);
    }
  }, [scrollToEventId, onClearScroll]);

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
  };

  const handleView = (event) => {
    setSelectedEvent(event);
    setIsPreviewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setIsPreviewModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <>
      <style>{`
        @keyframes flash {
          0%, 100% { box-shadow: 0 0 0 0 transparent; }
          50% { box-shadow: 0 0 0 4px #6366f1, 0 0 20px rgba(99, 102, 241, 0.3); }
        }
        .flash-highlight {
          animation: flash 0.5s ease-in-out;
        }
      `}</style>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h2 className="text-2xl mb-2">Registration Setup</h2>
          <p className="text-muted-foreground">
            Configure registration forms for your drafted events before publishing
          </p>
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {draftedEvents.map((event) => {
            const mainTimeline = event.timeline[0];
            const hasRegistrationSetup = event.config && Object.keys(event.config).length > 1; // Check if config is more than just default type
            
            return (
              <div
                key={event._id}
                ref={el => (cardRefs.current[event._id] = el)}
              >
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      {hasRegistrationSetup && (
                        <span className="px-2 py-1 text-xs rounded-full bg-success/10 text-success">
                          Configured
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Date & Time */}
                    {mainTimeline && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>
                            {new Date(mainTimeline.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{mainTimeline.duration.from} - {mainTimeline.duration.to}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      {hasRegistrationSetup && (
                        <Button
                          onClick={() => handleView(event)}
                          variant="outline"
                          className="flex-1 gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      )}
                      <Button
                        onClick={() => handleEdit(event)}
                        className="flex-1 gap-2"
                        variant={hasRegistrationSetup ? 'outline' : 'default'}
                      >
                        <Edit className="w-4 h-4" />
                        {hasRegistrationSetup ? 'Edit' : 'Configure'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {draftedEvents.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg mb-2">No Drafted Events</h3>
            <p className="text-muted-foreground mb-4">
              Create an event to configure its registration
            </p>
            <Button onClick={() => onNavigate?.('admin')}>Go to Events Tab</Button>
          </div>
        )}

        {/* Modals */}
        {selectedEvent && (
          <>
            <RegistrationConfigModal
              isOpen={isEditModalOpen}
              onClose={handleCloseModal}
              event={selectedEvent}
            />
            <RegistrationPreviewModal
              isOpen={isPreviewModalOpen}
              onClose={handleCloseModal}
              event={selectedEvent}
            />
          </>
        )}
      </div>
    </>
  );
}

const eventShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  timeline: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    duration: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  })),
});

RegistrationsAdminTab.propTypes = {
  onNavigate: PropTypes.func,
  draftedEvents: PropTypes.arrayOf(eventShape),
  scrollToEventId: PropTypes.number,
  onClearScroll: PropTypes.func,
};