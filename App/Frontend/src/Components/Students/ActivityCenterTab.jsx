import { useState } from 'react';
import { TimelineReminders } from './ActivityCenter/TimelineReminders';
import { ClashDetection } from './ActivityCenter/ClashDetection';
import { SegmentedControl } from '../../components/ui/segmented-control';

export function ActivityCenterTab() {
  const [activeSubTab, setActiveSubTab] = useState('timeline');

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="animate-fade-in-up stagger-2">
        <SegmentedControl
          options={[
            { value: 'timeline', label: 'Timeline Reminders' },
            { value: 'clash', label: 'Clash Detection' },
          ]}
          value={activeSubTab}
          onChange={(value) => setActiveSubTab(value)}
          variant="orange"
        />
      </div>

      {/* Sub-tab Content */}
      <div className="tab-transition">
        {activeSubTab === 'timeline' && <TimelineReminders />}
        {activeSubTab === 'clash' && <ClashDetection />}
      </div>
    </div>
  );
}