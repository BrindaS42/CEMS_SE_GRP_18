import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, CheckCircle, XCircle, Trash2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

// Mock user database for name search
const USER_DATABASE = [
  { name: 'Adam Smith', email: 'adam@college.edu' },
  { name: 'Adidas Kumar', email: 'adidas@college.edu' },
  { name: 'Aditi Sharma', email: 'aditi@college.edu' },
  { name: 'Jane Smith', email: 'jane@college.edu' },
  { name: 'Bob Wilson', email: 'bob@college.edu' },
  { name: 'Alice Cooper', email: 'alice@college.edu' },
  { name: 'Charlie Brown', email: 'charlie@college.edu' },
  { name: 'David Lee', email: 'david@college.edu' },
  { name: 'Eva Martinez', email: 'eva@college.edu' },
  { name: 'Frank Johnson', email: 'frank@college.edu' },
  { name: 'Grace Kim', email: 'grace@college.edu' },
  { name: 'Henry Davis', email: 'henry@college.edu' },
  { name: 'John Doe', email: 'john@college.edu' },
  { name: 'Sarah Johnson', email: 'sarah@college.edu' },
  { name: 'Mike Chen', email: 'mike@college.edu' },
];

// Mock function to check team name availability
const checkTeamNameAvailability = async (name, currentTeamId) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const existingTeams = ['Innovators', 'Tech Giants', 'Code Warriors'];
  return !existingTeams.includes(name);
};

