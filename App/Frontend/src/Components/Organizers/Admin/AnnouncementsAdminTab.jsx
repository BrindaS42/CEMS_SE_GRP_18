import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Eye, Users, Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { AddAnnouncementModal } from './Announcements/AddAnnouncementModal';
import { ViewAnnouncementsModal } from './Announcements/ViewAnnouncementsModal';
import { EditAnnouncementModal } from './Announcements/EditAnnouncementModal';
import { DeleteAnnouncementModal } from './Announcements/DeleteAnnouncementModal';

export function AnnouncementsAdminTab({ 
  events, 
  currentUserEmail,
  onUpdateEvent,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Filter only ongoing and published events
  const ongoingEvents = events.filter(e => e.status === 'ongoing');
  const publishedEvents = events.filter(e => e.status === 'published');
  const displayEvents = [...ongoingEvents, ...publishedEvents];

  const handleAddAnnouncement = (event) => {
    setSelectedEvent(event);
    setAddModalOpen(true);
  };

  const handleViewAnnouncements = (event) => {
    setSelectedEvent(event);
    setViewModalOpen(true);
  };

  const handleEditAnnouncement = (event) => {
    setSelectedEvent(event);
    setEditModalOpen(true);
  };

  const handleDeleteAnnouncement = (event) => {
    setSelectedEvent(event);
    setDeleteModalOpen(true);
  };

  const getEventAnnouncements = (event) => {
    // Mock announcements - in production this would come from event.announcements
    return (event).announcements || [];
  };

  const getAnnouncementCount = (event) => {
    return getEventAnnouncements(event).length;
  };

  if (displayEvents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No ongoing or published events</p>
        <p className="text-sm mt-2">Announcements can only be managed for ongoing and published events</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayEvents.map((event) => {
          const mainTimeline = event.timeline[0];
          const isOngoing = event.status === 'ongoing';
          const announcementCount = getAnnouncementCount(event);

          return (
            <Card 
              key={event.id}
              className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                isOngoing 
                  ? 'border-[#34C759]/50' 
                  : 'border-[#6366f1]/50'
              }`}
            >
              {/* Poster */}
              {event.posterUrl && (
                <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                  <ImageWithFallback 
                    src={event.posterUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Status indicator */}
                  {isOngoing && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#34C759] text-white px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-xs font-medium">LIVE</span>
                    </div>
                  )}
                </div>
              )}

              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={
                      isOngoing 
                        ? 'text-[#34C759] border-[#34C759]/50 bg-[#34C759]/10'
                        : 'text-[#6366f1] border-[#6366f1]/50 bg-[#6366f1]/10'
                    }
                  >
                    {isOngoing ? 'Ongoing' : 'Published'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-3 flex-grow flex flex-col">
                {/* Team */}
                <div className="flex items-center gap-2 text-sm flex-shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Team:</span>
                  <span className="font-medium">{event.teamName}</span>
                </div>

                {/* Timeline Info */}
                {mainTimeline && (
                  <div className="space-y-2 text-sm flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-info" />
                      <span className="text-muted-foreground">
                        {new Date(mainTimeline.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">
                        {mainTimeline.duration.from} - {mainTimeline.duration.to}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-destructive" />
                      <span className="text-muted-foreground truncate">
                        {mainTimeline.venue}
                      </span>
                    </div>
                  </div>
                )}

                {/* Announcements count */}
                <div className="pt-2 border-t border-border flex-shrink-0">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      {announcementCount} {announcementCount === 1 ? 'Announcement' : 'Announcements'}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2 pt-4 flex-shrink-0">
                {/* Top row: View and Add */}
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-[#6366f1] border-[#6366f1]/50 hover:bg-[#6366f1] hover:text-white"
                    onClick={() => handleViewAnnouncements(event)}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handleAddAnnouncement(event)}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>

                {/* Bottom row: Edit and Delete */}
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-secondary border-secondary/50 hover:bg-secondary hover:text-black"
                    onClick={() => handleEditAnnouncement(event)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-destructive border-destructive/50 hover:bg-destructive hover:text-white"
                    onClick={() => handleDeleteAnnouncement(event)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      {selectedEvent && (
        <>
          <AddAnnouncementModal
            open={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            event={selectedEvent}
            currentUserEmail={currentUserEmail}
            onSave={(announcement) => {
              // Update event with new announcement
              const currentAnnouncements = getEventAnnouncements(selectedEvent);
              const updatedEvent = {
                ...selectedEvent,
                announcements: [...currentAnnouncements, announcement],
              };
              onUpdateEvent(selectedEvent.id, updatedEvent);
              setAddModalOpen(false);
            }}
          />

          <ViewAnnouncementsModal
            open={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            event={selectedEvent}
            announcements={getEventAnnouncements(selectedEvent)}
            currentUserEmail={currentUserEmail}
            onEdit={(announcement) => {
              setViewModalOpen(false);
              setEditModalOpen(true);
            }}
            onDelete={(announcementId) => {
              const currentAnnouncements = getEventAnnouncements(selectedEvent);
              const updatedAnnouncements = currentAnnouncements.filter(a => a.id !== announcementId);
              const updatedEvent = {
                ...selectedEvent,
                announcements: updatedAnnouncements,
              };
              onUpdateEvent(selectedEvent.id, updatedEvent);
            }}
          />

          <EditAnnouncementModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            event={selectedEvent}
            announcements={getEventAnnouncements(selectedEvent)}
            currentUserEmail={currentUserEmail}
            onSave={(announcementId, updatedData) => {
              const currentAnnouncements = getEventAnnouncements(selectedEvent);
              const updatedAnnouncements = currentAnnouncements.map(a => 
                a.id === announcementId ? { ...a, ...updatedData } : a
              );
              const updatedEvent = {
                ...selectedEvent,
                announcements: updatedAnnouncements,
              };
              onUpdateEvent(selectedEvent.id, updatedEvent);
              setEditModalOpen(false);
            }}
          />

          <DeleteAnnouncementModal
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            event={selectedEvent}
            announcements={getEventAnnouncements(selectedEvent)}
            onDelete={(announcementIds) => {
              const currentAnnouncements = getEventAnnouncements(selectedEvent);
              const updatedAnnouncements = currentAnnouncements.filter(
                a => !announcementIds.includes(a.id)
              );
              const updatedEvent = {
                ...selectedEvent,
                announcements: updatedAnnouncements,
              };
              onUpdateEvent(selectedEvent.id, updatedEvent);
              setDeleteModalOpen(false);
            }}
          />
        </>
      )}
    </>
  );
}

AnnouncementsAdminTab.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentUserEmail: PropTypes.string.isRequired,
  onUpdateEvent: PropTypes.func.isRequired,
};