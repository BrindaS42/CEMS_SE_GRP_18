import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setEditMode, updateBasicInfo } from '../store/slices/profileSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner@2.0.3';
import { Edit3, Save, X, Phone, Mail, MapPin, Calendar } from 'lucide-react';

export default function ProfileSimple() {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.profile);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsSaving(false);
    dispatch(setEditMode(false));
    toast.success('Profile saved successfully!');
  };

  const handleInputChange = (field: string, value: string) => {
    dispatch(updateBasicInfo({ [field]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {profile.isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => dispatch(setEditMode(false))}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-college-blue hover:bg-college-blue/90"
              >
                {isSaving ? (
                  <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
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

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="border-border/50 hover:border-college-blue/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-college-blue">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.profilePicture} alt={profile.name} />
                <AvatarFallback className="bg-college-blue text-white text-xl">
                  {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
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

        {/* Professional Details */}
        <Card className="border-border/50 hover:border-college-blue/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-college-blue">
              Professional Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <Input
                id="linkedin"
                value={profile.linkedinProfile}
                onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                disabled={!profile.isEditing}
                className="mt-1"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <Label htmlFor="github">GitHub Profile</Label>
              <Input
                id="github"
                value={profile.githubProfile}
                onChange={(e) => handleInputChange('githubProfile', e.target.value)}
                disabled={!profile.isEditing}
                className="mt-1"
                placeholder="https://github.com/username"
              />
            </div>

            <div className="pt-4">
              <h4 className="font-medium mb-3">Areas of Interest</h4>
              <div className="flex flex-wrap gap-2">
                {profile.areasOfInterest.map((interest, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-college-blue/10 text-college-blue border border-college-blue/20"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <h4 className="font-medium mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-semibold text-college-blue">{profile.achievements.length}</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-semibold text-college-blue">{profile.publishedEvents.length}</div>
                  <div className="text-sm text-muted-foreground">Events</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            This is a simplified version of your profile. Complete profile features will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}