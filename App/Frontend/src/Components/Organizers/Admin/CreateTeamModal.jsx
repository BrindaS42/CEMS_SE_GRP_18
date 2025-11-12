import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Plus, X, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';

// Mock current logged-in organiser
const CURRENT_ORGANISER = {
  name: 'John Doe',
  email: 'john@college.edu',
};

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
];

// Mock function to check team name availability
const checkTeamNameAvailability = async (name) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  const existingTeams = ['Innovators', 'Tech Giants', 'Code Warriors'];
  return !existingTeams.includes(name);
};

export function CreateTeamModal({ open, onClose }) {
  const [teamName, setTeamName] = useState('');
  const [teamNameStatus, setTeamNameStatus] = useState('idle');
  const [members, setMembers] = useState([]);
  const [searchOpen, setSearchOpen] = useState(null);
  const [searchValue, setSearchValue] = useState({});

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTeamName('');
      setTeamNameStatus('idle');
      setMembers([]);
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

    setTeamNameStatus('checking');
    const timer = setTimeout(async () => {
      const isAvailable = await checkTeamNameAvailability(teamName);
      setTeamNameStatus(isAvailable ? 'available' : 'unavailable');
    }, 500);

    return () => clearTimeout(timer);
  }, [teamName]);

  const addMember = () => {
    const newId = Date.now().toString();
    setMembers([...members, { id: newId, name: '', email: '', role: 'Member' }]);
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
    setMembers(members.map(m => 
      m.id === memberId 
        ? { ...m, name: user.name, email: user.email }
        : m
    ));
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

  const handleSendInvites = () => {
    // Validation
    if (teamNameStatus !== 'available') {
      toast.error('Please enter a valid, available team name');
      return;
    }

    if (members.length === 0) {
      toast.error('Please add at least one member');
      return;
    }

    const hasEmptyMember = members.some(m => !m.name.trim() || !m.email.trim());
    if (hasEmptyMember) {
      toast.error('All members must be selected from the list');
      return;
    }

    // Success
    toast.success('Team invites sent successfully!');
    console.log('Creating team:', { teamName, leader: CURRENT_ORGANISER, members });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-8 pb-4 flex-shrink-0">
          <DialogTitle>Create Team</DialogTitle>
          <DialogDescription>
            Create a new team by adding team members. You will be the team leader. All members will receive invitation notifications.
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
          <div className="space-y-2">
            <Label>Team Leader</Label>
            <div className="p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{CURRENT_ORGANISER.name}</p>
                  <p className="text-sm text-muted-foreground">{CURRENT_ORGANISER.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Role: Leader (You)</p>
                </div>
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            </div>
          </div>

          {/* Add Members Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Add Team Members</Label>
              <p className="text-sm text-muted-foreground">
                Search by name to add members
              </p>
            </div>

            {members.map((member, index) => (
              <div key={member.id} className="p-6 border border-border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Member {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

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

                  {/* Display selected member info */}
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSendInvites}>
            Send Invites
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

CreateTeamModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};