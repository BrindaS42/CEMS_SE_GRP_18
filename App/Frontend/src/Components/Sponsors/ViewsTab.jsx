import PropTypes from 'prop-types';
import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Eye, Heart, Calendar, ExternalLink } from 'lucide-react';
import { ViewAdModal } from './Admin/ViewAdModal';

export function ViewsTab({ ads }) {
  const [viewingAd, setViewingAd] = useState(null);

  // Only show published ads in Views tab
  const publishedAds = ads.filter(ad => ad.status === 'Published');

  if (publishedAds.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-muted-foreground mb-2">No published ads yet</h3>
        <p className="text-muted-foreground">
          Publish some ads to see their analytics here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publishedAds.map((ad, index) => (
          <Card 
            key={ad.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Poster */}
            {ad.poster && (
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={ad.poster} 
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4 space-y-4">
              {/* Title */}
              <h3 className="line-clamp-2">{ad.title}</h3>

              {/* Analytics Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-light/10 dark:bg-blue-dark/10 rounded-lg">
                  <div className="flex items-center gap-2 text-blue mb-1">
                    <Eye className="w-4 h-4" />
                    <span>Views</span>
                  </div>
                  <p className="text-foreground">{ad.views.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-red-light/10 dark:bg-red-dark/10 rounded-lg">
                  <div className="flex items-center gap-2 text-red mb-1">
                    <Heart className="w-4 h-4" />
                    <span>Likes</span>
                  </div>
                  <p className="text-foreground">{ad.likes.toLocaleString()}</p>
                </div>
              </div>

              {/* Published Date */}
              <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t border-border">
                <Calendar className="w-4 h-4" />
                <span>
                  Published {ad.publishedAt 
                    ? new Date(ad.publishedAt).toLocaleDateString()
                    : new Date(ad.createdAt).toLocaleDateString()
                  }
                </span>
              </div>

              {/* View Ad Button */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setViewingAd(ad)}
              >
                <ExternalLink className="w-4 h-4" />
                View Ad
              </Button>
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
    </>
  );
}

const sponsorAdShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  poster: PropTypes.string,
  views: PropTypes.number.isRequired,
  likes: PropTypes.number.isRequired,
  publishedAt: PropTypes.string,
  createdAt: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
});

ViewsTab.propTypes = {
  ads: PropTypes.arrayOf(sponsorAdShape).isRequired,
};