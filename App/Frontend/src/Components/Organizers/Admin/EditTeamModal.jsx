// EditTeamModal.js
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { fetchAllOrganizers } from '@/store/auth.slice';
import { fetchTeamList } from '@/store/team.slice';

/* -------------------------
   Helpers (same as CreateTeamModal)
   ------------------------- */
const getCurrentOrganizer = (user) => {
  if (user?.profile) {
    return {
      name: user.profile.name || user.username,
      email: user.email,
      college: user.college,
      _id: user._id || user.id,
    };
  }
  return {
    name: 'Unknown',
    email: 'unknown@example.com',
    college: null,
    _id: null,
  };
};

const getFilteredOrganizers = (allOrganizers, currentUser) => {
  if (!allOrganizers || !currentUser?.college) return [];
  return allOrganizers.filter(organizer =>
    organizer.college?.toString() === currentUser.college?.toString()
  );
};

const checkTeamNameAvailability = async (name, currentTeamId, teamList) => {
  await new Promise(resolve => setTimeout(resolve, 250));
  if (!teamList) return true;
  return !teamList.some(team => team._id !== currentTeamId && (team.name || '').toLowerCase() === (name || '').toLowerCase());
};

/* -------------------------
   Component
   ------------------------- */
export function EditTeamModal({ open, onClose, team, onSave, onDelete, isPending = false }) {
  const dispatch = useDispatch();
  const { user, allOrganizers } = useSelector((state) => state.auth);
  const { teamList } = useSelector((state) => state.team);

  const [teamName, setTeamName] = useState('');
  const [originalTeamName, setOriginalTeamName] = useState('');
  const [teamNameStatus, setTeamNameStatus] = useState('idle');
  const [teamDescription, setTeamDescription] = useState('');

  // Leader representation in UI
  const [leader, setLeader] = useState(null);

  // members: list used by UI. Each item shape:
  // { id, name, email, role, status, isNew, isModified, organizerId, organizerUsername }
  const [members, setMembers] = useState([]);
  const [originalMembers, setOriginalMembers] = useState([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(null);
  const [searchValue, setSearchValue] = useState({});

  // fetch organizers + teamList when modal opens if missing
  useEffect(() => {
    if (open && !allOrganizers) dispatch(fetchAllOrganizers());
    if (open && !teamList) dispatch(fetchTeamList());
  }, [open, allOrganizers, teamList, dispatch]);

  // Load team data when modal opens — expects full backend team object
  useEffect(() => {
    if (!open || !team) return;

    // Team name
    setTeamName(team.name || '');
    setOriginalTeamName(team.name || '');
    setTeamDescription(team.description || '');

    // Leader resolution:
    // Prefer populated team.leader object (if exists), else try to find member with role 'leader'
    let resolvedLeader = null;
    if (team.leader) {
      // leader may be ObjectId or populated object
      if (typeof team.leader === 'object' && (team.leader.profile || team.leader.email || team.leader._id)) {
        resolvedLeader = {
          id: 'leader',
          name: team.leader.profile?.name || team.leader.username || 'Unknown',
          email: team.leader.email || 'unknown@example.com',
          role: 'leader',
          isNew: false,
          isModified: false,
          status: team.leader.status || 'Accepted',
          organizerId: team.leader._id || team.leader?.toString?.(),
        };
      } else {
        // leader is just an id - try to find in members array
        const leaderMember = (team.members || []).find(m => (m.user && (m.user._id || m.user.id) === team.leader) || m.role === 'leader');
        if (leaderMember) {
          resolvedLeader = {
            id: 'leader',
            name: leaderMember.user?.profile?.name || leaderMember.user?.username || 'Unknown',
            email: leaderMember.user?.email || 'unknown@example.com',
            role: 'leader',
            isNew: false,
            isModified: false,
            status: leaderMember.status,
            organizerId: leaderMember.user?._id || leaderMember.user?.id,
          };
        } else {
          // fallback minimal
          resolvedLeader = {
            id: 'leader',
            name: 'Leader',
            email: 'unknown@example.com',
            role: 'leader',
            isNew: false,
            isModified: false,
            status: 'Accepted',
            organizerId: team.leader?.toString?.() || null,
          };
        }
      }
    } else {
      // no team.leader field: try members
      const leaderMember = (team.members || []).find(m => m.role === 'leader');
      if (leaderMember) {
        resolvedLeader = {
          id: 'leader',
          name: leaderMember.user?.profile?.name || leaderMember.user?.username || 'Unknown',
          email: leaderMember.user?.email || 'unknown@example.com',
          role: 'leader',
          isNew: false,
          isModified: false,
          status: leaderMember.status,
          organizerId: leaderMember.user?._id || leaderMember.user?.id,
        };
      }
    }
    setLeader(resolvedLeader);

    // Load other members (preserve organizerId and username if present)
    const otherMembers = (team.members || []).filter(m => m.role !== 'leader');
    const loadedMembers = otherMembers.map((m, idx) => ({
      id: `${m.user?._id || m.user?.id || idx}`, // stable id for React keys
      name: m.user?.profile?.name || m.user?.username || 'Unknown',
      email: m.user?.email || 'unknown@example.com',
      role: m.role || 'volunteer',
      isNew: false,
      isModified: false,
      status: m.status,
      organizerId: m.user?._id?.toString?.() || m.user?.id?.toString?.(),
      organizerUsername: m.user?.username || null,
    }));

    setMembers(loadedMembers);
    setOriginalMembers(JSON.parse(JSON.stringify(loadedMembers)));

    // if unchanged
    if (team.name === teamName) setTeamNameStatus('available');
  }, [open, team]); // don't include teamName here

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setTeamName('');
      setOriginalTeamName('');
      setTeamDescription('');
      setTeamNameStatus('idle');
      setLeader(null);
      setMembers([]);
      setOriginalMembers([]);
      setSearchOpen(null);
      setSearchValue({});
    }
  }, [open]);

  // Team name availability (debounced)
  useEffect(() => {
    if (!teamName || teamName.trim().length === 0) {
      setTeamNameStatus('idle');
      return;
    }
    if (teamName === originalTeamName) {
      setTeamNameStatus('available');
      return;
    }

    setTeamNameStatus('checking');
    const t = setTimeout(async () => {
      const available = await checkTeamNameAvailability(teamName, team?._id, teamList);
      setTeamNameStatus(available ? 'available' : 'unavailable');
    }, 500);

    return () => clearTimeout(t);
  }, [teamName, originalTeamName, team?._id, teamList]);

  /* -------------------------
     Member add/remove/select handlers
     ------------------------- */

  const addMember = () => {
    const newId = `new-${Date.now()}`;
    setMembers(prev => [...prev, {
      id: newId,
      name: '',
      email: '',
      role: 'volunteer',
      isNew: true,
      isModified: false,
      status: 'Pending',
      organizerId: null,
      organizerUsername: null,
    }]);
  };

  const removeMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setSearchValue(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // When user selected from search dropdown (organizer object from allOrganizers)
  const handleSelectUser = (memberId, organizer) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        // originalMember lookup by organizerId if exists, else by id
        const originalMember = originalMembers.find(om => om.organizerId === organizer._id?.toString?.() || om.id === memberId);
        const isModified = originalMember ? (originalMember.organizerId !== organizer._id?.toString?.()) : false;

        return {
          ...m,
          name: organizer.profile?.name || organizer.username || 'Unknown',
          email: organizer.email,
          organizerId: organizer._id?.toString?.() || organizer.id?.toString?.(),
          organizerUsername: organizer.username || null,
          isModified: isModified && !m.isNew,
        };
      }
      return m;
    }));
    setSearchValue(prev => ({ ...prev, [memberId]: organizer.profile?.name || organizer.username || 'Unknown' }));
    setSearchOpen(null);
  };

  // allow changing role for existing/new members
  const changeMemberRole = (memberId, newRole) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        // mark as modified if existing and role changed compared to original
        const originalMember = originalMembers.find(om => om.id === memberId || om.organizerId === m.organizerId);
        const roleChanged = originalMember ? (originalMember.role !== newRole) : false;
        return { ...m, role: newRole, isModified: (!m.isNew && roleChanged) || m.isModified };
      }
      return m;
    }));
  };

  // Filtered organizers for search (same-college + exclude leader)
  const getFilteredUsers = (memberId) => {
    const search = (searchValue[memberId] || '').toLowerCase().trim();
    let filtered = getFilteredOrganizers(allOrganizers, user);

    // Exclude leader (by email or id)
    if (leader?.organizerId) {
      filtered = filtered.filter(org => org._id?.toString?.() !== leader.organizerId?.toString?.());
    }

    if (search) {
      filtered = filtered.filter(org =>
        (org.profile?.name || org.username || '').toLowerCase().includes(search) ||
        (org.username || '').toLowerCase().includes(search)
      );
    }

    return filtered;
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

  /* -------------------------
     Save — compute membersToAdd / membersToUpdate / membersToRemove
     ------------------------- */
  const handleSaveChanges = () => {
    // Basic validation
    if (teamNameStatus !== 'available') {
      console.log("teamNameStatus:",teamNameStatus);
      toast.error('Please enter a valid, available team name');
      return;
    }
    if (!leader) {
      console.log("leader:",leader);
      toast.error('Team must have a leader');
      return;
    }

    console.log("members:",members);
    // Ensure no  empty selection for new members
    const hasEmpty = members.some(m => m.isNew && (!m.organizerId));
    if (hasEmpty) {
      console.log("hasEmpty:",hasEmpty);
      toast.error('Please select valid users for all new members');
      return;
    }

    // membersToAdd: new members (modal uses organizerUsername + role)
    const membersToAdd = members
      .filter(m => m.isNew && m.name)
      .map(m => ({ userId: m.organizerId, role: m.role }));

      console.log("membersToAdd:",membersToAdd);
    // membersToUpdate: existing members with role changes or manual isModified
    // backend expects { memberId, newRole } where memberId is the user id (not member doc id)
    const membersToUpdate = members
      .filter(m => !m.isNew && (m.isModified || (() => {
        // also check role changed vs original
        const orig = originalMembers.find(om => om.organizerId === m.organizerId || om.id === m.id);
        return orig ? orig.role !== m.role : false;
      })()))
      .map(m => ({ memberId: m.organizerId, newRole: m.role }));

      console.log("membersToUpdate:",membersToUpdate);
    // membersToRemove: any originally present member user ids that are missing now
    const currentOrganizerIds = members.filter(m => m.organizerId).map(m => m.organizerId.toString());
    const membersToRemove = originalMembers
      .filter(om => !currentOrganizerIds.includes((om.organizerId || '').toString()))
      .map(om => om.organizerId)
      .filter(Boolean);

      console.log("membersToRemove:",membersToRemove);

    const payload = {
      name: teamName,
      description: teamDescription,
      membersToRemove,
      membersToUpdate,
      membersToAdd,
    };

    console.log("payload:",payload);
    const hasNewMembers = membersToAdd.length > 0;
    // Call parent onSave -> parent handles dispatching editTeam thunk
    if (onSave && team && team._id) {
      onSave(team._id, payload, hasNewMembers);
    }

    // UI feedback and close
    if (hasNewMembers) {
      toast.success('Team updated! New members invited - team moved to Pending.');
    } else if (membersToUpdate.length > 0 || membersToRemove.length > 0 || teamName !== originalTeamName) {
      toast.success('Team updated successfully! Members will be notified.');
    } else {
      toast.info('No changes detected');
    }

    onClose();
  };

  const handleDeleteClick = () => setDeleteDialogOpen(true);

  const handleDeleteConfirm = () => {
    if (team && onDelete) {
      onDelete(team._id);
      toast.success('Team deleted');
      setDeleteDialogOpen(false);
      onClose();
    }
  };

  const hasNewMembers = members.some(m => m.isNew);

  /* -------------------------
     Render
     ------------------------- */
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
                {teamNameStatus === 'checking' && <p className="text-sm text-muted-foreground">Checking availability...</p>}
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
              <Label htmlFor="team-description-edit">Team Description</Label>
              <Textarea
                id="team-description-edit"
                placeholder="Briefly describe the team's purpose or focus"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                rows={3}
              />
            </div>

              {/* Leader */}
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

              {/* Members */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Team Members</Label>
                  <p className="text-sm text-muted-foreground">Search by name to add or change members</p>
                </div>

                {members.map((member, index) => (
                  <div key={member.id} className="p-6 border border-border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Member {index + 1}</span>
                        {member.isNew && <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">New</span>}
                        {member.isModified && !member.isNew && <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded">Modified</span>}
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

                    {/* If new -> show search selector */}
                    {member.isNew ? (
                      <div className="space-y-2">
                        <Label htmlFor={`member-${member.id}`} className="text-xs">Search by Name</Label>
                        <Popover open={searchOpen === member.id} onOpenChange={(open) => setSearchOpen(open ? member.id : null)}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-start text-left font-normal">
                              {member.name || 'Type to search...'}
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
                                  {getFilteredUsers(member.id).map(org => {
                                    const name = org.profile?.name || org.username || org.email;
                                    return (
                                      <CommandItem key={org._id || org.email} value={name} onSelect={() => handleSelectUser(member.id, org)}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{name}</span>
                                          <span className="text-xs text-muted-foreground">{org.email}</span>
                                        </div>
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {/* Role selector for new member */}
                        <div className="space-y-1">
                          <Label htmlFor={`role-${member.id}`} className="text-xs">Role</Label>
                          <Select value={member.role} onValueChange={(value) => changeMemberRole(member.id, value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="co-organizer">Co-Organizer</SelectItem>
                              <SelectItem value="volunteer">Volunteer</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {member.name && member.email && (
                          <div className="mt-2 p-3 bg-muted/30 rounded-md">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                <p className="text-xs text-muted-foreground mt-1">Role: {member.role}</p>
                              </div>
                              <CheckCircle className="w-4 h-4 text-success" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Existing member — show info and allow role change
                      <div className="p-3 bg-muted/30 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground">Role:</p>
                                <Select value={member.role} onValueChange={(value) => changeMemberRole(member.id, value)}>
                                  <SelectTrigger className="w-36 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="co-organizer">Co-Organizer</SelectItem>
                                    <SelectItem value="volunteer">Volunteer</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {getStatusBadge(member.status)}
                            </div>
                          </div>
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <Button variant="outline" onClick={addMember} className="w-full gap-2">
                  <Plus className="w-4 h-4" /> Add Member
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-4 border-t border-border flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              {isPending && onDelete && (
                <Button variant="outline" onClick={handleDeleteClick} className="text-destructive border-destructive/50 hover:bg-destructive hover:text-black">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Team
                </Button>
              )}

              <div className={`flex gap-2 ${!isPending || !onDelete ? 'ml-auto' : ''}`}>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete and Notify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* -------------------------
   PropTypes
   ------------------------- */
EditTeamModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  team: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    leader: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    members: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        role: PropTypes.string,
        status: PropTypes.string,
        user: PropTypes.shape({
          _id: PropTypes.string,
          username: PropTypes.string,
          email: PropTypes.string,
          profile: PropTypes.shape({ name: PropTypes.string })
        })
      })
    )
  }),
  onSave: PropTypes.func.isRequired, // (teamId, payload, hasNewMembers) => void
  onDelete: PropTypes.func,
  isPending: PropTypes.bool,
};
