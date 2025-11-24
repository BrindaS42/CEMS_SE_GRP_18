import { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Eye, Ban, Check, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/Components/ui/skeleton';
import { cn } from '@/Components/ui/utils';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { ViewAdModal } from './ViewAdModal';
import { SuspendAdModal } from './SuspendAdModal';
import { UnsuspendAdModal } from './UnsuspendAdModal';
import { motion, AnimatePresence } from 'motion/react';
import { SegmentedControl } from '@/Components/ui/segmented-control';

// Helper function to refactor nested ternary
const getAdBadgeVariant = (status) => {
  switch (status) {
    case 'Published':
      return 'default';
    case 'suspended':
      return 'destructive';
    case 'Expired':
      return 'secondary';
    default:
      return 'default';
  }
};

export function AdsTab({ isLoading, ads, onSuspendAd, onUnsuspendAd }) {
  const [activeSubTab, setActiveSubTab] = useState('Published');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAd, setSelectedAd] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [unsuspendModalOpen, setUnsuspendModalOpen] = useState(false);

  const subTabs = ['Published', 'Suspended', 'Drafted', 'Expired'];

  const filteredAds = ads
    .filter(ad => ad.status === activeSubTab)
    .filter(ad => 
      searchQuery === '' || 
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ad.sponsorId?.profile?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleView = (ad) => {
    setSelectedAd(ad);
    setViewModalOpen(true);
  };

  const handleSuspend = (ad) => {
    setSelectedAd(ad);
    setSuspendModalOpen(true);
  };

  const handleUnsuspend = (ad) => {
    setSelectedAd(ad);
    setUnsuspendModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between">
        <SegmentedControl
          options={[
            { value: 'Published', label: 'Published' },
            { value: 'Suspended', label: 'Suspended' },
            { value: 'Drafted', label: 'Drafted' },
            { value: 'Expired', label: 'Expired' },
          ]}
          value={activeSubTab}
          onChange={(value) => setActiveSubTab(value)}
          variant="orange"
        />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={`Search ${activeSubTab} Ads...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Ads Grid */}
      <div className="flex-1 overflow-y-auto smooth-scroll">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-4"
          >
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 border p-6 rounded-lg">
                  <Skeleton className="h-24 w-24 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredAds.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No {activeSubTab.toLowerCase()} ads found
              </div>
            ) : (
              filteredAds.map((ad) => (
                <motion.div
                  key={ad._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={cn(
                    'bg-card border border-border rounded-lg p-6',
                    'flex items-center gap-6',
                    'hover:shadow-lg transition-shadow duration-300'
                  )}
                >
                  {/* Ad Poster */}
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {ad.poster ? (
                      <img src={ad.poster} alt={ad.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>

                  {/* Ad Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{ad.title}</h3> 
                    <p className="text-sm text-muted-foreground">By: {ad.sponsorId?.profile?.name || 'Unknown Sponsor'}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">
                        Created: {new Date(ad.createdAt).toLocaleDateString()}
                      </span>
                      {ad.status === 'Published' && ad.views !== undefined && (
                        <span className="text-sm text-muted-foreground">
                          Views: {ad.views}
                        </span>
                      )}
                      <Badge 
                        variant={getAdBadgeVariant(ad.status)}
                      >
                        {ad.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleView(ad)}
                      className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors micro-interact"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {activeSubTab === 'Published' && (
                      <button
                        onClick={() => handleSuspend(ad)}
                        className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors micro-interact"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}

                    {activeSubTab === 'Suspended' && (
                      <button
                        onClick={() => handleUnsuspend(ad)}
                        className="px-3 py-1.5 rounded-md bg-success text-success-foreground hover:bg-success-hover transition-colors micro-interact"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals */}
      {selectedAd && (
        <>
          <ViewAdModal
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
            ad={selectedAd}
            onSuspend={() => {
              setViewModalOpen(false);
              setSuspendModalOpen(true);
            }}
            onUnsuspend={() => {
              onUnsuspendAd(selectedAd._id);
              setViewModalOpen(false);
            }}
          />
          <SuspendAdModal
            open={suspendModalOpen}
            onOpenChange={setSuspendModalOpen}
            ad={selectedAd}
            onConfirm={(reason) => {
              onSuspendAd(selectedAd._id, reason);
              setSuspendModalOpen(false);
            }}
          />
          <UnsuspendAdModal
            open={unsuspendModalOpen}
            onOpenChange={setUnsuspendModalOpen}
            ad={selectedAd}
            onConfirm={() => {
              onUnsuspendAd(selectedAd._id);
              setUnsuspendModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}

AdsTab.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  ads: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    sponsorId: PropTypes.shape({
      profile: PropTypes.shape({ name: PropTypes.string })
    }),
    poster: PropTypes.string,
    status: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    views: PropTypes.number,
  })).isRequired,
  onSuspendAd: PropTypes.func.isRequired,
  onUnsuspendAd: PropTypes.func.isRequired,
};