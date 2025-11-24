import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Plus, X, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/Components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { fetchAllOrganizers } from '@/Store/auth.slice';
import { createTeam, fetchTeamList } from '@/Store/team.slice';

// Get current organizer from auth slice
const getCurrentOrganizer = (user) => {
  if (user?.profile) {
    return {
      name: user.profile.name || user.username,
      email: user.email,
      college: user.college,
    };
  }
  return {
    name: 'Unknown',
    email: 'unknown@example.com',
    college: 'Unknown',
  };
};

// Check team name availability against database
const checkTeamNameAvailability = async (name, teamList) => {
  if (!teamList) return true;
  return !teamList.some(team => team.name?.toLowerCase() === name.toLowerCase());
};

export function CreateTeamModal({ open, onClose }) {
  const dispatch = useDispatch();
  const { user, allOrganizers } = useSelector(state => state.auth);
  const { loading, error, teamList } = useSelector(state => state.team);

  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [teamNameStatus, setTeamNameStatus] = useState('idle');
  const [members, setMembers] = useState([]);
  const [searchOpen, setSearchOpen] = useState(null);
  const [searchValue, setSearchValue] = useState({});

  // Fetch organizers and team list whenever modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchAllOrganizers());
      dispatch(fetchTeamList());
    }
  }, [open, dispatch]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTeamName('');
      setDescription('');
      setTeamNameStatus('idle');
      setMembers([]);
      setSearchOpen(null);
      setSearchValue({});
    }
  }, [open]);

  // Check team name availability
  useEffect(() => {
    if (teamName.trim().length === 0 || !teamList) {
      setTeamNameStatus('idle');
      return;
    }

    setTeamNameStatus('checking');
    const timer = setTimeout(async () => {
      const isAvailable = await checkTeamNameAvailability(teamName, teamList);
      setTeamNameStatus(isAvailable ? 'available' : 'unavailable');
    }, 500);

    return () => clearTimeout(timer);
  }, [teamName, teamList]);

  const addMember = () => {
    const newId = Date.now().toString();
    setMembers([...members, { id: newId, name: '', email: '', role: 'volunteer' }]);
  };

  const removeMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
    setSearchValue(prev => {
      const newSearchValue = { ...prev };
      delete newSearchValue[id];
      return newSearchValue;
    });
  };

  const handleSelectUser = (memberId, organizer) => {
    const organizerName = organizer.profile?.name || organizer.username;
    setMembers(members.map(m =>
      m.id === memberId
        ? { ...m, name: organizerName, email: organizer.email, organizerId: organizer.id }
        : m
    ));
    setSearchValue(prev => ({ ...prev, [memberId]: organizerName }));
    setSearchOpen(null);
  };

  const getFilteredUsers = (memberId) => {
    const search = (searchValue[memberId] || '').toLowerCase();
    if (!allOrganizers || !user) return [];

    return allOrganizers
      .filter(o => o.college?.toString() === user.college?.toString() && o.email !== user.email)
      .filter(o => {
        const name = o.profile?.name?.toLowerCase() || '';
        const username = o.username?.toLowerCase() || '';
        return name.includes(search) || username.includes(search);
      });
  };

  const handleSendInvites = () => {
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

    const teamData = {
      name: teamName,
      description: description,
      members: members.map(m => ({ user: m.organizerId, role: m.role })),
    };
    console.log("Creating team with data:", teamData);
    dispatch(createTeam(teamData));
    toast.success('Team invites sent successfully!');
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
                  <CheckCircle className="w-4 h-4" /> Available ✅
                </p>
              )}
              {teamNameStatus === 'unavailable' && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Already in use ❌
                </p>
              )}
            </div>

            {/* Team Description */}
            <div className="space-y-2">
              <Label htmlFor="team-description">Team Description</Label>
              <Textarea
                id="team-description"
                placeholder="Briefly describe the team's purpose or focus"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Leader Section */}
            <div className="space-y-2">
              <Label>Team Leader</Label>
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{getCurrentOrganizer(user).name}</p>
                    <p className="text-sm text-muted-foreground">{getCurrentOrganizer(user).email}</p>
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
                <p className="text-sm text-muted-foreground">Search by name to add members</p>
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
                            onValueChange={(value) => setSearchValue(prev => ({ ...prev, [member.id]: value }))}
                          />
                          <CommandList>
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup>
                              {getFilteredUsers(member.id).map((organizer) => {
                                const organizerName = organizer.profile?.name || organizer.username;
                                return (
                                  <CommandItem
                                    key={organizer.email}
                                    value={organizerName}
                                    onSelect={() => handleSelectUser(member.id, organizer)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{organizerName}</span>
                                      <span className="text-xs text-muted-foreground">{organizer.email}</span>
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Role Selection */}
                    <div className="space-y-1">
                      <Label htmlFor={`role-${member.id}`} className="text-xs">Role</Label>
                      <Select
                        value={member.role}
                        onValueChange={(value) =>
                          setMembers(members.map(m => m.id === member.id ? { ...m, role: value } : m))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="co-organizer">Co-Organizer</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Display selected member info */}
                    {member.name && member.email && (
                      <div className="mt-2 p-3 bg-muted/30 rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Role: {member.role === 'co-organizer' ? 'Co-Organizer' : 'Volunteer'}
                            </p>
                          </div>
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addMember} className="w-full gap-2">
                <Plus className="w-4 h-4" /> Add Member
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSendInvites}>Send Invites</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

CreateTeamModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
