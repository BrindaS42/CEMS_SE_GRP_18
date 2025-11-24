import { useState } from 'react';
import { RegisteredEvents } from './Events/RegisteredEvents';
import { RecommendedEvents } from './Events/RecommendedEvents';
import { CompletedEvents } from './Events/CompletedEvents';
import { SegmentedControl } from '@/Components/ui/segmented-control';

export function EventsTab() {
  // 1. Removed the TypeScript generic type: <'registered' | 'recommended' | 'completed'>
  const [activeSubTab, setActiveSubTab] = useState('registered');

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="animate-fade-in-up stagger-2">
        <SegmentedControl
          options={[
            { value: 'registered', label: 'Registered Events' },
            { value: 'recommended', label: 'Recommended Events' },
            { value: 'completed', label: 'Completed Events' },
          ]}
          value={activeSubTab}
          onChange={(value) => setActiveSubTab(value)}
          variant="orange"
        />
      </div>

      {/* Sub-tab Content */}
      <div className="tab-transition">
        {activeSubTab === 'registered' && <RegisteredEvents />}
        {activeSubTab === 'recommended' && <RecommendedEvents />}
        {activeSubTab === 'completed' && <CompletedEvents />}
      </div>
    </div>
  );
}