import PropTypes from 'prop-types';
import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Eye, Edit2, Plus } from 'lucide-react';
import { ViewAdModal } from './Admin/ViewAdModal';
import { CreateAdModal } from './Admin/CreateAdModal';

export function AdsTab({ ads, onNavigateToCreateAd, onUpdateAd }) {
  const [viewingAd, setViewingAd] = useState(null);
  const [editingAd, setEditingAd] = useState(null);

  // Only show published ads in Ads tab
  const publishedAds = ads.filter(ad => ad.status === 'Published');

  return (
    <>
      <div className="space-y-4">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2>Published Ads</h2>
            <p className="text-muted-foreground">
              {publishedAds.length} {publishedAds.length === 1 ? 'ad' : 'ads'} published
            </p>
          </div>
          <Button onClick={onNavigateToCreateAd} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Ad
          </Button>
        </div>

        {/* Published Ads List */}
        {publishedAds.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-muted-foreground mb-2">No published ads yet</h3>
            <p className="text-muted-foreground mb-4">
              Create and publish your first ad to reach more students
            </p>
            <Button onClick={onNavigateToCreateAd} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Ad
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {publishedAds.map((ad, index) => (
              <Card 
                key={ad.id} 
                className="p-4 hover:shadow-lg transition-shadow animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setViewingAd(ad)}
              >
                <div className="flex gap-4">
                  {/* Poster Thumbnail */}
                  {ad.poster && (
                    <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden">
                      <img 
                        src={ad.poster} 
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-2">{ad.title}</h3>
                    <p className="text-muted-foreground line-clamp-2 mb-3">
                      {ad.description}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Published {ad.publishedAt 
                          ? new Date(ad.publishedAt).toLocaleDateString()
                          : new Date(ad.createdAt).toLocaleDateString()
                        }
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingAd(ad);
                      }}
                      className="gap-2"
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
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
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

const sponsorAdShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  poster: PropTypes.string,
  publishedAt: PropTypes.string,
  createdAt: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
});

AdsTab.propTypes = {
  ads: PropTypes.arrayOf(sponsorAdShape).isRequired,
  onNavigateToCreateAd: PropTypes.func.isRequired,
  onUpdateAd: PropTypes.func.isRequired,
};