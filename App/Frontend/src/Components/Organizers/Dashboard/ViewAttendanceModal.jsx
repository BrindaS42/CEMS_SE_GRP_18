import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/Components/ui/accordion';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { fetchEventAttendees } from '@/Store/event.slice';

export function ViewAttendanceModal({ open, onClose, event }) {
  const dispatch = useDispatch();
  const { attendeesByTimeline, status } = useSelector((state) => ({
    attendeesByTimeline: event ? state.events.attendeesByEventId[event._id] : [],
    status: state.events.status,
  }));

  useEffect(() => {
    if (open && event?._id) {
      dispatch(fetchEventAttendees(event._id));
    }
  }, [open, event, dispatch]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Attendance for &quot;{event?.title}&quot;</DialogTitle>
          <DialogDescription>
            List of attendees for each timeline entry.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {status === 'loading' && <p className="text-center">Loading attendance...</p>}
          {status !== 'loading' && (!attendeesByTimeline || attendeesByTimeline.length === 0) && (
            <p className="text-center text-muted-foreground">No attendance data available.</p>
          )}
          <Accordion type="single" collapsible className="w-full">
            {attendeesByTimeline?.map(({ timeline, attendees }) => (
              <AccordionItem key={timeline._id} value={timeline._id}>
                <AccordionTrigger>
                  {timeline.title} ({attendees.length} Attendees)
                </AccordionTrigger>
                <AccordionContent>
                  {attendees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No one attended this session.</p>
                  ) : (
                    <ul className="space-y-2">
                      {attendees.map(att => (
                        <li key={att._id} className="text-sm flex justify-between">
                          <span>{att.userId?.profile?.name}</span>
                          <span className="text-muted-foreground">{att.userId?.email}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

ViewAttendanceModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
  }),
};