import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, User, Edit, Trash2 } from 'lucide-react';
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

export function ViewAnnouncementsModal({
  open,
  onClose,
  event,
  announcements,
  onEdit,
  onDelete,
}) {
  const { user } = useSelector((state) => state.auth);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  // Sort announcements by date/time in reverse chronological order
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(`${b.date} ${b.time}`).getTime();
    return dateB - dateA;
  });

  const handleDeleteClick = (announcementId) => {
    setAnnouncementToDelete(announcementId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (announcementToDelete) {
      onDelete(announcementToDelete);
      toast.success('Announcement deleted successfully');
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  const canEdit = (announcement) => {
    return announcement.author?._id === user?.id;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto smooth-scroll">
          <DialogHeader>
            <DialogTitle>View Announcements</DialogTitle>
            <DialogDescription>
              Event: {event.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {sortedAnnouncements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No announcements yet</p>
                <p className="text-sm mt-2">Add your first announcement to get started</p>
              </div>
            ) : (
              sortedAnnouncements.map((announcement) => (
                <Card key={announcement._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Date, Time, Author */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(announcement.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{announcement.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{announcement.author?.profile?.name || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {announcement.message}
                      </p>

                      {/* Action buttons */}
                      {canEdit(announcement) && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-secondary border-secondary/50 hover:bg-secondary hover:text-black"
                            onClick={() => onEdit(announcement)}
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-destructive border-destructive/50 hover:bg-destructive hover:text-white"
                            onClick={() => handleDeleteClick(announcement._id)}
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setAnnouncementToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

ViewAnnouncementsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  announcements: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    author: PropTypes.shape({
      _id: PropTypes.string,
      profile: PropTypes.shape({ name: PropTypes.string }),
    }).isRequired,
    message: PropTypes.string.isRequired,
  })).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};