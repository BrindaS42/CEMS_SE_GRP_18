import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Eye, Heart, Calendar, Edit2 } from 'lucide-react';
import { ViewAdModal } from './ViewAdModal';
import { CreateAdModal } from './CreateAdModal';

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

export function PublishedAdsTab({ ads, onUpdateAd }) {
  const [viewingAd, setViewingAd] = useState(null);
  const [editingAd, setEditingAd] = useState(null);

  if (ads.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-muted-foreground mb-2">No published ads</h3>
        <p className="text-muted-foreground">
          Your published ads will appear here
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
            className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in-up cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => setViewingAd(ad)}
          >
            {/* Poster */}
            {ad.poster && (
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={ad.poster} 
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4 space-y-3">
              {/* Title */}
              <h3>{ad.title}</h3>

              {/* Stats */}
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{ad.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{ad.likes}</span>
                </div>
              </div>

              {/* Published Date */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  {ad.publishedAt 
                    ? new Date(ad.publishedAt).toLocaleDateString()
                    : new Date(ad.createdAt).toLocaleDateString()
                  }
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingAd(ad);
                  }}
                  className="flex-1 gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingAd(ad);
                  }}
                  className="flex-1 gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Modal */}
      <ViewAdModal
        ad={viewingAd}
        open={!!viewingAd}
        onClose={() => setViewingAd(null)}
      />

      {/* Edit Modal */}
      <CreateAdModal
        ad={editingAd}
        open={!!editingAd}
        onClose={() => setEditingAd(null)}
        onSave={onUpdateAd}
      />
    </>
  );
}

PublishedAdsTab.propTypes = {
  ads: PropTypes.arrayOf(sponsorAdShape).isRequired,
  onUpdateAd: PropTypes.func.isRequired,
};