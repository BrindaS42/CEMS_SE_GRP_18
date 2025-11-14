import PropTypes from 'prop-types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Edit, Trash2, Send, Users, Lock, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { ViewEventModal } from './ViewEventModal';
import { EditEventModal } from './EditEventModal';

export function DraftedEventsTab({ 
  events, 
  currentUserEmail,
  onDeleteEvent,
  onEditEvent,
  onPublishEvent,
  onNavigateToRegistration,
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventToPublish, setEventToPublish] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setViewModalOpen(true);
  };

  const handleEditClick = (event) => {
    setSelectedEvent(event);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (eventId) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      const event = events.find(e => e.id === eventToDelete);
      onDeleteEvent(eventToDelete);
      toast.success(`Event "${event?.title}" deleted successfully`);
      setEventToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handlePublish = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Check if user is the team leader
    if (event.leaderEmail !== currentUserEmail) {
      toast.error('Only team leaders can publish events');
      return;
    }

    // Check for pending sub-events
    const hasPending = event.subEvents.some(se => se.status === 'Pending');
    if (hasPending) {
      toast.error('Some sub-events are still pending. Please wait for responses.');
      return;
    }

    // Check for rejected sub-events
    const rejectedSubEvents = event.subEvents.filter(se => se.status === 'Rejected');
    if (rejectedSubEvents.length > 0) {
      // Show confirmation dialog
      setEventToPublish(event);
      setPublishDialogOpen(true);
      return;
    }

    // All sub-events approved, publish directly
    onPublishEvent(eventId);
    toast.success(`Event "${event.title}" published successfully`);
  };

  const handlePublishConfirm = () => {
    if (!eventToPublish) return;

    // Remove rejected sub-events and publish
    const updatedEvent = {
      ...eventToPublish,
      subEvents: eventToPublish.subEvents.filter(se => se.status !== 'Rejected'),
    };
    
    onEditEvent(eventToPublish.id, updatedEvent);
    onPublishEvent(eventToPublish.id);
    
    const rejectedCount = eventToPublish.subEvents.filter(se => se.status === 'Rejected').length;
    toast.success(`Event "${eventToPublish.title}" published successfully. ${rejectedCount} rejected sub-event(s) removed.`);
    
    setPublishDialogOpen(false);
    setEventToPublish(null);
  };

  const canUserEdit = (event) => {
    // Only team leader can edit and publish
    return event.leaderEmail === currentUserEmail;
  };

  const canPublish = (event) => {
    // Must be leader and no pending sub-events
    if (!canUserEdit(event)) return false;
    return !event.subEvents.some(se => se.status === 'Pending');
  };

  // Helper function to get tooltip content for Publish button
  const getPublishTooltipContent = (userCanEdit, userCanPublish) => {
    if (userCanPublish) return null; // No tooltip if enabled
    if (!userCanEdit) return 'Only team leaders can publish';
    return 'Sub-event invitations pending';
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No drafted events yet</p>
        <p className="text-sm mt-2">Create your first event to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const userCanEdit = canUserEdit(event);
          const userCanPublish = canPublish(event);
          const mainTimeline = event.timeline[0];
          const publishTooltip = getPublishTooltipContent(userCanEdit, userCanPublish);

          return (
            <Card 
              key={event.id}
              className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300"
            >
              {/* Poster */}
              {event.posterUrl && (
                <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                  <ImageWithFallback 
                    src={event.posterUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Badge variant="outline" className="text-muted-foreground border-muted-foreground/50 bg-muted/30">
                    Drafted
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

                {/* Category Tags */}
                {event.categoryTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {event.categoryTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

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

                {/* Sub-events status */}
                {event.subEvents.length > 0 && (
                  <div className="pt-2 border-t border-border flex-shrink-0">
                    <p className="text-xs text-muted-foreground mb-1">Sub-events: {event.subEvents.length}</p>
                    <div className="flex gap-1 text-xs flex-wrap">
                      {event.subEvents.filter(se => se.status === 'Approved').length > 0 && (
                        <Badge variant="outline" className="text-success border-success/50 bg-success/10 text-xs gap-1">
                          <span>✅</span> {event.subEvents.filter(se => se.status === 'Approved').length} Approved
                        </Badge>
                      )}
                      {event.subEvents.filter(se => se.status === 'Pending').length > 0 && (
                        <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10 text-xs gap-1">
                          <span>🕓</span> {event.subEvents.filter(se => se.status === 'Pending').length} Pending
                        </Badge>
                      )}
                      {event.subEvents.filter(se => se.status === 'Rejected').length > 0 && (
                        <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/10 text-xs gap-1">
                          <span>❌</span> {event.subEvents.filter(se => se.status === 'Rejected').length} Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Access control notice */}
                {!userCanEdit && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                    <Lock className="w-3 h-3" />
                    <span>View-only access</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-2 pt-4 flex-shrink-0">
                {/* Top row: View, Edit, Delete, and Registration */}
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-info border-info/50 hover:bg-info hover:text-white"
                    onClick={() => handleViewEvent(event)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>

                  {onNavigateToRegistration && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[#6366f1] border-[#6366f1]/50 hover:bg-[#6366f1] hover:text-white"
                            onClick={() => onNavigateToRegistration(event.id)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Registration</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full text-secondary border-secondary/50 hover:bg-secondary hover:text-black"
                            onClick={() => handleEditClick(event)}
                            disabled={!userCanEdit}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!userCanEdit && (
                        <TooltipContent>
                          <p>Only team leaders can edit</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full text-destructive border-destructive/50 hover:bg-destructive hover:text-black"
                            onClick={() => handleDeleteClick(event.id)}
                            disabled={!userCanEdit}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!userCanEdit && (
                        <TooltipContent>
                          <p>Only team leaders can delete</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Bottom row: Publish */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full">
                        <Button
                          className="w-full gap-2"
                          onClick={() => handlePublish(event.id)}
                          disabled={!userCanPublish}
                        >
                          <Send className="w-4 h-4" />
                          Publish
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {publishTooltip && (
                      <TooltipContent>
                        <p>{publishTooltip}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{events.find(e => e.id === eventToDelete)?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ViewEventModal 
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        event={selectedEvent}
        currentUserEmail={currentUserEmail}
        onEdit={(eventId) => {
          const event = events.find(e => e.id === eventId);
          if (event) {
            setSelectedEvent(event);
            setViewModalOpen(false);
            setEditModalOpen(true);
          }
        }}
      />

      <EditEventModal 
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        event={selectedEvent}
        currentUserEmail={currentUserEmail}
        onSave={onEditEvent}
      />

      {/* Publish Confirmation Dialog (for rejected sub-events) */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Some sub-events were rejected. Do you still want to publish?</AlertDialogTitle>
            <AlertDialogDescription>
              Rejected sub-events will not be part of your event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setPublishDialogOpen(false);
              setEventToPublish(null);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePublishConfirm}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Yes (Publish)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const eventShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  leaderEmail: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  posterUrl: PropTypes.string,
  categoryTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  timeline: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    duration: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
    venue: PropTypes.string.isRequired,
  })).isRequired,
  subEvents: PropTypes.arrayOf(PropTypes.shape({
    status: PropTypes.string.isRequired,
  })).isRequired,
});

DraftedEventsTab.propTypes = {
  events: PropTypes.arrayOf(eventShape).isRequired,
  currentUserEmail: PropTypes.string.isRequired,
  onDeleteEvent: PropTypes.func.isRequired,
  onEditEvent: PropTypes.func.isRequired,
  onPublishEvent: PropTypes.func.isRequired,
  onNavigateToRegistration: PropTypes.func,
};