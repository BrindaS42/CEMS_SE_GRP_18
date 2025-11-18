import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Sidebar } from '../../components/general/Sidebar';
import { CollegesTab } from '../../components/Admin/ControlPanel/CollegesTab';
import { EventsTab } from '../../components/Admin/ControlPanel/EventsTab';
import { UsersTab } from '../../components/Admin/ControlPanel/UsersTab';
import { AdsTab } from '../../components/Admin/ControlPanel/AdsTab';
import { cn } from '../../components/ui/utils';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { LogOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { SegmentedControl } from '../../components/ui/segmented-control';
import {
  fetchAllCollegesForAdmin,
  approveCollege,
  rejectCollege,
  suspendCollege,
  unsuspendCollege,
  fetchAllEventsForAdmin,
  fetchAllUsersForAdmin,
  fetchAllAdsForAdmin,
  toggleEntitySuspension,
} from '../../store/admin.slice';

export default function ControlPanelPage({ 
  isSidebarCollapsed, 
  onToggleSidebar,
  onNavigate,
  activePage,
  role
}) {
  const dispatch = useDispatch();
  // Select the admin state slice, providing a stable default object if it's undefined.
  const adminState = useSelector((state) => state.admin);
  const { colleges, events, users, ads,status, error } = adminState || { colleges: [], status: 'idle', error: null };

  const [activeTab, setActiveTab] = useState('Colleges');

  useEffect(() => {
    // Fetch data for the active tab, or all data on initial load
    if (activeTab === 'Colleges') {
      dispatch(fetchAllCollegesForAdmin());
    } else if (activeTab === 'Events') {
      dispatch(fetchAllEventsForAdmin());
    } else if (activeTab === 'Users') {
      dispatch(fetchAllUsersForAdmin());
    } else if (activeTab === 'Ads') {
      dispatch(fetchAllAdsForAdmin());
    }
    // Add similar fetches for other tabs (Events, Users, Ads) when their slices are ready
  }, [dispatch, activeTab]);

  // This useEffect will log the state *only when* the colleges array changes.
  useEffect(() => {
    console.log('Admin colleges state updated:', colleges);
  }, [colleges]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // College actions
  const handleAcceptCollege = async (collegeId) => {
    await dispatch(approveCollege(collegeId)).unwrap();
    toast.success('College registration approved.');
  };

  const handleRejectCollege = async (collegeId) => {
    await dispatch(rejectCollege(collegeId)).unwrap();
    toast.success('College registration rejected.');
  };

  const handleSuspendCollege = async (collegeId) => {
    await dispatch(suspendCollege(collegeId)).unwrap();
    toast.warning('College has been suspended.');
  };

  const handleUnsuspendCollege = async (collegeId) => {
    await dispatch(unsuspendCollege(collegeId)).unwrap();
    toast.success('College has been unsuspended.');
  };

  // Event actions
  const handleSuspendEvent = async (eventId) => {
    await dispatch(toggleEntitySuspension({ modelType: 'event', id: eventId, targetStatus: 'suspended' })).unwrap();
    toast.warning('Event has been suspended.');
  };
  const handleUnsuspendEvent = async (eventId) => {
    await dispatch(toggleEntitySuspension({ modelType: 'event', id: eventId, targetStatus: 'active' })).unwrap();
    toast.success('Event has been unsuspended.');
  };

  // User actions
  const handleSuspendUser = async (userId) => {
    await dispatch(toggleEntitySuspension({ modelType: 'user', id: userId, targetStatus: 'suspended' })).unwrap();
    toast.warning('User has been suspended.');
  };
  const handleUnsuspendUser = async (userId) => {
    await dispatch(toggleEntitySuspension({ modelType: 'user', id: userId, targetStatus: 'active' })).unwrap();
    toast.success('User has been unsuspended.');
  };

  // Ad actions
  const handleSuspendAd = async (adId) => {
    await dispatch(toggleEntitySuspension({ modelType: 'ad', id: adId, targetStatus: 'suspended' })).unwrap();
    toast.warning('Advertisement has been suspended.');
  };
  const handleUnsuspendAd = async (adId) => {
    await dispatch(toggleEntitySuspension({ modelType: 'ad', id: adId, targetStatus: 'active' })).unwrap();
    toast.success('Advertisement has been unsuspended.');
  };

  return (
    <div className="flex h-screen bg-background pt-16">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onToggleSidebar}
        activePage={activePage}
        role={role}
        onNavigate={onNavigate}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto smooth-scroll" data-page-content>
          <div className="max-w-7xl mx-auto p-6">
            {/* Main Tabs */}
            <div className="flex items-center justify-between mb-6 animate-fade-in-up">
              <SegmentedControl
                options={[
                  { value: 'Colleges', label: 'Colleges' },
                  { value: 'Events', label: 'Events' },
                  { value: 'Users', label: 'Users' },
                  { value: 'Ads', label: 'Ads' },
                ]}
                value={activeTab}
                onChange={(value) => setActiveTab(value)}
                variant="blue"
              />
            </div>

            {/* Tab Content */}
            <div className="tab-transition">
              {activeTab === 'Colleges' && (
                <CollegesTab
                  isLoading={status === 'loading'}
                  colleges={colleges}
                  onAcceptCollege={handleAcceptCollege}
                  onRejectCollege={handleRejectCollege}
                  onSuspendCollege={handleSuspendCollege}
                  onUnsuspendCollege={handleUnsuspendCollege}
                />
              )}
              {activeTab === 'Events' && (
                <EventsTab
                  isLoading={status === 'loading'}
                  events={events}
                  onSuspendEvent={handleSuspendEvent}
                  onUnsuspendEvent={handleUnsuspendEvent}
                />
              )}
              {activeTab === 'Users' && (
                <UsersTab
                  isLoading={status === 'loading'}
                  users={users}
                  onSuspendUser={handleSuspendUser}
                  onUnsuspendUser={handleUnsuspendUser}
                />
              )}
              {activeTab === 'Ads' && (
                <AdsTab
                  isLoading={status === 'loading'}
                  ads={ads}
                  onSuspendAd={handleSuspendAd}
                  onUnsuspendAd={handleUnsuspendAd}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

ControlPanelPage.propTypes = {
  isSidebarCollapsed: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  activePage: PropTypes.string,
  role: PropTypes.string,
};