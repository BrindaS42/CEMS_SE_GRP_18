import { useState } from 'react';
import PropTypes from 'prop-types';
import { Sidebar } from '../../Components/Organizers/Sidebar';
import { ViewsTab } from '../../Components/Sponsors/ViewsTab';
import { AdsTab } from '../../Components/Sponsors/AdsTab';
import { SegmentedControl } from '../../components/ui/segmented-control';

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

export default function SponsorDashboard({ 
  onNavigate, 
  isSidebarCollapsed, 
  onToggleSidebar,
  ads,
  onUpdateAd,
}) {
  const [activeTab, setActiveTab] = useState('views');

  const handleNavigateToCreateAd = () => {
    if (onNavigate) {
      onNavigate('admin', { openCreateAdModal: true });
    }
  };

  return (
    <div className="flex h-screen bg-background pt-16">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={onToggleSidebar}
        activePage="dashboard"
        onNavigate={onNavigate}
        role="sponsor"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto smooth-scroll" data-page-content>
          <div className="max-w-7xl mx-auto p-6">
            {/* Top Navigation Tabs */}
            <div className="flex items-center justify-between mb-6 animate-fade-in-up">
              <SegmentedControl
                options={[
                  { value: 'views', label: 'Views' },
                  { value: 'ads', label: 'Ads' },
                ]}
                value={activeTab}
                onChange={(value) => setActiveTab(value)}
                variant="blue"
              />
            </div>

            {/* Tab Content */}
            <div className="tab-transition">
              {activeTab === 'views' && <ViewsTab ads={ads} />}
              {activeTab === 'ads' && (
                <AdsTab 
                  ads={ads} 
                  onNavigateToCreateAd={handleNavigateToCreateAd}
                  onUpdateAd={onUpdateAd}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

SponsorDashboard.propTypes = {
  onNavigate: PropTypes.func,
  isSidebarCollapsed: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
  ads: PropTypes.arrayOf(sponsorAdPropType).isRequired,
  onUpdateAd: PropTypes.func.isRequired,
};