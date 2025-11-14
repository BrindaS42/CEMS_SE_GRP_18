import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../ui/button';
import { PublishedEvents } from './PublishedEvents';
import { LiveEvents } from './LiveEvents';
import { SegmentedControl } from '../ui/segmented-control';

export function EventsTab({ events, onViewEvent }) {
  const [activeSubTab, setActiveSubTab] = useState('published');

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="animate-fade-in-up stagger-2">
        <SegmentedControl
          options={[
            { value: 'published', label: 'Published' },
            { value: 'live', label: 'Live' },
          ]}
          value={activeSubTab}
          onChange={(value) => setActiveSubTab(value)}
          variant="orange"
        />
      </div>

      {/* Sub-tab Content */}
      <div className="tab-transition">
        {activeSubTab === 'published' && <PublishedEvents events={events} onViewEvent={onViewEvent} />}
        {activeSubTab === 'live' && <LiveEvents events={events} onViewEvent={onViewEvent} />}
      </div>
    </div>
  );
}

EventsTab.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  onViewEvent: PropTypes.func.isRequired,
};