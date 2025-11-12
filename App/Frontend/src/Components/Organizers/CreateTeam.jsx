// CreateTeam.jsx
import * as React from "react";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components new/ui/card.js';
import { Button } from '../../../components new/ui/button.js';
import { Input } from '../../../components new/ui/input.js';
import { Textarea } from '../../../components new/ui/textarea.js';
import { Label } from '../../../components new/ui/label.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components new/ui/select.js';
import { Badge } from '../../../components new/ui/badge.js';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components new/ui/alert-dialog.js';
import { Users, Crown, UserPlus, Trash2, Shield, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { createTeam, fetchUsers, fetchTeamList, setDraftTeamMeta, addDraftMember, removeDraftMember, changeDraftMemberRole, inviteMember, clearDraft } from '../../Store/team.slice.js';

export default function CreateTeam() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, users, teamList, draft } = useSelector((state) => state.team);
  
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [memberToChangeRole, setMemberToChangeRole] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  React.useEffect(() => {
    dispatch(fetchUsers())
    dispatch(fetchTeamList())
  }, [dispatch])

  const addMember = () => {
    if (!newMemberEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    console.log("newMemberEmail", newMemberEmail)
    console.log("users", users)
    const match = users.find(u => u.email === newMemberEmail || u.username === newMemberEmail)
    if (!match) {
      toast.error('No matching user found');
      return;
    }

    if (draft.members.some(member => member.username === match.username)) {
      toast.error('Member already exists in the team');
      return;
    }

    const newMember = { username: match.username, email: match.email, role: 'editor' }
    dispatch(addDraftMember(newMember))
    setNewMemberEmail('');
    toast.success('Member added successfully');
  };

  const removeMember = (username) => {
    dispatch(removeDraftMember(username))
    setMemberToRemove(null);
    toast.success('Member removed successfully');
  };

  const changeRole = (username, newRole) => {
    dispatch(changeDraftMemberRole({ username, role: newRole }))
    setMemberToChangeRole(null);
    toast.success('Role updated successfully');
  };

  const onSubmit = async (data) => {
    if (draft.members.length === 0) {
      toast.error('Please add at least one team member');
      return;
    }
    console.log("draft", draft)

    const hasLeader = draft.members.some(member => member.role === 'co-organizer');
    if (!hasLeader) {
      toast.error('Please assign a co-organizer role to at least one member');
      return;
    }
    console.log("hasLeader", hasLeader)
    try {
      const name = data.teamName?.trim()
      const exists = teamList?.some(t => (t.name || '').toLowerCase() === (name || '').toLowerCase())
      if (exists) {
        toast.error('Team name already exists')
        return
      }
      console.log("exists", exists)
      const createRes = await dispatch(createTeam({ name, description: data.description })).unwrap();
      const teamId = createRes?.team?._id;
      if (!teamId) {
        toast.error('Team created but id missing');
        return;
      }
      console.log("teamId", teamId)
      // Send invitations sequentially
      for (const m of draft.members) {
        try {
          await dispatch(inviteMember({ teamId, username: m.username, role: m.role || 'volunteer' })).unwrap()
        } catch (e) {
          // continue sending others
        }
      }
      console.log("invitations sent")
      toast.success('Team created successfully!');
      reset();
      dispatch(clearDraft())
      console.log("draft cleared")
      // Navigate back to dashboard after successful creation
      setTimeout(() => {
        navigate('/dashboard');
        console.log("navigated to dashboard")
      }, 1500);
    } catch (error) {
      console.log("error", error)
      toast.error('Failed to create team. Please try again.');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'co-organizer':
        return <Crown className="h-4 w-4" />;
      case 'editor':
        return <Edit className="h-4 w-4" />;
      case 'volunteer':
        return <Eye className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'co-organizer':
        return 'bg-college-yellow text-college-blue';
      case 'editor':
        return 'bg-college-blue text-white';
      case 'volunteer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const suggestions = React.useMemo(() => {
    const q = newMemberEmail.trim().toLowerCase();
    if (!q) return [];
    const filtered = users.filter(u => (u.email?.toLowerCase().startsWith(q)) || (u.username?.toLowerCase().startsWith(q)));
    const existing = new Set(draft.members.map(m => m.username));
    return filtered.filter(u => !existing.has(u.username)).slice(0, 8);
  }, [newMemberEmail, users, draft.members]);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-college-blue/10">
          <Users className="h-6 w-6 text-college-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-college-blue">Create Team</h1>
          <p className="text-muted-foreground">Set up a new team with members and roles</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Team Creation Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-college-blue flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
              <Input
                id="teamName"
                {...register('teamName', { required: 'Team name is required' })}
                placeholder="Enter team name"
                className="w-full"
              />
              {errors.teamName && (
                <p className="text-sm text-destructive">{errors.teamName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of the team's purpose"
                className="w-full min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-college-blue flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Members */}
            <div className="space-y-2">
              <Label>Add Member</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={newMemberEmail}
                    onChange={(e) => { setNewMemberEmail(e.target.value); setShowSuggestions(true); setHighlightIndex(-1); }}
                    placeholder="Type username or email"
                    className="w-full"
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (showSuggestions && suggestions.length > 0) {
                        if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex(i => Math.min(i + 1, suggestions.length - 1)); }
                        if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex(i => Math.max(i - 1, 0)); }
                        if (e.key === 'Enter') {
                          if (highlightIndex >= 0) {
                            const s = suggestions[highlightIndex];
                            setNewMemberEmail(s.email || s.username);
                            setShowSuggestions(false);
                            e.preventDefault();
                            return;
                          }
                        }
                        if (e.key === 'Escape') { setShowSuggestions(false); }
                      }
                      if (e.key === 'Enter') { e.preventDefault(); addMember(); }
                    }}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-md border bg-white shadow">
                      {suggestions.map((u, idx) => (
                        <button
                          type="button"
                          key={u.username}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${idx === highlightIndex ? 'bg-gray-100' : ''}`}
                          onMouseEnter={() => setHighlightIndex(idx)}
                          onMouseDown={(e) => { e.preventDefault(); setNewMemberEmail(u.email || u.username); setShowSuggestions(false); }}
                        >
                          <div className="text-sm font-medium">{u.email || ''}</div>
                          <div className="text-xs text-gray-500">{u.username}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button type="button" onClick={addMember} className="bg-college-blue hover:bg-college-blue/90">
                  Add
                </Button>
              </div>
            </div>

            {/* Members List */}
            {draft.members.length > 0 && (
              <div className="space-y-3">
                <Label>Team Members ({draft.members.length})</Label>
                <div className="space-y-2">
                  {draft.members.map((member) => (
                    <div key={member.username} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.username}</span>
                          <span className="text-sm text-muted-foreground">({member.email})</span>
                        </div>
                        <Badge className={`flex items-center gap-1 ${getRoleBadgeColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select 
                          value={member.role} 
                          onValueChange={(value) => changeRole(member.username, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="co-organizer">co-organizer</SelectItem>
                            <SelectItem value="editor">editor</SelectItem>
                            <SelectItem value="volunteer">volunteer</SelectItem>
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.username} from the team? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => removeMember(member.username)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {draft.members.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No team members added yet</p>
                <p className="text-sm">Add members using the form above</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-college-blue flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge className="bg-college-yellow text-college-blue flex items-center gap-1">
                  <Crown className="h-4 w-4" />
                  Leader
                </Badge>
                <span className="text-sm">Full access - can edit and publish content</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge className="bg-college-blue text-white flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Editor
                </Badge>
                <span className="text-sm">Can edit content but cannot publish</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Viewer
                </Badge>
                <span className="text-sm">Read-only access to team content</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-college-blue hover:bg-college-blue/90 px-8"
          >
            {loading ? 'Creating Team...' : 'Create Team'}
          </Button>
        </div>
      </form>
    </div>
  );
}