import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Calendar, Clock, CreditCard, Users, User, FileText } from 'lucide-react';

export function RegistrationPreviewModal({
  isOpen,
  onClose,
  event,
}) {
  const config = event?.config || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto smooth-scroll">
        <DialogHeader>
          <DialogTitle>Registration Preview - {event.title}</DialogTitle>
          <DialogDescription>
            Review the complete registration configuration for this event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Event Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Event Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {event.timeline[0] && (
                  <>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {new Date(event.timeline[0].date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">
                          {event.timeline[0].duration.from} - {event.timeline[0].duration.to}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-medium">Payment Configuration</h3>
              </div>

              {config.isFree ? (
                <Badge variant="outline" className="bg-success/10 text-success">
                  Free Event
                </Badge>
              ) : (
                <div className="space-y-3">
                  <Badge variant="outline" className="bg-destructive/10 text-destructive">
                    Paid Event
                  </Badge>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {(config.combos || []).map((combo) => (
                      <div
                        key={combo.id}
                        className="border-2 rounded-lg p-4"
                        style={{ borderColor: combo.color + '40' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: combo.color }}
                          />
                          <span className="font-medium">{combo.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{combo.description}</p>
                        <p className="text-lg font-medium text-primary">₹{combo.fees}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registration Type */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                {config.registrationType === 'Team' ? (
                  <Users className="w-5 h-5 text-primary" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
                <h3 className="text-lg font-medium">Registration Type</h3>
              </div>

              <div className="space-y-2">
                <Badge variant="outline" className="capitalize">
                  {config.registrationType} Registration
                </Badge>
                {config.registrationType === 'Team' && (
                  <p className="text-sm text-muted-foreground">
                    Team size: {config.teamSizeRange?.min || 'N/A'} -{' '}
                    {config.teamSizeRange?.max || 'N/A'} members
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Registration Fields */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-medium">Registration Form Fields</h3>
              </div>

              <div className="space-y-3">
                {(config.registrationFields || []).map((field, index) => (
                  <div key={field.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <span className="font-medium">{field.title}</span>
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </div>
                    <Badge variant="outline" className="capitalize">{field.inputType}</Badge>
                  </div>
                ))}

                {(config.registrationFields || []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No custom fields configured
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>Edit Configuration</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const eventShape = PropTypes.shape({
  title: PropTypes.string.isRequired,
  timeline: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    duration: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
  })).isRequired,
});

RegistrationPreviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: eventShape.isRequired,
};