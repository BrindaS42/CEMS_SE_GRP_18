import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Search, User, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import { fetchAllStudents } from '@/store/student.slice';


// Mock existing teams - replace with actual API call
const existingTeamNames = ['Code Warriors', 'Tech Titans', 'Digital Pioneers'];

export function EditStudentTeamModal({ isOpen, onClose, onSave, team }) {
  const [teamName, setTeamName] = useState('');
  const [teamNameStatus, setTeamNameStatus] = useState('idle');
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { allStudents } = useSelector((state) => state.student);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Populate form with existing team data
  useEffect(() => {
    if (team) {
      setTeamName(team.teamName);
      // The members from the team object are nested, we need to flatten them
      setMembers(team.members.map(m => ({ ...m.member, status: m.status })));
      setTeamNameStatus('available'); // Assume current name is valid
    }
  }, [team]);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchAllStudents());
    }
  }, [isOpen, dispatch]);

  // Check team name availability
  useEffect(() => {
    if (!teamName.trim() || (team && teamName.toLowerCase() === team.teamName.toLowerCase())) {
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
  }, [teamName, team]);

  // Filter students for search results
  const filteredStudents = allStudents.filter(student => 
    student.college === user.college &&
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

  const handleSave = () => {
    if (teamNameStatus === 'taken') {
      return;
    }

    const originalMemberIds = new Set(team.members.map(m => m.member._id));
    const currentMemberIds = new Set(members.map(m => m._id));

    const membersToAdd = members.filter(m => !originalMemberIds.has(m._id));
    const membersToRemove = team.members.filter(m => !currentMemberIds.has(m.member._id));

    const updatedData = {
      teamName,
      membersToAdd: membersToAdd.map(m => m._id),
      membersToRemove: membersToRemove.map(m => m.member._id),
    };

    onSave(team._id, updatedData);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team: {team?.teamName}</DialogTitle>
          <DialogDescription>
            Update your team name and manage members.
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
          </div>

          {/* Leader (Auto-filled) */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Team Leader</span>
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-foreground">{team?.leader?.profile?.name}</p>
                  <p className="text-xs text-muted-foreground">{team?.leader?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Add/Remove Members */}
          <div className="space-y-3">
            <span className="text-sm font-medium">Team Members *</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search to add new members..."
                className="pl-10"
              />
              <AnimatePresence>
                {showSearchResults && searchQuery && filteredStudents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {filteredStudents.map((student) => (
                      <button key={student._id} onClick={() => handleAddMember(student)} className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs">{getInitials(student.profile.name)}</div>
                        <div>
                          <p className="text-sm text-foreground">{student.profile.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {members.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map((member) => (
                  <motion.div key={member._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                    <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs">{getInitials(member.profile?.name || member.name)}</div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{member.profile?.name || member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveMember(member._id)} className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive">
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={teamNameStatus === 'taken'}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

EditStudentTeamModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  team: PropTypes.object,
};