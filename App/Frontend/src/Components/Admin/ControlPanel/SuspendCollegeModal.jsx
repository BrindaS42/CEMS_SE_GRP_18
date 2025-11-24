import PropTypes from 'prop-types';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Textarea } from '@/Components/ui/textarea';
import { toast } from 'sonner';

export function SuspendCollegeModal({
  open,
  onOpenChange,
  college,
  onConfirm,
}) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }
    onConfirm(reason);
    setReason('');
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) setReason('');
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Suspend College</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            You are about to suspend <strong>{college.name}</strong>. 
            Please provide a reason for suspension.
          </p>

          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for suspension..."
            rows={4}
            className="resize-none"
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                onOpenChange(false);
                setReason('');
              }}
              className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors"
            >
              Confirm Suspension
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

SuspendCollegeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  college: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
};