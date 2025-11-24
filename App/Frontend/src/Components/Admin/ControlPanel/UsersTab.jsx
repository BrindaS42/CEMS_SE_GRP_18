import PropTypes from 'prop-types';
import { useState } from 'react';
import { Search, Eye, Ban, Check, User2, Building } from 'lucide-react';
import { Skeleton } from '@/Components/ui/skeleton';
import { cn } from '@/Components/ui/utils';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { ViewUserModal } from './ViewUserModal';
import { SuspendUserModal } from './SuspendUserModal';
import { UnsuspendUserModal } from './UnsuspendUserModal';
import { motion, AnimatePresence } from 'motion/react';
import { SegmentedControl } from '@/Components/ui/segmented-control';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';

export function UsersTab({ isLoading, users, onSuspendUser, onUnsuspendUser }) {
  const [activeSubTab, setActiveSubTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [unsuspendModalOpen, setUnsuspendModalOpen] = useState(false);

  const subTabs = ['active', 'suspended'];

  const filteredUsers = users
    .filter((user) => user.status === activeSubTab)
    .filter(
      (user) =>
        searchQuery === '' ||
        (user.profile?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.college?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleView = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleSuspend = (user) => {
    setSelectedUser(user);
    setSuspendModalOpen(true);
  };

  const handleUnsuspend = (user) => {
    setSelectedUser(user);
    setUnsuspendModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between">
        <SegmentedControl
          options={[
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
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
            placeholder={`Search ${activeSubTab} users...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Grid */}
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
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No {activeSubTab.toLowerCase()} users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <motion.div
                  key={user._id}
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
                  {/* User Avatar */}
                  <Avatar className="w-16 h-16 flex-shrink-0">
                    <AvatarImage src={user.profile?.profilePic} alt={user.profile?.name} />
                    <AvatarFallback>
                      {(user.profile?.name || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{user.profile?.name || 'Unnamed User'}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building className="w-3 h-3 flex-shrink-0" />
                        {user.college?.name || 'N/A'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.role} - {user.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleView(user)}
                      className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors micro-interact"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {activeSubTab === 'active' && (
                      <button
                        onClick={() => handleSuspend(user)}
                        className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors micro-interact"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}

                    {activeSubTab === 'suspended' && (
                      <button
                        onClick={() => handleUnsuspend(user)}
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
      {selectedUser && (
        <>
          <ViewUserModal
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
            user={selectedUser}
            onSuspend={() => {
              setViewModalOpen(false);
              setSuspendModalOpen(true);
            }}
            onUnsuspend={() => {
              onUnsuspendUser(selectedUser._id);
              setViewModalOpen(false);
            }}
          />
          <SuspendUserModal
            open={suspendModalOpen}
            onOpenChange={setSuspendModalOpen}
            user={selectedUser}
            onConfirm={(reason) => {
              onSuspendUser(selectedUser._id, reason);
              setSuspendModalOpen(false);
            }}
          />
          <UnsuspendUserModal
            open={unsuspendModalOpen}
            onOpenChange={setUnsuspendModalOpen}
            user={selectedUser}
            onConfirm={() => {
              onUnsuspendUser(selectedUser._id);
              setUnsuspendModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}

const adminUserShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  profile: PropTypes.shape({
    name: PropTypes.string,
    profilePic: PropTypes.string,
  }),
  email: PropTypes.string.isRequired,
  college: PropTypes.shape({
    name: PropTypes.string,
  }),
  role: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['active', 'suspended']).isRequired,
});

UsersTab.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  users: PropTypes.arrayOf(adminUserShape).isRequired,
  onSuspendUser: PropTypes.func.isRequired,
  onUnsuspendUser: PropTypes.func.isRequired,
};