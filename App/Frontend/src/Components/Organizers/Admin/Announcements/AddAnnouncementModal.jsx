import { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calender';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

export function AddAnnouncementModal({
  open,
  onClose,
  event,
  currentUserEmail,
  onSave,
}) {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [message, setMessage] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleSave = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const newAnnouncement = {
      id: `ann_${Date.now()}`,
      date: date.toISOString(),
      time,
      author: {
        id: 'user_1', // This would come from actual user context
        name: 'Current Organiser', // This would come from actual user context
        email: currentUserEmail,
      },
      message: message.trim(),
    };

    onSave(newAnnouncement);
    toast.success('Announcement added successfully');
    
    // Reset form
    setDate(new Date());
    setTime(new Date().toTimeString().slice(0, 5));
    setMessage('');
  };

  const handleClose = () => {
    // Reset form
    setDate(new Date());
    setTime(new Date().toTimeString().slice(0, 5));
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto smooth-scroll">
        <DialogHeader>
          <DialogTitle>Add Announcement</DialogTitle>
          <DialogDescription>
            Event: {event.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {date.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    if (newDate) setDate(newDate);
                    setDatePickerOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Author (auto-filled, non-editable) */}
          <div className="space-y-2">
            <Label>Author</Label>
            <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/30">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Current Organiser ({currentUserEmail})</span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Enter announcement message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-y min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              {message.length} characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Announcement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

AddAnnouncementModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  currentUserEmail: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};