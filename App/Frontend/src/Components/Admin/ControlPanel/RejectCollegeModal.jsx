import { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Textarea } from '@/Components/ui/textarea';
import { toast } from 'sonner';

export function RejectCollegeModal({
  open,
  onOpenChange,
  college,
  onConfirm,
}) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    const words = reason.trim().split(/\s+/).filter(Boolean); // More robust word count
    if (words.length < 5) {
      toast.error('Please provide a reason with at least 5 words');
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
          <DialogTitle>Reject College Registration</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            You are about to reject the registration request from <strong>{college.name}</strong>. 
            Please provide a reason for rejection (minimum 5 words).
          </p>

          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for rejection..."
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
              Confirm Rejection
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

RejectCollegeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  college: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    logo: PropTypes.string,
    registrationDate: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['Pending', 'Registered', 'Suspended']).isRequired,
    pocName: PropTypes.string.isRequired,
    pocEmail: PropTypes.string.isRequired,
    pocPhone: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    website: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
};