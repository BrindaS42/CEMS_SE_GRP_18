import { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calender';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, User, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';

export function EditAnnouncementModal({
  open,
  onClose,
  event,
  announcements,
  onSave,
}) {
  const { user } = useSelector((state) => state.auth);
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState(new Date());
  const [editTime, setEditTime] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Sort announcements by date/time in reverse chronological order
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Filter only announcements the user can edit
  const editableAnnouncements = sortedAnnouncements.filter(
    a => a.author?._id === user?.id
  );

  const handleEditClick = (announcement) => {
    setEditingId(announcement._id);
    setEditDate(new Date(announcement.date));
    setEditTime(announcement.time);
    setEditMessage(announcement.message);
  };

  const handleSave = () => {
    if (!editMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (editingId) {
      onSave(editingId, {
        date: editDate.toISOString(),
        time: editTime,
        message: editMessage.trim(),
      });
      toast.success('Announcement updated successfully');
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditDate(new Date());
    setEditTime('');
    setEditMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto smooth-scroll">
        <DialogHeader>
          <DialogTitle>Edit Announcements</DialogTitle>
          <DialogDescription>
            Event: {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {editableAnnouncements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No announcements to edit</p>
              <p className="text-sm mt-2">You can only edit announcements you created</p>
            </div>
          ) : (
            editableAnnouncements.map((announcement) => (
              <Card 
                key={announcement._id} 
                className={`hover:shadow-md transition-shadow ${
                  editingId === announcement._id ? 'border-primary' : ''
                }`}
              >
                <CardContent className="pt-6">
                  {editingId === announcement._id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Date Picker */}
                        <div className="space-y-2">
                          <Label>Date *</Label>
                          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="w-4 h-4 mr-2" />
                                {editDate.toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={editDate}
                                onSelect={(newDate) => {
                                  if (newDate) setEditDate(newDate);
                                  setDatePickerOpen(false);
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Time Picker */}
                        <div className="space-y-2">
                          <Label htmlFor="edit-time">Time *</Label>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <Input
                              id="edit-time"
                              type="time"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <Label htmlFor="edit-message">Message *</Label>
                        <Textarea
                          id="edit-message"
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          rows={4}
                          className="resize-y"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button onClick={handleSave}>
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="space-y-3">
                      {/* Date, Time, Author */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
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

                      {/* Edit button */}
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => handleEditClick(announcement)}
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

EditAnnouncementModal.propTypes = {
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
  onSave: PropTypes.func.isRequired,
};