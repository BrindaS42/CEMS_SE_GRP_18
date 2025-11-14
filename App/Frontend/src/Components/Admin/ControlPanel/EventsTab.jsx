import { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Eye, Ban, Check, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ViewEventModal } from './ViewEventModal';
import { SuspendEventModal } from './SuspendEventModal';
import { UnsuspendEventModal } from './UnsuspendEventModal';
import { motion, AnimatePresence } from 'motion/react';
import { SegmentedControl } from '@/components/ui/segmented-control';

// Helper function to refactor nested ternary
const getEventBadgeVariant = (status) => {
  switch (status) {
    case 'Published':
      return 'default';
    case 'Suspended':
      return 'destructive';
    case 'Completed':
      return 'secondary';
    default:
      return 'default';
  }
};

export function EventsTab({ events, onSuspendEvent, onUnsuspendEvent }) {
  const [activeSubTab, setActiveSubTab] = useState('Published');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [unsuspendModalOpen, setUnsuspendModalOpen] = useState(false);

  const subTabs = ['Published', 'Suspended', 'Completed'];

  const filteredEvents = events
    .filter(event => event.status === activeSubTab)
    .filter(event => 
      searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizerTeam.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleView = (event) => {
    setSelectedEvent(event);
    setViewModalOpen(true);
  };

  const handleSuspend = (event) => {
    setSelectedEvent(event);
    setSuspendModalOpen(true);
  };

  const handleUnsuspend = (event) => {
    setSelectedEvent(event);
    setUnsuspendModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between">
        <SegmentedControl
          options={[
            { value: 'Published', label: 'Published' },
            { value: 'Suspended', label: 'Suspended' },
            { value: 'Completed', label: 'Completed' },
          ]}
          value={activeSubTab}
          onChange={(value) => setActiveSubTab(value)}
          variant="orange"
        />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Search ${activeSubTab} Events...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="flex-1 overflow-y-auto smooth-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-4"
          >
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No {activeSubTab.toLowerCase()} events found
              </div>
            ) : (
              filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    'bg-card border border-border rounded-lg p-6',
                    'flex items-center gap-6',
                    'hover:shadow-lg transition-shadow duration-300'
                  )}
                >
                  {/* Event Poster */}
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {event.poster ? (
                      <img src={event.poster} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{event.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.venue}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        By: {event.organizerTeam}
                      </span>
                      <Badge 
                        variant={getEventBadgeVariant(event.status)}
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleView(event)}
                      className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors micro-interact"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {activeSubTab === 'Published' && (
                      <button
                        onClick={() => handleSuspend(event)}
                        className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors micro-interact"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}

                    {activeSubTab === 'Suspended' && (
                      <button
                        onClick={() => handleUnsuspend(event)}
                        className="px-3 py-1.5 rounded-md bg-success text-success-foreground hover:bg-success-hover transition-colors micro-interact"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      {selectedEvent && (
        <>
          <ViewEventModal
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
            event={selectedEvent}
            onSuspend={() => {
              setViewModalOpen(false);
              setSuspendModalOpen(true);
            }}
            onUnsuspend={() => {
              onUnsuspendEvent(selectedEvent.id);
              setViewModalOpen(false);
            }}
          />
          <SuspendEventModal
            open={suspendModalOpen}
            onOpenChange={setSuspendModalOpen}
            event={selectedEvent}
            onConfirm={(reason) => {
              onSuspendEvent(selectedEvent.id, reason);
              setSuspendModalOpen(false);
            }}
          />
          <UnsuspendEventModal
            open={unsuspendModalOpen}
            onOpenChange={setUnsuspendModalOpen}
            event={selectedEvent}
            onConfirm={() => {
              onUnsuspendEvent(selectedEvent.id);
              setUnsuspendModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}

EventsTab.propTypes = {
  events: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    venue: PropTypes.string.isRequired,
    organizerTeam: PropTypes.string.isRequired,
    organizerEmail: PropTypes.string.isRequired,
    poster: PropTypes.string,
    status: PropTypes.oneOf(['Published', 'Suspended', 'Completed']).isRequired,
    registrations: PropTypes.number.isRequired,
    categoryTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  onSuspendEvent: PropTypes.func.isRequired,
  onUnsuspendEvent: PropTypes.func.isRequired,
};