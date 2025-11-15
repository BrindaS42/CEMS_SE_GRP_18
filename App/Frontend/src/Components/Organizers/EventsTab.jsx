import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../ui/button';
import { LiveEvents } from './LiveEvents.jsx';
import { CompletedEvents } from './CompletedEvents.jsx';
import { SegmentedControl } from '../ui/segmented-control';
import { fetchPublishedEvents, fetchCompletedEvents } from '../../store/event.slice';

export function EventsTab({ onViewEvent }) {
  const dispatch = useDispatch();
  const [activeSubTab, setActiveSubTab] = useState('live');

  // Redux state
  const { published, completed } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  // Fetch events on component mount
  useEffect(() => {
    dispatch(fetchPublishedEvents());
    dispatch(fetchCompletedEvents());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="animate-fade-in-up stagger-2">
        <SegmentedControl
          options={[
            { value: 'live', label: 'Live' },
            { value: 'completed', label: 'Completed' },
          ]}
          value={activeSubTab}
          onChange={(value) => setActiveSubTab(value)}
          variant="orange"
        />
      </div>

      {/* Sub-tab Content */}
      <div className="tab-transition">
        {activeSubTab === 'live' && <LiveEvents events={published} onViewEvent={onViewEvent} />}
        {activeSubTab === 'completed' && <CompletedEvents events={completed} />}
      </div>
    </div>
  );
}

EventsTab.propTypes = {
  onViewEvent: PropTypes.func.isRequired,
};
