import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Sidebar } from '../../components/general/Sidebar';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { CreateAdModal } from '../../components/Sponsors/Admin/CreateAdModal';
import { DraftedAdsTab } from '../../components/Sponsors/Admin/DraftedAdsTab';
import { PublishedAdsTab } from '../../components/Sponsors/Admin/PublishedAdsTab';
import {
  fetchSponsorAds,
  createSponsorAd,
  updateSponsorAd,
  deleteSponsorAd,
  publishSponsorAd,
} from '../../store/sponsorAds.slice.js';

// Re-using SponsorAd shape for prop validation
const sponsorAdPropType = PropTypes.shape({
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

export default function AdminPanel({ 
  onNavigate, 
  isSidebarCollapsed, 
  onToggleSidebar,
  openCreateAdModal: initialOpenCreateAdModal = false,
}) {
  const dispatch = useDispatch();
  const { ads, status } = useSelector((state) => state.sponsorAds);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('drafted');
  const [isCreateAdModalOpen, setIsCreateAdModalOpen] = useState(initialOpenCreateAdModal);

  useEffect(() => {
    dispatch(fetchSponsorAds());
  }, [dispatch]);

  useEffect(() => {
    if (initialOpenCreateAdModal) {
      setIsCreateAdModalOpen(true);
    }
  }, [initialOpenCreateAdModal]);

  const handleCreateAd = () => {
    setIsCreateAdModalOpen(true);
  };

  const handleSaveAd = (adData, action) => {
    if (action === 'publish') {
      if (adData._id) {
        // If it's an existing draft, update it and then publish
        dispatch(updateSponsorAd({ id: adData._id, adData })).then(() => {
          dispatch(publishSponsorAd(adData._id));
        });
      } else {
        // If it's a new ad, create it and then publish
        dispatch(createSponsorAd({ ...adData, sponsorId: user.id })).then((result) => {
          if (result.payload) dispatch(publishSponsorAd(result.payload._id));
        });
      }
    } else { // 'save' action
      if (adData._id) { // It's an update to a draft
        dispatch(updateSponsorAd({ id: adData._id, adData }));
      } else { // It's creating a new draft
        dispatch(createSponsorAd({ ...adData, sponsorId: user.id }));
      }
    }
  };

  const draftedAds = ads.filter(ad => ad.status === 'Drafted');
  const publishedAds = ads.filter(ad => ad.status === 'Published');
  return (
    <div className="flex h-screen bg-background pt-16">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={onToggleSidebar}
        activePage="admin"
        onNavigate={onNavigate}
        role="sponsor"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Admin Panel Content */}
        <main className="flex-1 overflow-y-auto smooth-scroll" data-page-content>
          <div className="max-w-7xl mx-auto p-6">
            {/* Top Navigation with Create Button */}
            <div className="flex items-center justify-between mb-6 animate-fade-in-up">
              <SegmentedControl
                options={[
                  { value: 'drafted', label: 'Drafted' },
                  { value: 'published', label: 'Published' },
                ]}
                value={activeTab}
                onChange={(value) => setActiveTab(value)}
                variant="orange"
              />

              <Button onClick={handleCreateAd} className="gap-2 btn-interact">
                <Plus className="w-4 h-4" />
                Create Ad
              </Button>
            </div>

            {/* Tab Content */}
            <div className="tab-transition">
              {activeTab === 'drafted' && (
                <DraftedAdsTab 
                  ads={draftedAds}
                  onUpdateAd={handleSaveAd}
                  onDeleteAd={(adId) => dispatch(deleteSponsorAd(adId))}
                  onPublishAd={(adId) => dispatch(publishSponsorAd(adId))}
                />
              )}
              {activeTab === 'published' && (
                <PublishedAdsTab 
                  ads={publishedAds}
                  onUpdateAd={handleSaveAd}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Ad Modal */}
      <CreateAdModal 
        open={isCreateAdModalOpen}
        onClose={() => setIsCreateAdModalOpen(false)}
        onSave={handleSaveAd}
      />
    </div>
  );
}

AdminPanel.propTypes = {
  onNavigate: PropTypes.func,
  isSidebarCollapsed: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
  openCreateAdModal: PropTypes.bool
};