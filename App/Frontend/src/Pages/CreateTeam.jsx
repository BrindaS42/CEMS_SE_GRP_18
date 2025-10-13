// CreateTeam.jsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Users, Crown, UserPlus, Trash2, Shield, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { createTeam } from '../store/slices/teamSlice';

export default function CreateTeam() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.team);
  
  const [members, setMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [memberToChangeRole, setMemberToChangeRole] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const addMember = () => {
    if (!newMemberEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (members.some(member => member.email === newMemberEmail)) {
      toast.error('Member already exists in the team');
      return;
    }

    const newMember = {
      id: Math.random().toString(36).substr(2, 9),
      email: newMemberEmail,
      username: newMemberEmail.split('@')[0],
      role: 'Editor',
      joinedAt: new Date().toISOString()
    };

    setMembers([...members, newMember]);
    setNewMemberEmail('');
    toast.success('Member added successfully');
  };

  const removeMember = (memberId) => {
    setMembers(members.filter(member => member.id !== memberId));
    setMemberToRemove(null);
    toast.success('Member removed successfully');
  };

  const changeRole = (memberId, newRole) => {
    setMembers(members.map(member => {
      if (member.id === memberId) {
        return { ...member, role: newRole };
      }
      // If setting someone as Leader, demote current leader to Editor
      if (newRole === 'Leader' && member.role === 'Leader') {
        return { ...member, role: 'Editor' };
      }
      return member;
    }));
    setMemberToChangeRole(null);
    toast.success('Role updated successfully');
  };

  const onSubmit = async (data) => {
    if (members.length === 0) {
      toast.error('Please add at least one team member');
      return;
    }

    const hasLeader = members.some(member => member.role === 'Leader');
    if (!hasLeader) {
      toast.error('Please assign a Leader role to at least one member');
      return;
    }

    try {
      const teamData = {
        name: data.teamName,
        description: data.description,
        members: members.map(({ id, joinedAt, ...member }) => member)
      };

      await dispatch(createTeam(teamData)).unwrap();
      
      toast.success('Team created successfully!');
      reset();
      setMembers([]);
      
      // Navigate back to dashboard after successful creation
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      toast.error('Failed to create team. Please try again.');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Leader':
        return <Crown className="h-4 w-4" />;
      case 'Editor':
        return <Edit className="h-4 w-4" />;
      case 'Viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Leader':
        return 'bg-college-yellow text-college-blue';
      case 'Editor':
        return 'bg-college-blue text-white';
      case 'Viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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
                <Input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                />
                <Button type="button" onClick={addMember} className="bg-college-blue hover:bg-college-blue/90">
                  Add
                </Button>
              </div>
            </div>

            {/* Members List */}
            {members.length > 0 && (
              <div className="space-y-3">
                <Label>Team Members ({members.length})</Label>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
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
                          onValueChange={(value) => changeRole(member.id, value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Leader">Leader</SelectItem>
                            <SelectItem value="Editor">Editor</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
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
                                onClick={() => removeMember(member.id)}
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

            {members.length === 0 && (
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