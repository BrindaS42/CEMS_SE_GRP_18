import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from '../../Components/Organizers/Sidebar';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { SegmentedControl } from '../../components/ui/segmented-control';
import { CreateAdModal } from '../../Components/Sponsors/Admin/CreateAdModal';
import { DraftedAdsTab } from '../../Components/Sponsors/Admin/DraftedAdsTab';
import { PublishedAdsTab } from '../../Components/Sponsors/Admin/PublishedAdsTab';

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
  openCreateAdModal = false,
  ads,
  onUpdateAd,
  onDeleteAd,
}) {
  const [activeTab, setActiveTab] = useState('drafted');
  const [isCreateAdModalOpen, setIsCreateAdModalOpen] = useState(openCreateAdModal);

  // Open modal when openCreateAdModal prop changes
  useEffect(() => {
    if (openCreateAdModal) {
      setIsCreateAdModalOpen(true);
    }
  }, [openCreateAdModal]);

  const handleCreateAd = () => {
    setIsCreateAdModalOpen(true);
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
                  onUpdateAd={onUpdateAd}
                  onDeleteAd={onDeleteAd}
                />
              )}
              {activeTab === 'published' && (
                <PublishedAdsTab 
                  ads={publishedAds}
                  onUpdateAd={onUpdateAd}
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
        onSave={onUpdateAd}
      />
    </div>
  );
}

AdminPanel.propTypes = {
  onNavigate: PropTypes.func,
  isSidebarCollapsed: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
  openCreateAdModal: PropTypes.bool,
  ads: PropTypes.arrayOf(sponsorAdPropType).isRequired,
  onUpdateAd: PropTypes.func.isRequired,
  onDeleteAd: PropTypes.func.isRequired,
};