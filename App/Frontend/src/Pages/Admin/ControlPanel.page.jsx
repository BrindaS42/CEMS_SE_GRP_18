import { useState } from 'react';
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
import { motion } from 'framer-motion';

// Mock data
const mockColleges = [
  {
    id: 1,
    name: 'MIT College of Engineering',
    registrationDate: '2025-01-15',
    status: 'Registered',
    pocName: 'Dr. Sarah Johnson',
    pocEmail: 'sarah.j@mit.edu',
    pocPhone: '+1-555-0101',
    address: '77 Massachusetts Ave, Cambridge, MA 02139',
    website: 'https://mit.edu',
    description: 'Leading engineering college with state-of-the-art facilities.',
  },
  {
    id: 2,
    name: 'Stanford University',
    registrationDate: '2025-01-20',
    status: 'Pending',
    pocName: 'Prof. Michael Chen',
    pocEmail: 'mchen@stanford.edu',
    pocPhone: '+1-555-0102',
    address: '450 Serra Mall, Stanford, CA 94305',
    website: 'https://stanford.edu',
  },
  {
    id: 3,
    name: 'Berkeley College',
    registrationDate: '2024-12-10',
    status: 'Suspended',
    pocName: 'Dr. Emily Rodriguez',
    pocEmail: 'emily.r@berkeley.edu',
    pocPhone: '+1-555-0103',
    address: 'Berkeley, CA 94720',
  },
];

const mockEvents = [
  {
    id: 1,
    title: 'TechFest 2025',
    description: 'Annual technology festival showcasing innovation',
    date: '2025-11-15',
    venue: 'Main Auditorium',
    organizerTeam: 'Digital Pioneers',
    organizerEmail: 'pioneers@college.edu',
    status: 'Published',
    registrations: 245,
    categoryTags: ['Tech', 'Workshop'],
  },
  {
    id: 2,
    title: 'Cultural Night',
    description: 'Celebrating diversity through music and art',
    date: '2025-11-20',
    venue: 'Open Air Theatre',
    organizerTeam: 'Code Warriors',
    organizerEmail: 'warriors@college.edu',
    status: 'Suspended',
    registrations: 198,
    categoryTags: ['Cultural'],
  },
  {
    id: 3,
    title: 'Sports Day 2024',
    description: 'Inter-department sports competitions',
    date: '2024-11-05',
    venue: 'Sports Complex',
    organizerTeam: 'Innovators',
    organizerEmail: 'innovators@college.edu',
    status: 'Completed',
    registrations: 512,
    categoryTags: ['Sports'],
  },
];

const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@college.edu',
    college: 'MIT College of Engineering',
    role: 'student',
    registrationDate: '2024-09-01',
    status: 'Registered',
    phone: '+1-555-1001',
    eventsParticipated: 12,
    teamsJoined: 3,
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@college.edu',
    college: 'Stanford University',
    role: 'student',
    registrationDate: '2024-09-05',
    status: 'Suspended',
    phone: '+1-555-1002',
    eventsParticipated: 5,
    teamsJoined: 1,
  },
];

const mockAds = [
  {
    id: 1,
    title: 'TechGear Student Discount',
    description: 'Get 25% off on all laptops and accessories',
    firmName: 'TechGear Inc',
    publishedDate: '2025-10-20',
    status: 'Registered',
    contact: '+1-555-0123',
    address: '123 Tech Street, Silicon Valley',
    views: 1245,
  },
  {
    id: 2,
    title: 'Campus Cafe Special',
    description: 'Buy one coffee, get one free',
    firmName: 'Campus Cafe',
    publishedDate: '2025-10-21',
    status: 'Suspended',
    contact: '+1-555-0456',
    address: 'Campus Building A',
    views: 2341,
  },
  {
    id: 3,
    title: 'Bookstore Sale 2024',
    description: 'Up to 40% off on textbooks',
    firmName: 'College Bookstore',
    publishedDate: '2024-12-15',
    status: 'Expired',
    contact: 'bookstore@campus.edu',
    address: 'Campus Center',
    views: 890,
  },
];

export default function ControlPanelPage({ 
  isSidebarCollapsed, 
  onToggleSidebar,
  onNavigate,
  activePage
}) {
  const [activeTab, setActiveTab] = useState('Colleges');
  const [colleges, setColleges] = useState(mockColleges);
  const [events, setEvents] = useState(mockEvents);
  const [users, setUsers] = useState(mockUsers);
  const [ads, setAds] = useState(mockAds);

  const tabs = ['Colleges', 'Events', 'Users', 'Ads'];

  // College actions
  const handleAcceptCollege = (collegeId) => {
    setColleges(prev => prev.map(c => c.id === collegeId ? { ...c, status: 'Registered' } : c));
    toast.success('College registration approved');
  };

  const handleRejectCollege = (collegeId, reason) => {
    setColleges(prev => prev.filter(c => c.id !== collegeId));
    toast.success('College registration rejected');
  };

  const handleSuspendCollege = (collegeId, reason) => {
    setColleges(prev => prev.map(c => c.id === collegeId ? { ...c, status: 'Suspended' } : c));
    toast.success('College suspended');
  };

  const handleUnsuspendCollege = (collegeId) => {
    setColleges(prev => prev.map(c => c.id === collegeId ? { ...c, status: 'Registered' } : c));
    toast.success('College unsuspended');
  };

  // Event actions
  const handleSuspendEvent = (eventId, reason) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'Suspended' } : e));
    toast.success('Event suspended');
  };

  const handleUnsuspendEvent = (eventId) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'Published' } : e));
    toast.success('Event unsuspended');
  };

  // User actions
  const handleSuspendUser = (userId, reason) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Suspended' } : u));
    toast.success('User suspended');
  };



  const handleUnsuspendUser = (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'Registered' } : u));
    toast.success('User unsuspended');
  };

  // Ad actions
  const handleSuspendAd = (adId, reason) => {
    setAds(prev => prev.map(a => a.id === adId ? { ...a, status: 'Suspended' } : a));
    toast.success('Advertisement suspended');
  };

  const handleUnsuspendAd = (adId) => {
    setAds(prev => prev.map(a => a.id === adId ? { ...a, status: 'Registered' } : a));
    toast.success('Advertisement unsuspended');
  };

  return (
    <div className="flex h-screen bg-background pt-16">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onToggleSidebar}
        activePage={activePage}
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
                  colleges={colleges}
                  onAcceptCollege={handleAcceptCollege}
                  onRejectCollege={handleRejectCollege}
                  onSuspendCollege={handleSuspendCollege}
                  onUnsuspendCollege={handleUnsuspendCollege}
                />
              )}
              {activeTab === 'Events' && (
                <EventsTab
                  events={events}
                  onSuspendEvent={handleSuspendEvent}
                  onUnsuspendEvent={handleUnsuspendEvent}
                />
              )}
              {activeTab === 'Users' && (
                <UsersTab
                  users={users}
                  onSuspendUser={handleSuspendUser}
                  onUnsuspendUser={handleUnsuspendUser}
                />
              )}
              {activeTab === 'Ads' && (
                <AdsTab
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
};