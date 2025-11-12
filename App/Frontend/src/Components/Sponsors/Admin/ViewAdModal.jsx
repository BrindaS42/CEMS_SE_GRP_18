import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Calendar, Eye, Heart, MapPin, Phone, Mail } from 'lucide-react';
import { ScrollArea } from '../../../components/ui/scroll-area';

// Proptype shape for SponsorAd
const sponsorAdShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  sponsorId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  videos: PropTypes.arrayOf(PropTypes.string).isRequired,
  address: PropTypes.string.isRequired,
  contact: PropTypes.string.isRequired,
  poster: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['Drafted', 'Published']).isRequired,
  views: PropTypes.number.isRequired,
  likes: PropTypes.number.isRequired,
  createdAt: PropTypes.string.isRequired,
  publishedAt: PropTypes.string,
});

export function ViewAdModal({ ad, open, onClose }) {
  if (!ad) return null;

  const contactInfo = ad.contact ? ad.contact.split(',').map(c => c.trim()) : [];
  const phoneNumbers = contactInfo.filter(c => /^\+?\d[\d\s-()]+$/.test(c));
  const emails = contactInfo.filter(c => /\S+@\S+\.\S+/.test(c));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{ad.title}</DialogTitle>
          <DialogDescription>
            View advertisement details and analytics
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Poster Image */}
            {ad.poster && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={ad.poster} 
                  alt={ad.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            {/* Stats */}
            {ad.status === 'Published' && (
              <div className="flex gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue" />
                  <span className="text-muted-foreground">{ad.views} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red" />
                  <span className="text-muted-foreground">{ad.likes} likes</span>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="mb-2 text-muted-foreground">Description</h3>
              <p className="text-foreground whitespace-pre-wrap">{ad.description}</p>
            </div>

            {/* Images Gallery */}
            {ad.images && ad.images.length > 0 && (
              <div>
                <h3 className="mb-3 text-muted-foreground">Images</h3>
                <div className="grid grid-cols-2 gap-3">
                  {ad.images.map((image, index) => (
                    <div key={image} className="rounded-lg overflow-hidden border border-border">
                      <img 
                        src={image} 
                        alt={`${ad.title} ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {ad.videos && ad.videos.length > 0 && (
              <div>
                <h3 className="mb-3 text-muted-foreground">Videos</h3>
                <div className="space-y-2">
                  {ad.videos.map((video, index) => (
                    <a 
                      key={video}
                      href={video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-muted rounded-lg hover:bg-accent transition-colors"
                    >
                      Video {index + 1}: {video}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Address */}
            {ad.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue mt-1 flex-shrink-0" />
                <div>
                  <h3 className="mb-1 text-muted-foreground">Address</h3>
                  <p className="text-foreground">{ad.address}</p>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(phoneNumbers.length > 0 || emails.length > 0) && (
              <div>
                <h3 className="mb-3 text-muted-foreground">Contact Information</h3>
                <div className="space-y-2">
                  {phoneNumbers.map((phone) => (
                    <div key={phone} className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue" />
                      <span className="text-foreground">{phone}</span>
                    </div>
                  ))}
                  {emails.map((email) => (
                    <div key={email} className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue" />
                      <span className="text-foreground">{email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 pt-4 border-t border-border text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {ad.status === 'Published' && ad.publishedAt 
                    ? `Published on ${new Date(ad.publishedAt).toLocaleDateString()}`
                    : `Created on ${new Date(ad.createdAt).toLocaleDateString()}`
                  }
                </span>
              </div>
              <Badge variant={ad.status === 'Published' ? 'default' : 'secondary'}>
                {ad.status}
              </Badge>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

ViewAdModal.propTypes = {
  ad: sponsorAdShape,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
