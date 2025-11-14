import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function UnsuspendAdModal({ open, onOpenChange, ad, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Unsuspend Advertisement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to unsuspend the ad G<strong>{ad.title}</strong>?
          </p>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); onOpenChange(false); }}
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

UnsuspendAdModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  ad: PropTypes.shape({
    title: PropTypes.string.isRequired,
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
};