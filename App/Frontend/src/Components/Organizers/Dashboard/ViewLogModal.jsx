import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Badge } from '@/Components/ui/badge';
import { fetchEventRegistrations } from '@/Store/event.slice';

export function ViewLogModal({ open, onClose, event }) {
  const dispatch = useDispatch();
  const { registrations, status } = useSelector((state) => ({
    registrations: event ? state.events.registrationsByEventId[event._id] : [],
    status: state.events.status,
  }));

  useEffect(() => {
    if (open && event?._id) {
      dispatch(fetchEventRegistrations(event._id));
    }
  }, [open, event, dispatch]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-lg overflow-scroll" >
        <DialogHeader>
          <DialogTitle>Registration Logs for &quot;{event?.title}&quot;</DialogTitle>
          <DialogDescription>
            A complete list of all students and teams registered for this event.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Reg. Status</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {status === 'loading' && (
                <TableRow>
                  <TableCell colSpan="5" className="text-center">Loading logs...</TableCell>
                </TableRow>
              )}
              {status !== 'loading' && (!registrations || registrations.length === 0) && (
                <TableRow>
                  <TableCell colSpan="5" className="text-center">No registrations found.</TableCell>
                </TableRow>
              )}
              {registrations?.map((reg) => (
                <TableRow key={reg._id}>
                  <TableCell className="font-medium">{reg.userId?.profile?.name || 'N/A'}</TableCell>
                  <TableCell>{reg.userId?.email}</TableCell>
                  <TableCell>{reg.teamName?.teamName || 'Individual'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(reg.status)}>{reg.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(reg.paymentStatus)}>{reg.paymentStatus}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

ViewLogModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
  }),
};