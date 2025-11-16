import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Search, CheckCircle, AlertCircle, User } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { createStudentTeam, fetchAllStudents } from '@/store/student.slice';


// Mock existing teams - replace with actual API call
const existingTeamNames = ['Code Warriors', 'Tech Titans', 'Digital Pioneers'];

export function CreateTeamModal({ isOpen, onClose, onSubmit }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { allStudents } = useSelector((state) => state.student);
  const [teamName, setTeamName] = useState('');
  const [teamNameStatus, setTeamNameStatus] = useState('idle');
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch all students when the modal is opened
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllStudents());
    }
  }, [isOpen, dispatch]);

  // Check team name availability
  useEffect(() => {
    if (!teamName.trim()) {
      setTeamNameStatus('idle');
      return;
    }

    setTeamNameStatus('checking');
    
    // Simulate API call
    const timer = setTimeout(() => {
      const exists = existingTeamNames.some(
        name => name.toLowerCase() === teamName.toLowerCase()
      );
      setTeamNameStatus(exists ? 'taken' : 'available');
    }, 500);

    return () => clearTimeout(timer);
  }, [teamName]);

  // Filter students based on search query
  const filteredStudents = allStudents.filter(student => 
    student.college === user.college && // Filter by current user's college
    student.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !members.some(m => m._id === student._id) &&
    student._id !== user.id
  );

  const handleAddMember = (student) => {
    setMembers([...members, student]);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleRemoveMember = (member_id) => {
    setMembers(members.filter(m => m._id !== member_id));
  };

  const handleSubmit = async () => {
    if (teamNameStatus !== 'available' || members.length === 0) {
      return;
    }

    const teamData = {
      teamName,
      members: members.map(m => m._id), // Send only member IDs
    };

    const promise = dispatch(createStudentTeam(teamData)).unwrap();

    toast.promise(promise, {
      loading: 'Creating team and sending invites...',
      success: 'Team created successfully!',
      error: (err) => err || 'Failed to create team.',
    });

    handleCancel();
  };

  const handleCancel = () => {
    setTeamName('');
    setMembers([]);
    setSearchQuery('');
    setTeamNameStatus('idle');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a team and invite members to collaborate on events
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name *</Label>
            <div className="relative">
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter a unique team name"
                className={cn(
                  'pr-10',
                  teamNameStatus === 'available' && 'border-success',
                  teamNameStatus === 'taken' && 'border-destructive'
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {teamNameStatus === 'checking' && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
                {teamNameStatus === 'available' && (
                  <CheckCircle className="w-4 h-4 text-success" />
                )}
                {teamNameStatus === 'taken' && (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
            </div>
            {teamNameStatus === 'available' && (
              <p className="text-xs text-success flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Available
              </p>
            )}
            {teamNameStatus === 'taken' && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Already exists
              </p>
            )}
          </div>

          {/* Leader (Auto-filled) */}
          <div className="space-y-2">
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Team Leader</span>
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-foreground">{user?.profile?.name || 'Loading...'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || '...'}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">You</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add Members */}
          <div className="space-y-3">
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Team Members *</span>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search by student name..."
                className="pl-10"
              />

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearchResults && searchQuery && filteredStudents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {filteredStudents.map((student) => (
                      <button
                        key={student._id}
                        onClick={() => handleAddMember(student)}
                        className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs">
                          {student.profile.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{student.profile.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Members List */}
            {members.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {members.length} member{members.length !== 1 ? 's' : ''} added
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {members.map((member, index) => (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs">
                        {member.profile.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{member.profile.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(member._id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {members.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Search and add team members by name
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="btn-interact"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={teamNameStatus !== 'available' || members.length === 0}
            className="btn-interact"
          >
            Send Invites
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

CreateTeamModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
