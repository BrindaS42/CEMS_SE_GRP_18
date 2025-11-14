import { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Eye, Check, X, Ban, ShieldAlert } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ViewCollegeModal } from './ViewCollegeModal';
import { RejectCollegeModal } from './RejectCollegeModal';
import { SuspendCollegeModal } from './SuspendCollegeModal';
import { UnsuspendCollegeModal } from './UnsuspendCollegeModal';
import { motion, AnimatePresence } from 'motion/react';
import { SegmentedControl } from '@/components/ui/segmented-control';

// Helper function to refactor nested ternary
const getCollegeBadgeVariant = (status) => {
  switch (status) {
    case 'Pending':
      return 'secondary';
    case 'Registered':
      return 'default';
    case 'Suspended':
      return 'destructive';
    default:
      return 'default';
  }
};

export function CollegesTab({ 
  colleges, 
  onAcceptCollege, 
  onRejectCollege, 
  onSuspendCollege,
  onUnsuspendCollege 
}) {
  const [activeSubTab, setActiveSubTab] = useState('Registered');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [unsuspendModalOpen, setUnsuspendModalOpen] = useState(false);

  const subTabs = ['Pending', 'Registered', 'Suspended'];

  const filteredColleges = colleges
    .filter(college => college.status === activeSubTab)
    .filter(college => 
      searchQuery === '' || 
      college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.pocEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleView = (college) => {
    setSelectedCollege(college);
    setViewModalOpen(true);
  };

  const handleAccept = (college) => {
    onAcceptCollege(college.id);
  };

  const handleReject = (college) => {
    setSelectedCollege(college);
    setRejectModalOpen(true);
  };

  const handleSuspend = (college) => {
    setSelectedCollege(college);
    setSuspendModalOpen(true);
  };

  const handleUnsuspend = (college) => {
    setSelectedCollege(college);
    setUnsuspendModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between">
        <SegmentedControl
          options={[
            { value: 'Pending', label: 'Pending' },
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
            placeholder={`Search ${activeSubTab} Colleges...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Colleges Grid */}
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
            {filteredColleges.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No {activeSubTab.toLowerCase()} colleges found
              </div>
            ) : (
              filteredColleges.map((college) => (
                <motion.div
                  key={college.id}
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
                  {/* College Logo */}
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    {college.logo ? (
                      <img src={college.logo} alt={college.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <ShieldAlert className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* College Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{college.name}</h3>
                    <p className="text-sm text-muted-foreground">POC: {college.pocName}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">
                        Registered: {new Date(college.registrationDate).toLocaleDateString()}
                      </span>
                      <Badge 
                        variant={getCollegeBadgeVariant(college.status)}
                      >
                        {college.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleView(college)}
                      className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors micro-interact"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {activeSubTab === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(college)}
                          className="px-3 py-1.5 rounded-md bg-success text-success-foreground hover:bg-success-hover transition-colors micro-interact"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(college)}
                          className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors micro-interact"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {activeSubTab === 'Registered' && (
                      <button
                        onClick={() => handleSuspend(college)}
                        className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive-hover transition-colors micro-interact"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}

                    {activeSubTab === 'Suspended' && (
                      <button
                        onClick={() => handleUnsuspend(college)}
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
      {selectedCollege && (
        <>
          <ViewCollegeModal
            open={viewModalOpen}
            onOpenChange={setViewModalOpen}
            college={selectedCollege}
            onAccept={() => {
              onAcceptCollege(selectedCollege.id);
              setViewModalOpen(false);
            }}
            onReject={() => {
              setViewModalOpen(false);
              setRejectModalOpen(true);
            }}
            onSuspend={() => {
              setViewModalOpen(false);
              setSuspendModalOpen(true);
            }}
            onUnsuspend={() => {
              onUnsuspendCollege(selectedCollege.id);
              setViewModalOpen(false);
            }}
          />
          <RejectCollegeModal
            open={rejectModalOpen}
            onOpenChange={setRejectModalOpen}
            college={selectedCollege}
            onConfirm={(reason) => {
              onRejectCollege(selectedCollege.id, reason);
              setRejectModalOpen(false);
            }}
          />
          <SuspendCollegeModal
            open={suspendModalOpen}
            onOpenChange={setSuspendModalOpen}
            college={selectedCollege}
            onConfirm={(reason) => {
              onSuspendCollege(selectedCollege.id, reason);
              setSuspendModalOpen(false);
            }}
          />
          <UnsuspendCollegeModal
            open={unsuspendModalOpen}
            onOpenChange={setUnsuspendModalOpen}
            college={selectedCollege}
            onConfirm={() => {
              onUnsuspendCollege(selectedCollege.id);
              setUnsuspendModalOpen(false);
            }}
          />
        </>
      )}
    </div>
  );
}

CollegesTab.propTypes = {
  colleges: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    logo: PropTypes.string,
    registrationDate: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['Pending', 'Registered', 'Suspended']).isRequired,
    pocName: PropTypes.string.isRequired,
    pocEmail: PropTypes.string.isRequired,
    pocPhone: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    website: PropTypes.string,
    description: PropTypes.string,
  })).isRequired,
  onAcceptCollege: PropTypes.func.isRequired,
  onRejectCollege: PropTypes.func.isRequired,
  onSuspendCollege: PropTypes.func.isRequired,
  onUnsuspendCollege: PropTypes.func.isRequired,
};