export function EditTeamModal({ open, onClose, team, onSave, onDelete, isPending = false }) {
  const [teamName, setTeamName] = useState('');
  const [originalTeamName, setOriginalTeamName] = useState('');
  const [teamNameStatus, setTeamNameStatus] = useState('idle');
  const [leader, setLeader] = useState(null);
  const [members, setMembers] = useState([]);
  const [originalMembers, setOriginalMembers] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(null);
  const [searchValue, setSearchValue] = useState({});

  // Load team data when modal opens
  useEffect(() => {
    if (open && team) {
      setTeamName(team.name);
      setOriginalTeamName(team.name);
      
      // Separate leader from members
      const leaderMember = team.members.find(m => m.role === 'Leader');
      const otherMembers = team.members.filter(m => m.role !== 'Leader');
      
      if (leaderMember) {
        setLeader({
          id: 'leader',
          name: leaderMember.name,
          email: leaderMember.email,
          role: 'Leader',
          isNew: false,
          isModified: false,
          status: leaderMember.status,
        });
      }
      
      const loadedMembers = otherMembers.map((m, idx) => ({
        id: `${idx}`,
        name: m.name,
        email: m.email,
        role: m.role,
        isNew: false,
        isModified: false,
        status: m.status,
      }));
      
      setMembers(loadedMembers);
      setOriginalMembers(JSON.parse(JSON.stringify(loadedMembers)));
      
      if (team.name === teamName) {
        setTeamNameStatus('available');
      }
    }
  }, [open, team, teamName]); // Added teamName to deps to avoid stale closure

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTeamName('');
      setOriginalTeamName('');
      setTeamNameStatus('idle');
      setLeader(null);
      setMembers([]);
      setOriginalMembers([]);
      setSearchOpen(null);
      setSearchValue({});
    }
  }, [open]);

  // Check team name availability
  useEffect(() => {
    if (teamName.trim().length === 0) {
      setTeamNameStatus('idle');
      return;
    }

    // If name hasn't changed from original, it's available
    if (teamName === originalTeamName) {
      setTeamNameStatus('available');
      return;
    }

    setTeamNameStatus('checking');
    const timer = setTimeout(async () => {
      const isAvailable = await checkTeamNameAvailability(teamName, team?.id || 0);
      setTeamNameStatus(isAvailable ? 'available' : 'unavailable');
    }, 500);

    return () => clearTimeout(timer);
  }, [teamName, originalTeamName, team?.id]);

  const addMember = () => {
    const newId = `new-${Date.now()}`;
    setMembers([...members, { id: newId, name: '', email: '', role: 'Member', isNew: true }]);
  };

  const removeMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
    setSearchValue(prev => {
      const newSearchValue = { ...prev };
      delete newSearchValue[id];
      return newSearchValue;
    });
  };

  const handleSelectUser = (memberId, user) => {
    setMembers(members.map(m => {
      if (m.id === memberId) {
        const originalMember = originalMembers.find(om => om.id === memberId);
        const isModified = originalMember ? 
          (originalMember.email !== user.email || originalMember.name !== user.name) : false;
        
        return { 
          ...m, 
          name: user.name, 
          email: user.email,
          isModified: isModified && !m.isNew,
        };
      }
      return m;
    }));
    setSearchValue(prev => ({ ...prev, [memberId]: user.name }));
    setSearchOpen(null);
  };

  const getFilteredUsers = (memberId) => {
    const search = searchValue[memberId]?.toLowerCase() || '';
    if (!search) return USER_DATABASE;
    
    // Filter users by name
    return USER_DATABASE.filter(user => 
      user.name.toLowerCase().includes(search)
    );
  };

  const getStatusBadge = (status) => {
    if (!status || status === 'Accepted') {
      return <Badge variant="outline" className="text-success border-success/50 bg-success/10 text-xs">✅ Accepted</Badge>;
    }
    if (status === 'Declined') {
      return <Badge variant="outline" className="text-destructive border-destructive/50 bg-destructive/10 text-xs">❌ Declined</Badge>;
    }
    return <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10 text-xs">⏳ Pending</Badge>;
  };

  const handleSaveChanges = () => {
    // Validation
    if (teamNameStatus !== 'available') {
      toast.error('Please enter a valid, available team name');
      return;
    }

    if (!leader) {
      toast.error('Team must have a leader');
      return;
    }

    const hasEmptyMember = members.some(m => !m.name.trim() || !m.email.trim());
    if (hasEmptyMember) {
      toast.error('All members must be selected from the list');
      return;
    }

    const hasNewMembers = members.some(m => m.isNew);
    const hasModifiedMembers = members.some(m => m.isModified);

    // Combine leader and members
    const allMembers = [leader, ...members];

    // Success
    if (hasNewMembers) {
      toast.success('Team updated! New members added - team moved to Pending.');
    } else if (hasModifiedMembers || teamName !== originalTeamName) {
      toast.success('Team updated successfully! Members will be notified.');
    } else {
      toast.info('No changes detected');
    }

    if (team) {
      onSave(team.id, { name: teamName, members: allMembers }, hasNewMembers);
    }
    
    onClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (team && onDelete) {
      // Notify all team members
      const allMembers = leader ? [leader, ...members] : members;
      allMembers.forEach(member => {
        toast.info(`Notification sent to ${member.name}: Team "${teamName}" has been deleted.`);
      });
      
      onDelete(team.id);
      toast.success(`Team "${teamName}" deleted and members notified`);
      setDeleteDialogOpen(false);
      onClose();
    }
  };

  const hasNewMembers = members.some(m => m.isNew);

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-8 pb-4 flex-shrink-0">
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>
            Update team details. Existing members will be notified of changes. New members will receive invitations.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8">
          <div className="space-y-6 pb-6">
          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
            {teamNameStatus === 'checking' && (
              <p className="text-sm text-muted-foreground">Checking availability...</p>
            )}
            {teamNameStatus === 'available' && (
              <p className="text-sm text-success flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Available ✅
              </p>
            )}
            {teamNameStatus === 'unavailable' && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                Already in use ❌
              </p>
            )}
          </div>

          {/* Leader Section (Non-editable) */}
          {leader && (
            <div className="space-y-2">
              <Label>Team Leader</Label>
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-secondary" />
                      <p className="font-medium">{leader.name}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{leader.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">Role: Leader</p>
                      {getStatusBadge(leader.status)}
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
              </div>
            </div>
          )}

          {hasNewMembers && (
            <Alert className="bg-warning/10 border-warning/50">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning text-sm">
                Adding new members will move this team to Pending status until they accept invitations.
              </AlertDescription>
            </Alert>
          )}

          {/* Edit Members Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Team Members</Label>
              <p className="text-sm text-muted-foreground">
                Search by name to add members
              </p>
            </div>

            {members.map((member, index) => (
              <div key={member.id} className="p-6 border border-border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Member {index + 1}</span>
                    {member.isNew && (
                      <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">New</span>
                    )}
                    {member.isModified && !member.isNew && (
                      <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded">Modified</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {member.isNew ? (
                  // New member - show search
                  <div className="space-y-2">
                    <Label htmlFor={`member-${member.id}`} className="text-xs">Search by Name</Label>
                    <Popover 
                      open={searchOpen === member.id} 
                      onOpenChange={(open) => setSearchOpen(open ? member.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-start text-left font-normal"
                        >
                          {member.name || "Type to search..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Search by name..." 
                            value={searchValue[member.id] || ''}
                            onValueChange={(value) => {
                              setSearchValue(prev => ({ ...prev, [member.id]: value }));
                            }}
                          />
                          <CommandList>
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup>
                              {getFilteredUsers(member.id).map((user) => (
                                <CommandItem
                                  key={user.email}
                                  value={user.name}
                                  onSelect={() => handleSelectUser(member.id, user)}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{user.name}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {member.name && member.email && (
                      <div className="mt-2 p-3 bg-muted/30 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">Role: Member</p>
                          </div>
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Existing member - show info only
                  <div className="p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">Role: Member</p>
                          {getStatusBadge(member.status)}
                        </div>
                      </div>
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Member Button */}
            <Button
              variant="outline"
              onClick={addMember}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
          </div>
        </div>
        </div>

        <DialogFooter className="p-8 pt-4 border-t border-border flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            {/* Delete Button - only show for pending teams */}
            {isPending && onDelete && (
              <Button
                variant="outline"
                onClick={handleDeleteClick}
                className="text-destructive border-destructive/50 hover:bg-destructive hover:text-black"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Team
              </Button>
            )}
            <div className={`flex gap-2 ${!isPending || !onDelete ? 'ml-auto' : ''}`}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Team?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the team "{teamName}".
            All team members will be notified of this deletion. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete and Notify
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

const memberShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['Leader', 'Member']).isRequired,
  status: PropTypes.oneOf(['Pending', 'Accepted', 'Declined']),
});

EditTeamModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  team: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(memberShape).isRequired,
  }),
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  isPending: PropTypes.bool,
};