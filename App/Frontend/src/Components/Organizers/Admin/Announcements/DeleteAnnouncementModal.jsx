import { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, User } from 'lucide-react';
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

export function DeleteAnnouncementModal({
  open,
  onClose,
  event,
  announcements,
  onDelete,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Sort announcements by date/time in reverse chronological order
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`).getTime();
    const dateB = new Date(`${b.date} ${b.time}`).getTime();
    return dateB - dateA;
  });

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedAnnouncements.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedAnnouncements.map(a => a.id));
    }
  };

  const handleDeleteClick = () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one announcement to delete');
      return;
    }
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(selectedIds);
    toast.success(`${selectedIds.length} announcement${selectedIds.length > 1 ? 's' : ''} deleted successfully`);
    setSelectedIds([]);
    setConfirmDialogOpen(false);
    onClose();
  };

  const handleClose = () => {
    setSelectedIds([]);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto smooth-scroll">
          <DialogHeader>
            <DialogTitle>Delete Announcements</DialogTitle>
            <DialogDescription>
              Event: {event.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {sortedAnnouncements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No announcements to delete</p>
              </div>
            ) : (
              <>
                {/* Select All */}
                <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/30">
                  <Checkbox
                    id="select-all"
                    checked={selectedIds.length === sortedAnnouncements.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <label
                    htmlFor="select-all"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Select All ({selectedIds.length} of {sortedAnnouncements.length} selected)
                  </label>
                </div>

                {/* Announcements List */}
                <div className="space-y-3">
                  {sortedAnnouncements.map((announcement) => (
                    <Card 
                      key={announcement.id}
                      className={`hover:shadow-md transition-shadow cursor-pointer ${
                        selectedIds.includes(announcement.id) ? 'border-destructive' : ''
                      }`}
                      onClick={() => toggleSelection(announcement.id)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex gap-3">
                          {/* Checkbox */}
                          <div className="flex-shrink-0 pt-1">
                            <Checkbox
                              id={`checkbox-${announcement.id}`}
                              checked={selectedIds.includes(announcement.id)}
                              onCheckedChange={() => toggleSelection(announcement.id)}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-3">
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
                                <span>{announcement.author.name || announcement.author.email}</span>
                              </div>
                            </div>

                            {/* Message */}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-2">
                              {announcement.message}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteClick}
              disabled={selectedIds.length === 0}
            >
              Delete Selected ({selectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete the selected announcements?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedIds.length} announcement{selectedIds.length > 1 ? 's' : ''}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDialogOpen(false)}>
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

DeleteAnnouncementModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  announcements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    author: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string.isRequired,
    }).isRequired,
    message: PropTypes.string.isRequired,
  })).isRequired,
  onDelete: PropTypes.func.isRequired,
};