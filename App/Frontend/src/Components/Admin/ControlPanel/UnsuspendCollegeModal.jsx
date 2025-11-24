import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

export function UnsuspendCollegeModal({
  open,
  onOpenChange,
  college,
  onConfirm,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Unsuspend College</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to unsuspend <strong>{college.name}</strong>?
          </p>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
              className="px-4 py-2 rounded-md bg-success text-success-foreground hover:bg-success-hover transition-colors"
            >
              Yes, Unsuspend
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

UnsuspendCollegeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  college: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
};