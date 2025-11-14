import PropTypes from 'prop-types';
import { useState } from 'react';
import { Search, Eye, Ban, Check, User2, Building } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ViewUserModal } from './ViewUserModal';
import { SuspendUserModal } from './SuspendUserModal';
import { UnsuspendUserModal } from './UnsuspendUserModal';
import { motion, AnimatePresence } from 'motion/react';
import { SegmentedControl } from '@/components/ui/segmented-control';

export function UsersTab({ users, onSuspendUser, onUnsuspendUser }) {
  const [activeSubTab, setActiveSubTab] = useState('Registered');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [unsuspendModalOpen, setUnsuspendModalOpen] = useState(false);

  const subTabs = ['Registered', 'Suspended'];

  const filteredUsers = users
    .filter((user) => user.status === activeSubTab)
    .filter(
      (user) =>
        searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.college.toLowerCase().includes(searchQuery.toLowerCase())
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
            { value: 'Registered', label: 'Registered' },
            { value: 'Suspended', label: 'Suspended' },
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
            placeholder={`Search ${activeSubTab} Students...`}
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
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No {activeSubTab.toLowerCase()} students found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
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
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User2 className="w-8 h-8 text-muted-foreground" />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {user.college}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Registered: {new Date(user.registrationDate).toLocaleDateString()}
                      </span>
                      <Badge variant={user.status === 'Registered' ? 'default' : 'destructive'}>
                        {user.status}
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

                    {activeSubTab === 'Registered' && (
                      <button
                        onClick={() => handleSuspend(user)}
                        className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors micro-interact"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}

                    {activeSubTab === 'Suspended' && (
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
              onUnsuspendUser(selectedUser.id);
              setViewModalOpen(false);
            }}
          />
          <SuspendUserModal
            open={suspendModalOpen}
            onOpenChange={setSuspendModalOpen}
            user={selectedUser}
            onConfirm={(reason) => {
              onSuspendUser(selectedUser.id, reason);
              setSuspendModalOpen(false);
            }}
          />
          <UnsuspendUserModal
            open={unsuspendModalOpen}
            onOpenChange={setUnsuspendModalOpen}
            user={selectedUser}
            onConfirm={() => {
              onUnsuspendUser(selectedUser.id);
              setUnsuspendModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}

const adminUserShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  college: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['student']).isRequired,
  registrationDate: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['Registered', 'Suspended']).isRequired,
  phone: PropTypes.string,
  eventsParticipated: PropTypes.number,
  teamsJoined: PropTypes.number,
});

UsersTab.propTypes = {
  users: PropTypes.arrayOf(adminUserShape).isRequired,
  onSuspendUser: PropTypes.func.isRequired,
  onUnsuspendUser: PropTypes.func.isRequired,
};