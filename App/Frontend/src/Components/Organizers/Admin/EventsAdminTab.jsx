import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DraftedEventsTab } from './DraftedEventsTab';
import { PublishedEventsTab } from './PublishedEventsTab';
import { OngoingEventsTab } from './OngoingEventsTab';
import { CompletedEventsTab } from './CompletedEventsTab';
import { CreateEventModal } from './CreateEventModal';
// Assuming CURRENT_USER_EMAIL is imported from App, but adding a fallback
import { CURRENT_USER_EMAIL as AppUserEmail } from '@/App';
import { SegmentedControl } from '@/components/ui/segmented-control';


export function EventsAdminTab({ 
  onCreateEvent, 
  openCreateEventModal = false,
  highlightEventId = null,
  onClearHighlight,
  events,
  onUpdateEvents,
  onNavigateToRegistration,
}) {
  const [activeSubTab, setActiveSubTab] = useState('drafted');
  const [createModalOpen, setCreateModalOpen] = useState(openCreateEventModal);
  const [maintenanceEventIds, setMaintenanceEventIds] = useState([]);

  // Open create modal when prop changes
  useEffect(() => {
    if (openCreateEventModal) {
      setCreateModalOpen(true);
    }
  }, [openCreateEventModal]);

  // Switch to appropriate tab when highlightEventId is provided
  useEffect(() => {
    if (highlightEventId) {
      const event = events.find(e => e.id === highlightEventId);
      if (event) {
        setActiveSubTab(event.status);
      }
    }
  }, [highlightEventId, events]);

  const handleCreateEvent = () => {
    setCreateModalOpen(true);
    if (onCreateEvent) onCreateEvent();
  };

  const handleDeleteEvent = (eventId) => {
    onUpdateEvents(events.filter(e => e.id !== eventId));
  };

  const handleEditEvent = (eventId, eventData) => {
    // Add to maintenance if it's a published event
    const event = events.find(e => e.id === eventId);
    if (event?.status === 'published' && !maintenanceEventIds.includes(eventId)) {
      setMaintenanceEventIds(prev => [...prev, eventId]);
    }

    // Update event with new data
    onUpdateEvents(events.map(e => 
      e.id === eventId ? { 
        ...e, 
        ...eventData, 
        updatedAt: new Date().toISOString().split('T')[0] 
      } : e
    ));

    // Remove from maintenance after a short delay (simulating save completion)
    setTimeout(() => {
      setMaintenanceEventIds(prev => prev.filter(id => id !== eventId));
    }, 2000);
  };

  const handlePublishEvent = (eventId) => {
    onUpdateEvents(events.map(e => 
      e.id === eventId ? { ...e, status: 'published', updatedAt: new Date().toISOString().split('T')[0] } : e
    ));
  };

  const handleSaveEvent = (eventData) => {
    // Create new event
    const newEvent = {
      id: Date.now(),
      ...eventData,
      registrations: 0,
      checkIns: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateEvents([...events, newEvent]);
  };

  // Filter events by status and user access
  const draftedEvents = events.filter(e => e.status === 'drafted');
  const publishedEvents = events.filter(e => e.status === 'published');
  const ongoingEvents = events.filter(e => e.status === 'ongoing');
  const completedEvents = events.filter(e => e.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Sub-tabs with Create Event Button */}
      <div className="flex items-center justify-between">
        <SegmentedControl
          options={[
            { value: 'drafted', label: 'Drafted' },
            { value: 'published', label: 'Published' },
            { value: 'ongoing', label: 'Ongoing' },
            { value: 'completed', label: 'Completed' },
          ]}
          value={activeSubTab}
          onChange={(value) => setActiveSubTab(value)}
          variant="orange"
        />

        {/* Create Event Button */}
        <Button onClick={handleCreateEvent} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Event
        </Button>
      </div>

      {/* Sub-tab Content */}
      {activeSubTab === 'drafted' && (
        <DraftedEventsTab 
          events={draftedEvents}
          currentUserEmail={CURRENT_USER_EMAIL}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={handleEditEvent}
          onPublishEvent={handlePublishEvent}
          onNavigateToRegistration={onNavigateToRegistration}
        />
      )}
      {activeSubTab === 'published' && (
        <PublishedEventsTab 
          events={publishedEvents}
          currentUserEmail={CURRENT_USER_EMAIL}
          onEditEvent={handleEditEvent}
          highlightEventId={highlightEventId}
          onClearHighlight={onClearHighlight}
          maintenanceEventIds={maintenanceEventIds}
        />
      )}
      {activeSubTab === 'ongoing' && (
        <OngoingEventsTab 
          events={ongoingEvents}
          currentUserEmail={CURRENT_USER_EMAIL}
          highlightEventId={highlightEventId}
          onClearHighlight={onClearHighlight}
        />
      )}
      {activeSubTab === 'completed' && (
        <CompletedEventsTab 
          events={completedEvents}
          currentUserEmail={CURRENT_USER_EMAIL}
        />
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleSaveEvent}
        currentUserEmail={CURRENT_USER_EMAIL}
      />
    </div>
  );
}

EventsAdminTab.propTypes = {
  onCreateEvent: PropTypes.func,
  openCreateEventModal: PropTypes.bool,
  highlightEventId: PropTypes.number,
  onClearHighlight: PropTypes.func,
  events: PropTypes.arrayOf(PropTypes.object).isRequired, // Using PropTypes.object for brevity, but a full shape is better
  onUpdateEvents: PropTypes.func.isRequired,
  onNavigateToRegistration: PropTypes.func,
};