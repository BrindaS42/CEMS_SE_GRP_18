import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { X, Upload, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { toast } from 'sonner';

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

export function CreateAdModal({ ad, open, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [poster, setPoster] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [contactError, setContactError] = useState('');

  // Reset form when ad changes or modal opens
  useEffect(() => {
    if (ad) {
      setTitle(ad.title || '');
      setDescription(ad.description || '');
      setImages(ad.images || []);
      setVideos(ad.videos || []);
      setAddress(ad.address || '');
      setPoster(ad.poster || '');
      
      // Parse contact info
      const contactInfo = ad.contact ? ad.contact.split(',').map(c => c.trim()) : [];
      const phoneNumbers = contactInfo.filter(c => /^\+?\d[\d\s-()]+$/.test(c));
      const emails = contactInfo.filter(c => /\S+@\S+\.\S+/.test(c));
      setPhone(phoneNumbers[0] || '');
      setEmail(emails[0] || '');
    } else {
      // Reset for new ad
      setTitle('');
      setDescription('');
      setImages([]);
      setVideos([]);
      setAddress('');
      setPhone('');
      setEmail('');
      setPoster('');
    }
    setImageInput('');
    setVideoInput('');
    setContactError('');
  }, [ad, open]);

  const handleAddImage = () => {
    if (imageInput.trim()) {
      setImages([...images, imageInput.trim()]);
      setImageInput('');
    }
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddVideo = () => {
    if (videoInput.trim()) {
      setVideos([...videos, videoInput.trim()]);
      setVideoInput('');
    }
  };

  const handleRemoveVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return false;
    }

    // At least one contact method required
    if (!phone.trim() && !email.trim()) {
      setContactError('At least one contact method (phone or email) is required');
      return false;
    }

    // Validate email format if provided
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      setContactError('Please enter a valid email address');
      return false;
    }

    setContactError('');
    return true;
  };

  const handleSave = (action) => {
    if (!validateForm()) return;

    const contact = [phone.trim(), email.trim()].filter(Boolean).join(', ');

    const adData = {
      ...(ad?._id && { _id: ad._id }),
      title: title.trim(),
      description: description.trim(),
      images,
      videos,
      address: address.trim(),
      contact,
      poster: poster.trim(),
    };

    onSave(adData, action);
    onClose();
    
    toast.success(
      action === 'save' 
        ? 'Ad saved as draft' 
        : 'Ad published successfully'
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-x-auto w-full min-w-0">
        <DialogHeader>
          <DialogTitle>{ad ? 'Edit Ad' : 'Create New Ad'}</DialogTitle>
          <DialogDescription>
            {ad ? 'Edit your advertisement details and media' : 'Create a new advertisement with details and media'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter ad title"
                className="w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter ad description"
                rows={4}
                className="w-full resize-none"
              />
            </div>

            {/* Poster */}
            <div className="space-y-2">
              <Label htmlFor="poster">Poster Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="poster"
                  value={poster}
                  onChange={(e) => setPoster(e.target.value)}
                  placeholder="https://example.com/poster.jpg"
                  className="flex-1"
                />
              </div>
              {poster && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                  <img 
                    src={poster} 
                    alt="Poster preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label htmlFor="images-input">Images</Label>
              <div className="flex gap-2">
                <Input
                  id="images-input"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button 
                  type="button"
                  onClick={handleAddImage}
                  variant="outline"
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Add
                </Button>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {images.map((image, index) => (
                    <div key={`image-${index}`} className="relative group">
                      <img 
                        src={image} 
                        alt={`Image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-background rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos */}
            <div className="space-y-2">
              <Label htmlFor="videos-input">Videos (URLs)</Label>
              <div className="flex gap-2">
                <Input
                  id="videos-input"
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVideo())}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1"
                />
                <Button 
                  type="button"
                  onClick={handleAddVideo}
                  variant="outline"
                  className="gap-2"
                >
                  <VideoIcon className="w-4 h-4" />
                  Add
                </Button>
              </div>
              {videos.length > 0 && (
                <div className="space-y-2 mt-3">
                  {videos.map((video, index) => (
                    <div key={`video-${index}`} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <VideoIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="flex-1 truncate text-foreground min-w-0">{video}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(index)}
                        className="p-1 hover:bg-background rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
                className="w-full"
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <Label htmlFor="contact-phone">
                Contact Information <span className="text-red">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="contact-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                />
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                />
              </div>
              {contactError && (
                <p className="text-red">{contactError}</p>
              )}
              <p className="text-muted-foreground">At least one contact method is required</p>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave('save')}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSave('publish')}>
            Publish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

CreateAdModal.propTypes = {
  ad: sponsorAdShape,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
