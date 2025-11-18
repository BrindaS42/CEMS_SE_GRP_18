import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2, Send, Calendar } from 'lucide-react';
import { CreateAdModal } from './CreateAdModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Proptype shape for SponsorAd
const sponsorAdShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
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

export function DraftedAdsTab({ ads, onUpdateAd, onDeleteAd, onPublishAd }) {
  const [editingAd, setEditingAd] = useState(null);
  const [deletingAdId, setDeletingAdId] = useState(null);

  const handlePublish = (ad) => {
    onPublishAd(ad._id);
    toast.success('Ad published successfully');
  };

  const handleDelete = () => {
    if (deletingAdId) {
      onDeleteAd(deletingAdId);
      setDeletingAdId(null);
      toast.success('Ad deleted');
    }
  };

  if (ads.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Edit className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-muted-foreground mb-2">No drafted ads</h3>
        <p className="text-muted-foreground">
          Your saved drafts will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad, index) => (
          <Card 
            key={ad._id} 
            className="p-4 hover:shadow-lg transition-shadow animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="space-y-3">
              {/* Ad Content */}
              <div>
                <h3 className="mb-2">{ad.title}</h3>
                <p className="text-muted-foreground line-clamp-2">
                  {ad.description}
                </p>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(ad.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAd(ad)}
                  className="flex-1 gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handlePublish(ad)}
                  className="flex-1 gap-2"
                >
                  <Send className="w-4 h-4" />
                  Publish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingAdId(ad._id)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      <CreateAdModal
        ad={editingAd}
        open={!!editingAd}
        onClose={() => setEditingAd(null)}
        onSave={onUpdateAd}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingAdId} onOpenChange={() => setDeletingAdId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ad</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ad? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red hover:bg-red-dark text-black">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

DraftedAdsTab.propTypes = {
  ads: PropTypes.arrayOf(sponsorAdShape).isRequired,
  onUpdateAd: PropTypes.func.isRequired,
  onDeleteAd: PropTypes.func.isRequired,
  onPublishAd: PropTypes.func.isRequired,
};