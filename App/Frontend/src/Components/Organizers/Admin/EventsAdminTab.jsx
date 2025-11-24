import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/Components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { DraftedEventsTab } from './DraftedEventsTab';
import { PublishedEventsTab } from './PublishedEventsTab';
import { CompletedEventsTab } from './CompletedEventsTab';
import { CreateEventModal } from './CreateEventModal';
import { SegmentedControl } from '@/Components/ui/segmented-control';
import { deleteEvent, fetchDraftEvents, fetchPublishedEvents, fetchCompletedEvents } from '../../../Store/event.slice';


export function EventsAdminTab({
  onCreateEvent,
  openCreateEventModal = false,
  highlightEventId = null,
  onClearHighlight,
  onNavigateToRegistration,
}) {
  const dispatch = useDispatch();
  const { all: reduxEvents } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);
  const [activeSubTab, setActiveSubTab] = useState('drafted');
  const [createModalOpen, setCreateModalOpen] = useState(openCreateEventModal);

  // Fetch specific event lists when the component mounts
  useEffect(() => {
    dispatch(fetchDraftEvents());
    dispatch(fetchPublishedEvents());
    dispatch(fetchCompletedEvents());
  }, [dispatch]);

  // Open create modal when prop changes
  useEffect(() => {
    if (openCreateEventModal) {
      setCreateModalOpen(true);
    }
  }, [openCreateEventModal]);

  // Switch to appropriate tab when highlightEventId is provided
  useEffect(() => {
    if (highlightEventId) {
      const event = reduxEvents.find(e => e._id === highlightEventId);
      if (event) {
        // Can only be published, as drafts are not highlighted from other tabs
        setActiveSubTab('published');
      }
    }
  }, [highlightEventId, reduxEvents]);

  const handleCreateEvent = () => {
    setCreateModalOpen(true);
    if (onCreateEvent) onCreateEvent();
  };

  const handleDeleteEvent = (eventId) => {
    dispatch(deleteEvent(eventId));
  };

  const handleEditEvent = (eventId, eventData) => {
    // This will now open an Edit modal which will dispatch an update thunk.
    // For now, we just log it.
    console.log("Editing event:", eventId, eventData);
  };

  // Get events directly from the Redux store
  const { drafts, published, completed } = useSelector((state) => ({
    drafts: state.events.drafts,
    published: state.events.published,
    completed: state.events.completed,
  }));

  return (
    <div className="space-y-6">
      {/* Sub-tabs with Create Event Button */}
      <div className="flex items-center justify-between">
        <SegmentedControl
          options={[
            { value: 'drafted', label: 'Drafted' },
            { value: 'published', label: 'Published' },
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
          events={drafts}
          currentUserEmail={user?.email}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={handleEditEvent}
          onNavigateToRegistration={onNavigateToRegistration}
        />
      )}
      {activeSubTab === 'published' && (
        <PublishedEventsTab
          events={published}
          currentUserEmail={user?.email}
          onEditEvent={handleEditEvent}
          highlightEventId={highlightEventId}
          onClearHighlight={onClearHighlight}
          maintenanceEventIds={[]} // This feature can be re-implemented if needed
        />
      )}
      {activeSubTab === 'completed' && (
        <CompletedEventsTab
          events={completed}
          currentUserEmail={user?.email}
        />
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        currentUserEmail={user?.email}
      />
    </div>
  );
}

EventsAdminTab.propTypes = {
  onCreateEvent: PropTypes.func,
  openCreateEventModal: PropTypes.bool,
  highlightEventId: PropTypes.number,
  onClearHighlight: PropTypes.func,
  onNavigateToRegistration: PropTypes.func,
};
