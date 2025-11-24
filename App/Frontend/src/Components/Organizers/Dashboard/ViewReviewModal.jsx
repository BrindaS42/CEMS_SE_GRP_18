import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Star } from 'lucide-react';
import { fetchEventReviews } from '@/Store/event.slice';

export function ViewReviewModal({ open, onClose, event }) {
  const dispatch = useDispatch();
  const { reviews, status } = useSelector((state) => ({
    reviews: event ? state.events.reviewsByEventId[event._id] : [],
    status: state.events.status,
  }));

  useEffect(() => {
    if (open && event?._id) {
      dispatch(fetchEventReviews(event._id));
    }
  }, [open, event, dispatch]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Reviews for &quot;{event?.title}&quot;</DialogTitle>
          <DialogDescription>
            Feedback and ratings submitted by participants.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {status === 'loading' && <p className="text-center">Loading reviews...</p>}
            {status !== 'loading' && (!reviews || reviews.length === 0) && (
              <p className="text-center text-muted-foreground">No reviews submitted yet.</p>
            )}
            {reviews?.map((review) => (
              <Card key={review._id}>
                <CardHeader className="flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">
                    {review.by?.profile?.name || 'Anonymous'}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="font-bold">{review.rating}</span>
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{review.review}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

ViewReviewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
  }),
};