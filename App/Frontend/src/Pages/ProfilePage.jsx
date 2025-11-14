// ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Linkedin,
  Github,
  Edit,
  Save,
  X,
  Plus,
  Trophy,
  FileText,
  Camera,
  Link as LinkIcon,
  Briefcase,
  Flag,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Sidebar } from '@/components/general/Sidebar';
import { updateAuthProfile } from '../store/auth.slice.js';
import { toast } from 'sonner';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth || {});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [activePage, setActivePage] = useState('profile');

  const handleNavigation = (page) => {
    setActivePage(page);
  };
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(profile || {});
  const [achievementDialog, setAchievementDialog] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    proof: '',
  });

  const isStudentView = user?.role === 'student';
  const isOrganizerView = user?.role === 'organizer';
  const isSponsorView = user?.role === 'sponsor';

  // // Fetch profile on component mount if not already loaded
  // useEffect(() => {
  //   if (!profile) {
  //     dispatch(fetchAuthProfile());
  //   }
  // }, [dispatch, profile]);


  // Profile is now loaded with auth, sync to local state when it changes
  useEffect(() => {
    if (profile) {
      setProfileData(profile);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await dispatch(updateAuthProfile(profileData)).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchievement = () => {
    if (!newAchievement.title || !newAchievement.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedAchievements = [
      ...(profileData.pastAchievements || []),
      newAchievement,
    ];

    setProfileData({
      ...profileData,
      pastAchievements: updatedAchievements,
    });

    setNewAchievement({ title: '', description: '', proof: '' });
    setAchievementDialog(false);
    toast.success('Achievement added! Remember to save your profile.');
  };

  const handleRemoveAchievement = (index) => {
    const updatedAchievements = (profileData.pastAchievements || []).filter((_, i) => i !== index);
    setProfileData({
      ...profileData,
      pastAchievements: updatedAchievements,
    });
  };

  const handleAddInterest = (interest) => {
    if (!interest || !interest.trim()) return;

    const updatedInterests = [
      ...(profileData.areasOfInterest || []),
      interest.trim(),
    ];

    setProfileData({
      ...profileData,
      areasOfInterest: updatedInterests,
    });
  };

  const handleRemoveInterest = (index) => {
    const updatedInterests = (profileData.areasOfInterest || []).filter((_, i) => i !== index);
    setProfileData({
      ...profileData,
      areasOfInterest: updatedInterests,
    });
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, create a mock URL since backend doesn't have upload endpoint
    const url = URL.createObjectURL(file);
    setProfileData({
      ...profileData,
      profilePic: url,
    });
    toast.success('Profile picture uploaded!');
  };

  const getInitials = () => {
    if (profileData.name) {
      return profileData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return (user?.username?.substring(0, 2).toUpperCase()) || 'U';
  };

  const getRoleColor = () => {
    if (isStudentView) return 'from-purple-500 via-pink-500 to-orange-500';
    if (isOrganizerView) return 'from-indigo-600 via-purple-600 to-pink-600';
    if (isSponsorView) return 'from-blue-600 via-indigo-600 to-purple-600';
    return 'from-gray-600 to-gray-800';
  };

  const handleReport = (reason) => {
    toast.success(`User reported for: ${reason}`);
    // In a real app, this would send a report to the backend
  };

  return (
    <div className="flex h-screen bg-background pt-16">

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activePage={activePage}
        onNavigate={handleNavigation}
        role={user?.role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto smooth-scroll p-6 page-transition">
          <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${isStudentView
              ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'
              : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'
            }`}>
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 mb-8 border-2 shadow-lg">
              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Profile Picture */}
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={profileData.profilePic} alt={profileData.name} />
                    <AvatarFallback className={`text-3xl bg-gradient-to-br ${getRoleColor()} text-white`}>
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label
                      htmlFor="profile-picture"
                      className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors shadow-lg"
                    >
                      <Camera className="w-5 h-5 text-white" />
                      <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureUpload}
                      />
                    </label>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name || ''}
                          onChange={(e) =>
                            setProfileData({ ...profileData, name: e.target.value })
                          }
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl md:text-4xl font-black mb-2">
                        {profileData.name  || 'Anonymous User'}
                      </h1>
                      <Badge className={`bg-gradient-to-r ${getRoleColor()} text-white border-0 mb-4`}>
                        {user?.role?.toUpperCase()}
                      </Badge>
                    </>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {!isEditing ? (
                      <>
                        <Button
                          onClick={() => setIsEditing(true)}
                          className={`bg-gradient-to-r ${getRoleColor()}`}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <Flag className="w-4 h-4 mr-2" />
                              Report
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => handleReport('Spam')}>
                              <Flag className="w-4 h-4 mr-2" />
                              Spam
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReport('Inappropriate Content')}>
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Inappropriate Content
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReport('Harassment')}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Harassment
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReport('Other')}>
                              <FileText className="w-4 h-4 mr-2" />
                              Other
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className={`bg-gradient-to-r ${getRoleColor()}`}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setProfileData(profile || {});
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Profile Details */}
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="interests">Interests</TabsTrigger>
            </TabsList>

            {/* Information Tab */}
            <TabsContent value="info">
              <Card className="p-8">
                <h2 className="text-2xl font-black mb-6">Contact Information</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-100"
                      />
                    ) : (
                      <p className="text-gray-700">{user?.email || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.contactNo || ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, contactNo: e.target.value })
                        }
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-gray-700">{profileData.contactNo || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dob" className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      Date of Birth
                    </Label>
                    {isEditing ? (
                      <Input
                        id="dob"
                        type="date"
                        value={profileData.dob || ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, dob: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-gray-700">
                        {profileData.dob
                          ? new Date(profileData.dob).toLocaleDateString()
                          : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={profileData.address || ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, address: e.target.value })
                        }
                        placeholder="Enter address"
                      />
                    ) : (
                      <p className="text-gray-700">{profileData.address || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="linkedin" className="flex items-center gap-2 mb-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                    </Label>
                    {isEditing ? (
                      <Input
                        id="linkedin"
                        value={profileData.linkedin || ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, linkedin: e.target.value })
                        }
                        placeholder="LinkedIn URL"
                      />
                    ) : profileData.linkedin ? (
                      <a
                        href={profileData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View Profile <LinkIcon className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-gray-700">Not provided</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="github" className="flex items-center gap-2 mb-2">
                      <Github className="w-4 h-4" />
                      GitHub Profile
                    </Label>
                    {isEditing ? (
                      <Input
                        id="github"
                        value={profileData.github || ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, github: e.target.value })
                        }
                        placeholder="GitHub URL"
                      />
                    ) : profileData.github ? (
                      <a
                        href={profileData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        View Profile <LinkIcon className="w-3 h-3" />
                      </a>
                    ) : (
                      <p className="text-gray-700">Not provided</p>
                    )}
                  </div>
                </div>

                {/* Resume Section - Students Only */}
                {isStudentView && (
                  <div className="mt-8 pt-8 border-t">
                    <Label className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      Resume
                    </Label>
                    {profileData.resume ? (
                      <div className="flex items-center gap-3">
                        <Button variant="outline" asChild>
                          <a href={profileData.resume} target="_blank" rel="noopener noreferrer">
                            View Resume
                          </a>
                        </Button>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setProfileData({ ...profileData, resume: '' })}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ) : isEditing ? (
                      <Input
                        type="url"
                        placeholder="Resume URL"
                        onChange={(e) =>
                          setProfileData({ ...profileData, resume: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-gray-500">No resume uploaded</p>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements">
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black">Past Achievements</h2>
                  {isEditing && (
                    <Button
                      onClick={() => setAchievementDialog(true)}
                      className={`bg-gradient-to-r ${getRoleColor()}`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Achievement
                    </Button>
                  )}
                </div>

                {profileData.pastAchievements && profileData.pastAchievements.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.pastAchievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-6 border-l-4 border-purple-500">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4 flex-1">
                              <Trophy className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                              <div className="flex-1">
                                <h3 className="font-black mb-1">{achievement.title}</h3>
                                <p className="text-gray-600 mb-2">{achievement.description}</p>
                                {achievement.proof && (
                                  <Button variant="link" size="sm" asChild className="p-0 h-auto">
                                    <a href={achievement.proof} target="_blank" rel="noopener noreferrer">
                                      View Proof
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveAchievement(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No achievements added yet</p>
                    {isEditing && (
                      <Button
                        onClick={() => setAchievementDialog(true)}
                        variant="outline"
                        className="mt-4"
                      >
                        Add Your First Achievement
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Interests Tab */}
            <TabsContent value="interests">
              <Card className="p-8">
                <h2 className="text-2xl font-black mb-6">Areas of Interest</h2>

                {profileData.areasOfInterest && profileData.areasOfInterest.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {profileData.areasOfInterest.map((interest, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-base py-2 px-4"
                      >
                        {interest}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveInterest(index)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mb-4">No interests added yet</p>
                )}

                {isEditing && (
                  <div className="mt-6">
                    <Label htmlFor="new-interest">Add Interest</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="new-interest"
                        placeholder="e.g., Web Development, Photography"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddInterest(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button
                        onClick={(e) => {
                          const input = document.getElementById('new-interest');
                          if (input) {
                            handleAddInterest(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Achievement Dialog */}
        <Dialog open={achievementDialog} onOpenChange={setAchievementDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Achievement</DialogTitle>
              <DialogDescription>
                Add a new achievement to your profile
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="achievement-title">Title *</Label>
                <Input
                  id="achievement-title"
                  value={newAchievement.title}
                  onChange={(e) =>
                    setNewAchievement({ ...newAchievement, title: e.target.value })
                  }
                  placeholder="e.g., First Prize in Hackathon"
                />
              </div>
              <div>
                <Label htmlFor="achievement-desc">Description *</Label>
                <Textarea
                  id="achievement-desc"
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement({ ...newAchievement, description: e.target.value })
                  }
                  placeholder="Describe your achievement..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="achievement-proof">Proof (URL)</Label>
                <Input
                  id="achievement-proof"
                  type="url"
                  value={newAchievement.proof}
                  onChange={(e) =>
                    setNewAchievement({ ...newAchievement, proof: e.target.value })
                  }
                  placeholder="Link to certificate or proof"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAchievementDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAchievement} className={`bg-gradient-to-r ${getRoleColor()}`}>
                Add Achievement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </main>
      </div>
    </div>
  );
};

export default ProfilePage;