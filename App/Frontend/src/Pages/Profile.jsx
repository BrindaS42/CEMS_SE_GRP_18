// Profile.jsx

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setEditMode, 
  updateBasicInfo, 
  updateAreasOfInterest,
  addAchievement,
  updateAchievement,
  removeAchievement,
  addOtherRole,
  updateOtherRole,
  removeOtherRole,
  setSaving,
  setSaved,
  resetChanges
} from '../store/slices/profileSlice';
import { profileApi } from '../services/profileApi';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner@2.0.3';
import { 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Camera, 
  ExternalLink, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Github,
  Award,
  Users,
  Clock,
  Link2,
  Upload
} from 'lucide-react';

export default function Profile() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.profile);
  const [isLoading, setIsLoading] = useState(true);
  const [newInterest, setNewInterest] = useState('');
  const [showAchievementDialog, setShowAchievementDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const fileInputRef = useRef(null);

  // Form states for dialogs
  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    proofType: 'link',
    proofUrl: '',
    date: ''
  });

  const [roleForm, setRoleForm] = useState({
    title: '',
    organization: '',
    period: '',
    url: ''
  });

  useEffect(() => {
    // Use a shorter timeout for initial load to prevent page timeout
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        // Add timeout to prevent hanging
        const profileData = await Promise.race([
          profileApi.getProfile(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile load timeout')), 5000)
          )
        ]);
        dispatch(updateBasicInfo(profileData));
        dispatch(updateAreasOfInterest(profileData.areasOfInterest));
      } catch (error) {
        console.error('Profile load error:', error);
        // Don't show error toast immediately to prevent blocking
        setTimeout(() => toast.error('Failed to load profile data'), 100);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [dispatch]);

  const handleSave = async () => {
    if (!profile.hasUnsavedChanges) return;
    
    try {
      dispatch(setSaving(true));
      await profileApi.saveProfile(profile);
      dispatch(setSaved());
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    if (profile.hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        dispatch(resetChanges());
        dispatch(setEditMode(false));
      }
    } else {
      dispatch(setEditMode(false));
    }
  };

  const handleInputChange = (field, value) => {
    dispatch(updateBasicInfo({ [field]: value }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !profile.areasOfInterest.includes(newInterest.trim())) {
      dispatch(updateAreasOfInterest([...profile.areasOfInterest, newInterest.trim()]));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest) => {
    dispatch(updateAreasOfInterest(profile.areasOfInterest.filter(i => i !== interest)));
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Add file size check to prevent large uploads that could timeout
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      const toastId = toast.loading('Uploading profile picture...');
      const imageUrl = await profileApi.uploadProfilePicture(file);
      dispatch(updateBasicInfo({ profilePicture: imageUrl }));
      toast.dismiss(toastId);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error('Failed to upload profile picture');
    }
  };

  const handleAchievementSubmit = async () => {
    if (!achievementForm.title || !achievementForm.description || !achievementForm.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const achievementData = {
        ...achievementForm,
        proofUrl: achievementForm.proofType === 'link' ? achievementForm.proofUrl : undefined
      };

      if (editingAchievement) {
        dispatch(updateAchievement({ ...achievementData, id: editingAchievement.id }));
        toast.success('Achievement updated!');
      } else {
        dispatch(addAchievement(achievementData));
        toast.success('Achievement added!');
      }

      setShowAchievementDialog(false);
      setEditingAchievement(null);
      setAchievementForm({ title: '', description: '', proofType: 'link', proofUrl: '', date: '' });
    } catch (error) {
      toast.error('Failed to save achievement');
    }
  };

  const handleRoleSubmit = () => {
    if (!roleForm.title || !roleForm.organization || !roleForm.period) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingRole) {
        dispatch(updateOtherRole({ ...roleForm, id: editingRole.id }));
        toast.success('Role updated!');
      } else {
        dispatch(addOtherRole(roleForm));
        toast.success('Role added!');
      }

      setShowRoleDialog(false);
      setEditingRole(null);
      setRoleForm({ title: '', organization: '', period: '', url: '' });
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const openEditAchievement = (achievement) => {
    setEditingAchievement(achievement);
    setAchievementForm({
      title: achievement.title,
      description: achievement.description,
      proofType: achievement.proofType,
      proofUrl: achievement.proofUrl || '',
      date: achievement.date
    });
    setShowAchievementDialog(true);
  };

  const openEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({
      title: role.title,
      organization: role.organization,
      period: role.period,
      url: role.url || ''
    });
    setShowRoleDialog(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1>Profile</h1>
          <div className="w-32 h-10 bg-muted animate-pulse rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader className="space-y-2">
              <div className="w-32 h-6 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full h-4 bg-muted animate-pulse rounded"></div>
              <div className="w-3/4 h-4 bg-muted animate-pulse rounded"></div>
              <div className="w-1/2 h-4 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="space-y-2">
              <div className="w-32 h-6 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full h-4 bg-muted animate-pulse rounded"></div>
              <div className="w-3/4 h-4 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal and professional information
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {profile.lastSaved && (
            <span className="text-sm text-muted-foreground">
              Last saved: {new Date(profile.lastSaved).toLocaleTimeString()}
            </span>
          )}
          
          {profile.isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={profile.isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!profile.hasUnsavedChanges || profile.isSaving}
                className="bg-college-blue hover:bg-college-blue/90"
              >
                {profile.isSaving ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {profile.isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => dispatch(setEditMode(true))}
              className="bg-college-blue hover:bg-college-blue/90"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Unsaved changes alert */}
      {profile.hasUnsavedChanges && (
        <Alert className="border-college-yellow bg-college-yellow/10">
          <AlertDescription>
            You have unsaved changes. Don't forget to save your profile!
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="border-border/50 hover:border-college-blue/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-college-blue">
              <Users className="w-5 h-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.profilePicture} alt={profile.name} />
                  <AvatarFallback className="bg-college-blue text-white text-xl">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {profile.isEditing && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
              </div>
              <div>
                <h3 className="font-medium">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!profile.isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="contact"
                    value={profile.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    disabled={!profile.isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!profile.isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <div className="relative mt-1">
                  <Linkedin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    value={profile.linkedinProfile}
                    onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                    disabled={!profile.isEditing}
                    className="pl-10"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="github">GitHub Profile</Label>
                <div className="relative mt-1">
                  <Github className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="github"
                    value={profile.githubProfile}
                    onChange={(e) => handleInputChange('githubProfile', e.target.value)}
                    disabled={!profile.isEditing}
                    className="pl-10"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!profile.isEditing}
                    className="pl-10 min-h-[80px]"
                    placeholder="Enter your full address"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="dob"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!profile.isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Areas of Interest */}
        <Card className="border-border/50 hover:border-college-blue/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-college-blue">
              <Award className="w-5 h-5" />
              Areas of Interest
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.areasOfInterest.map((interest, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-college-blue/10 text-college-blue border-college-blue/20"
                >
                  {interest}
                  {profile.isEditing && (
                    <button
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>

            {profile.isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add new interest"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                />
                <Button onClick={handleAddInterest} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Achievements */}
        <Card className="border-border/50 hover:border-college-blue/30 transition-colors lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-college-blue">
                <Award className="w-5 h-5" />
                Past Achievements
              </CardTitle>
              {profile.isEditing && (
                <Dialog open={showAchievementDialog} onOpenChange={setShowAchievementDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Achievement
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAchievement 
                          ? 'Update the details of your achievement below.'
                          : 'Add a new achievement to showcase your accomplishments.'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="achievement-title">Title *</Label>
                        <Input
                          id="achievement-title"
                          value={achievementForm.title}
                          onChange={(e) => setAchievementForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Achievement title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="achievement-description">Description *</Label>
                        <Textarea
                          id="achievement-description"
                          value={achievementForm.description}
                          onChange={(e) => setAchievementForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your achievement"
                          className="min-h-[100px]"
                        />
                      </div>
                      <div>
                        <Label htmlFor="achievement-date">Date *</Label>
                        <Input
                          id="achievement-date"
                          type="date"
                          value={achievementForm.date}
                          onChange={(e) => setAchievementForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Proof Type</Label>
                        <Select
                          value={achievementForm.proofType}
                          onValueChange={(value) => setAchievementForm(prev => ({ ...prev, proofType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="link">Link</SelectItem>
                            <SelectItem value="file">File Upload</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {achievementForm.proofType === 'link' && (
                        <div>
                          <Label htmlFor="achievement-proof">Proof URL</Label>
                          <Input
                            id="achievement-proof"
                            value={achievementForm.proofUrl}
                            onChange={(e) => setAchievementForm(prev => ({ ...prev, proofUrl: e.target.value }))}
                            placeholder="https://..."
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setShowAchievementDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAchievementSubmit} className="bg-college-blue hover:bg-college-blue/90">
                        {editingAchievement ? 'Update' : 'Add'} Achievement
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.achievements.map((achievement) => (
                <div key={achievement.id} className="p-4 border border-border/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-college-blue">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(achievement.date).toLocaleDateString()}
                        </span>
                        {achievement.proofUrl && (
                          <a
                            href={achievement.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-college-blue hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Proof
                          </a>
                        )}
                      </div>
                    </div>
                    {profile.isEditing && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditAchievement(achievement)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Achievement</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{achievement.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => dispatch(removeAchievement(achievement.id))}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {profile.achievements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No achievements added yet</p>
                  {profile.isEditing && (
                    <p className="text-sm">Click "Add Achievement" to get started</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Published Events */}
        <Card className="border-border/50 hover:border-college-blue/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-college-blue">
              <Calendar className="w-5 h-5" />
              Published Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.publishedEvents.map((event) => (
                <div key={event.id} className="p-3 border border-border/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <Badge 
                          variant={event.role === 'Leader' ? 'default' : 'secondary'}
                          className={event.role === 'Leader' ? 'bg-college-blue' : ''}
                        >
                          {event.role}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <Badge
                          variant={event.status === 'Completed' ? 'default' : 
                                   event.status === 'Ongoing' ? 'secondary' : 'outline'}
                          className={event.status === 'Completed' ? 'bg-green-600' : 
                                     event.status === 'Ongoing' ? 'bg-college-yellow text-college-blue' : ''}
                        >
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {profile.publishedEvents.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No events published yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Other Roles / Links */}
        <Card className="border-border/50 hover:border-college-blue/30 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-college-blue">
                <Link2 className="w-5 h-5" />
                Other Roles & Links
              </CardTitle>
              {profile.isEditing && (
                <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRole ? 'Edit Role' : 'Add New Role'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingRole
                          ? 'Update the details of your role or position below.'
                          : 'Add a new role or external position to your profile.'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="role-title">Title *</Label>
                        <Input
                          id="role-title"
                          value={roleForm.title}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Role title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role-organization">Organization *</Label>
                        <Input
                          id="role-organization"
                          value={roleForm.organization}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, organization: e.target.value }))}
                          placeholder="Organization name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role-period">Period *</Label>
                        <Input
                          id="role-period"
                          value={roleForm.period}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, period: e.target.value }))}
                          placeholder="e.g., 2023-2024 or 2023-Present"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role-url">URL (optional)</Label>
                        <Input
                          id="role-url"
                          value={roleForm.url}
                          onChange={(e) => setRoleForm(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleRoleSubmit} className="bg-college-blue hover:bg-college-blue/90">
                        {editingRole ? 'Update' : 'Add'} Role
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.otherRoles.map((role) => (
                <div key={role.id} className="p-3 border border-border/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{role.title}</h4>
                      <p className="text-sm text-muted-foreground">{role.organization}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {role.period}
                        </span>
                        {role.url && (
                          <a
                            href={role.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-college-blue hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Visit
                          </a>
                        )}
                      </div>
                    </div>
                    {profile.isEditing && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditRole(role)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Role</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{role.title}" at {role.organization}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => dispatch(removeOtherRole(role.id))}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {profile.otherRoles.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Link2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No other roles added yet</p>
                  {profile.isEditing && (
                    <p className="text-sm">Click "Add Role" to get started</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}