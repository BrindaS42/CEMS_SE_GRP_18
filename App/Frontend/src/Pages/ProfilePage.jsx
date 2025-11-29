import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'motion/react';
import {
  User, Mail, Phone, MapPin, Calendar, Linkedin, Github, Edit, Save, X, Plus, Trophy, FileText, Camera, Building, Link as LinkIcon, Briefcase, Flag, AlertTriangle, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SegmentedControl } from '@/components/ui/segmented-control'; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sidebar } from '@/components/general/Sidebar';
import { updateAuthProfile } from '@/store/auth.slice.js';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { createReport } from '@/store/admin.slice.js';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ProfilePage = ({ isSidebarCollapsed, onToggleSidebar }) => {
  const dispatch = useDispatch();
  const { user: loggedInUser } = useSelector((state) => state.auth || {});
  const { id: userIdFromUrl } = useParams();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [viewedUser, setViewedUser] = useState(null);
  const [achievementDialog, setAchievementDialog] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    proof: '',
  });
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const [activeTab, setActiveTab] = useState('info');

  const isOwnProfile = !userIdFromUrl || userIdFromUrl === loggedInUser?.id;
  const displayUser = isOwnProfile ? loggedInUser : viewedUser;

  const isStudentView = displayUser?.role === 'student';
  const isOrganizerView = displayUser?.role === 'organizer';
  const isSponsorView = displayUser?.role === 'sponsor';

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userIdFromUrl && !isOwnProfile) {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE}/profile/${userIdFromUrl}`);
          setViewedUser(response.data.user);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          toast.error('Could not load user profile.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserProfile();
  }, [userIdFromUrl, isOwnProfile]);

  useEffect(() => {
    if (displayUser) {
      setProfileData({
        ...(displayUser.profile || {}),
        sponsorDetails: displayUser.sponsorDetails || {},
      });
    } else {
      setProfileData({});
    }
  }, [displayUser]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await dispatch(updateAuthProfile(profileData)).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAchievement = () => {
    if (!newAchievement.title || !newAchievement.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    const updatedAchievements = [...(profileData.pastAchievements || []), newAchievement];
    setProfileData({ ...profileData, pastAchievements: updatedAchievements });
    setNewAchievement({ title: '', description: '', proof: '' });
    setAchievementDialog(false);
    toast.success('Achievement added! Remember to save your profile.');
  };

  const handleRemoveAchievement = (index) => {
    const updatedAchievements = (profileData.pastAchievements || []).filter((_, i) => i !== index);
    setProfileData({ ...profileData, pastAchievements: updatedAchievements });
  };

  const handleAddInterest = (interest) => {
    if (!interest || !interest.trim()) return;
    const updatedInterests = [...(profileData.areasOfInterest || []), interest.trim()];
    setProfileData({ ...profileData, areasOfInterest: updatedInterests });
  };

  const handleRemoveInterest = (index) => {
    const updatedInterests = (profileData.areasOfInterest || []).filter((_, i) => i !== index);
    setProfileData({ ...profileData, areasOfInterest: updatedInterests });
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfileData({ ...profileData, profilePic: url });
    toast.success('Profile picture uploaded!');
  };

  const getInitials = () => {
    if (profileData?.name) {
      return profileData.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return (displayUser?.email?.substring(0, 2).toUpperCase()) || 'U';
  };

  const getRoleColor = () => {
    if (isStudentView) return 'from-purple-500 via-pink-500 to-orange-500 dark:from-purple-400 dark:via-pink-500 dark:to-orange-400';
    if (isOrganizerView) return 'from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500';
    if (isSponsorView) return 'from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500';
    return 'from-gray-600 to-gray-800 dark:from-gray-500 dark:to-gray-700';
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) return;
    try {
      await dispatch(createReport({ modelType: 'user', id: userIdFromUrl, reason: reportReason })).unwrap();
      toast.success('User reported successfully. Our team will review it shortly.');
      setReportDialogOpen(false);
      setReportReason('');
    } catch (error) {
      toast.error(error || 'Failed to submit report');
    }
  };

  const ensureAbsoluteUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div className="flex h-screen bg-background pt-16">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onToggleSidebar}
        activePage={'profile'}
        onNavigate={() => {}}
        role={loggedInUser?.role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className={`flex-1 overflow-y-auto smooth-scroll page-transition transition-colors duration-300 ${
            isStudentView
              ? 'bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-orange-50/50 dark:from-gray-950 dark:via-purple-950/10 dark:to-gray-950'
              : 'bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-950 dark:via-indigo-950/10 dark:to-gray-950'
        }`}>
          <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            
            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-8 border-2 border-white/50 dark:border-gray-700 shadow-lg dark:bg-gray-800 rounded-3xl backdrop-blur-sm bg-white/80">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  {/* Profile Picture */}
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-700 shadow-lg">
                      <AvatarImage src={profileData?.profilePic} alt={profileData?.name} />
                      <AvatarFallback className={`text-3xl bg-gradient-to-br ${getRoleColor()} text-white`}>
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    {isOwnProfile && isEditing && (
                      <label
                        htmlFor="profile-picture"
                        className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors shadow-lg z-10"
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
                      <div className="space-y-4 max-w-md">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileData?.name || ''}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            placeholder="Enter your full name"
                            className="dark:bg-gray-900 dark:border-gray-600"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 dark:text-white">
                          {profileData?.name || 'Anonymous User'}
                        </h1>
                        <Badge className={`bg-gradient-to-r ${getRoleColor()} text-white border-0 mb-4 capitalize`}>
                          {displayUser?.role || 'user'}
                        </Badge>
                      </>
                    )}

                    <div className="flex flex-wrap gap-3 mt-4">
                      {!isEditing ? (
                        <>
                          <Button onClick={() => setIsEditing(true)} className={`bg-gradient-to-r ${getRoleColor()} border-0`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                          {!isOwnProfile && (
                            <Button variant="outline" onClick={() => setReportDialogOpen(true)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                              <Flag className="w-4 h-4 mr-2" />
                              Report User
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className={`bg-gradient-to-r ${getRoleColor()} border-0`}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsEditing(false);
                              setProfileData({ ...(displayUser?.profile || {}), sponsorDetails: displayUser?.sponsorDetails || {} });
                            }}
                            className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
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

            {/* Navigation and Content */}
            <div className="space-y-6">
              <div className="flex justify-center md:justify-start">
                <SegmentedControl
                  options={[
                    { value: 'info', label: 'Information' },
                    { value: 'achievements', label: 'Achievements' },
                    { value: 'interests', label: 'Interests' }
                  ]}
                  value={activeTab}
                  onChange={setActiveTab}
                  variant={loggedInUser?.role || 'student'}
                />
              </div>

              <div className="tab-transition">
                {activeTab === 'info' && (
                  <Card className="p-8 border-2 border-white/50 dark:border-gray-700 shadow-md dark:bg-gray-800 rounded-3xl backdrop-blur-sm bg-white/80 animate-fade-in">
                    <h2 className="text-2xl font-black mb-6 dark:text-white">Contact Information</h2>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2 mb-2 dark:text-gray-300 text-base">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        {isEditing ? (
                          <Input id="email" type="email" value={displayUser?.email || ''} disabled className="bg-gray-100 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-400" />
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 text-lg">{displayUser?.email || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2 mb-2 dark:text-gray-300 text-base">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </Label>
                        {isOwnProfile && isEditing ? (
                          <Input
                            id="phone"
                            type="tel"
                            value={profileData?.contactNo || ''}
                            onChange={(e) => setProfileData({ ...profileData, contactNo: e.target.value })}
                            placeholder="Enter phone number"
                            className="dark:bg-gray-900 dark:border-gray-600"
                          />
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 text-lg">{profileData?.contactNo || 'Not provided'}</p>
                        )}
                      </div>

                       <div>
                        <Label htmlFor="dob" className="flex items-center gap-2 mb-2 dark:text-gray-300 text-base">
                          <Calendar className="w-4 h-4" />
                          Date of Birth
                        </Label>
                        {isOwnProfile && isEditing ? (
                          <Input
                            id="dob"
                            type="date"
                            value={profileData?.dob ? new Date(profileData.dob).toISOString().split('T')[0] : ''}
                            onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                            className="dark:bg-gray-900 dark:border-gray-600"
                          />
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 text-lg">
                            {profileData?.dob ? new Date(profileData.dob).toLocaleDateString() : 'Not provided'}
                          </p>
                        )}
                      </div>

                       <div>
                        <Label htmlFor="address" className="flex items-center gap-2 mb-2 dark:text-gray-300 text-base">
                          <MapPin className="w-4 h-4" />
                          Address
                        </Label>
                        {isOwnProfile && isEditing ? (
                          <Input
                            id="address"
                            value={profileData?.address || ''}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                            placeholder="Enter address"
                            className="dark:bg-gray-900 dark:border-gray-600"
                          />
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 text-lg">{profileData?.address || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="linkedin" className="flex items-center gap-2 mb-2 dark:text-gray-300 text-base">
                          <Linkedin className="w-4 h-4" />
                          LinkedIn Profile
                        </Label>
                        {isOwnProfile && isEditing ? (
                          <Input
                            id="linkedin"
                            value={profileData?.linkedin || ''}
                            onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                            placeholder="LinkedIn URL"
                            className="dark:bg-gray-900 dark:border-gray-600"
                          />
                        ) : profileData?.linkedin ? (
                          <a
                            href={ensureAbsoluteUrl(profileData.linkedin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 dark:text-blue-400 text-lg"
                          >
                            View Profile <LinkIcon className="w-4 h-4" />
                          </a>
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 text-lg">Not provided</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="github" className="flex items-center gap-2 mb-2 dark:text-gray-300 text-base">
                          <Github className="w-4 h-4" />
                          GitHub Profile
                        </Label>
                        {isOwnProfile && isEditing ? (
                          <Input
                            id="github"
                            value={profileData?.github || ''}
                            onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                            placeholder="GitHub URL"
                            className="dark:bg-gray-900 dark:border-gray-600"
                          />
                        ) : profileData?.github ? (
                          <a
                            href={ensureAbsoluteUrl(profileData.github)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 dark:text-blue-400 text-lg"
                          >
                            View Profile <LinkIcon className="w-4 h-4" />
                          </a>
                        ) : (
                          <p className="text-gray-700 dark:text-gray-300 text-lg">Not provided</p>
                        )}
                      </div>
                    </div>

                    {/* Sponsor-specific fields */}
                    {isSponsorView && (
                      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2 dark:text-white">
                          <Building className="w-5 h-5" />
                          Sponsor Details
                        </h3>
                         <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <Label htmlFor="firmDescription" className="dark:text-gray-300 text-base mb-2 block">Firm Description</Label>
                          {isEditing ? (
                            <Textarea
                              id="firmDescription"
                              value={profileData?.sponsorDetails?.firmDescription || ''}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  sponsorDetails: { ...profileData.sponsorDetails, firmDescription: e.target.value },
                                })
                              }
                              placeholder="Describe your firm"
                              className="dark:bg-gray-900 dark:border-gray-600"
                            />
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{profileData?.sponsorDetails?.firmDescription || 'Not provided'}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="firmLogo" className="dark:text-gray-300 text-base mb-2 block">Firm Logo URL</Label>
                          {isEditing ? (
                            <Input
                              id="firmLogo"
                              value={profileData?.sponsorDetails?.firmLogo || ''}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  sponsorDetails: { ...profileData.sponsorDetails, firmLogo: e.target.value },
                                })
                              }
                              placeholder="URL for your firm's logo"
                              className="dark:bg-gray-900 dark:border-gray-600"
                            />
                          ) : profileData?.sponsorDetails?.firmLogo ? (
                            <div className="w-24 h-24 rounded-xl overflow-hidden border bg-gray-50 dark:bg-gray-900 dark:border-gray-600 p-2">
                              <img src={profileData.sponsorDetails.firmLogo} alt="Firm Logo" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 text-lg">Not provided</p>
                          )}
                        </div>

                         <div className="md:col-span-2">
                          <Label htmlFor="links" className="dark:text-gray-300 text-base mb-2 block">Website & Social Links</Label>
                          {isEditing ? (
                            <Textarea
                              id="links"
                              value={(profileData?.sponsorDetails?.links || []).join('\n')}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  sponsorDetails: { ...profileData.sponsorDetails, links: e.target.value.split('\n') },
                                })
                              }
                              placeholder="Enter each URL on a new line"
                              className="dark:bg-gray-900 dark:border-gray-600"
                            />
                          ) : profileData?.sponsorDetails?.links && profileData.sponsorDetails.links.filter((l) => l.trim()).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {profileData.sponsorDetails.links.map((link, idx) => (
                                link.trim() && (
                                  <a key={idx} href={ensureAbsoluteUrl(link)} target="_blank" rel="noopener noreferrer">
                                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-300 py-1.5 px-3 text-sm">
                                      <LinkIcon className="w-3 h-3 mr-1.5" />
                                      Link {idx + 1}
                                    </Badge>
                                  </a>
                                )
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-700 dark:text-gray-300 text-lg">Not provided</p>
                          )}
                        </div>
                      </div>
                      </div>
                    )}

                    {/* Resume Section - Students Only */}
                    {isStudentView && (
                      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <Label className="flex items-center gap-2 mb-4 dark:text-gray-300 text-base">
                          <FileText className="w-5 h-5" />
                          Resume
                        </Label>
                        {isOwnProfile && profileData?.resume ? (
                          <div className="flex items-center gap-3">
                            <Button variant="outline" asChild className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 h-11">
                              <a href={profileData?.resume} target="_blank" rel="noopener noreferrer">
                                View Resume
                              </a>
                            </Button>
                            {isEditing && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setProfileData({ ...profileData, resume: '' })}
                                className="dark:text-gray-400 dark:hover:text-red-400"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ) : isOwnProfile && isEditing ? (
                          <Input
                            type="url"
                            placeholder="Resume URL"
                            value={profileData?.resume || ''}
                            onChange={(e) => setProfileData({ ...profileData, resume: e.target.value })}
                            className="dark:bg-gray-900 dark:border-gray-600"
                          />
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-lg">No resume uploaded</p>
                        )}
                      </div>
                    )}
                  </Card>
                )}

                {activeTab === 'achievements' && (
                  <Card className="p-8 border-2 border-white/50 dark:border-gray-700 shadow-md dark:bg-gray-800 rounded-3xl backdrop-blur-sm bg-white/80 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-black dark:text-white">Past Achievements</h2>
                      {isOwnProfile && isEditing && (
                        <Button onClick={() => setAchievementDialog(true)} className={`bg-gradient-to-r ${getRoleColor()} border-0`}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Achievement
                        </Button>
                      )}
                    </div>

                    {profileData?.pastAchievements && profileData.pastAchievements.length > 0 ? (
                      <div className="space-y-4">
                        {profileData.pastAchievements.map((achievement, index) => (
                          <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                            <Card className="p-6 border-l-4 border-purple-500 dark:bg-gray-700 dark:border-t-0 dark:border-r-0 dark:border-b-0 shadow-sm">
                              <div className="flex items-start justify-between">
                                <div className="flex gap-4 flex-1">
                                  <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
                                  <div className="flex-1">
                                    <h3 className="font-black mb-1 dark:text-white text-lg">{achievement.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-2">{achievement.description}</p>
                                    {achievement.proof && (
                                      <Button variant="link" size="sm" asChild className="p-0 h-auto dark:text-blue-400 font-semibold">
                                        <a href={achievement.proof} target="_blank" rel="noopener noreferrer">
                                          View Proof
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {isOwnProfile && isEditing && (
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveAchievement(index)} className="dark:text-gray-400 dark:hover:text-red-400">
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
                        <Trophy className="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No achievements added yet</p>
                        {isOwnProfile && isEditing && (
                          <Button onClick={() => setAchievementDialog(true)} variant="outline" className="mt-4 dark:text-gray-300 dark:border-gray-600">
                            Add Your First Achievement
                          </Button>
                        )}
                      </div>
                    )}
                  </Card>
                )}

                {activeTab === 'interests' && (
                  <Card className="p-8 border-2 border-white/50 dark:border-gray-700 shadow-md dark:bg-gray-800 rounded-3xl backdrop-blur-sm bg-white/80 animate-fade-in">
                    <h2 className="text-2xl font-black mb-6 dark:text-white">Areas of Interest</h2>

                    {profileData?.areasOfInterest && profileData.areasOfInterest.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {profileData.areasOfInterest.map((interest, index) => (
                          <Badge key={index} variant="outline" className="text-base py-2 px-4 dark:text-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-900/50">
                            {interest}
                            {isOwnProfile && isEditing && (
                              <button onClick={() => handleRemoveInterest(index)} className="ml-2 hover:text-red-600 dark:hover:text-red-400">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">No interests added yet</p>
                    )}

                    {isOwnProfile && isEditing && (
                      <div className="mt-8">
                        <Label htmlFor="new-interest" className="dark:text-gray-300 mb-2 block">Add Interest</Label>
                        <div className="flex gap-3 mt-2">
                          <Input
                            id="new-interest"
                            placeholder="e.g., Web Development, Photography"
                            className="dark:bg-gray-900 dark:border-gray-600"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddInterest(e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <Button
                            onClick={() => {
                              const input = document.getElementById('new-interest');
                              if (input) {
                                handleAddInterest(input.value);
                                input.value = '';
                              }
                            }}
                            className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </div>

            {/* Add Achievement Dialog */}
            <Dialog open={achievementDialog} onOpenChange={setAchievementDialog}>
              <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Add Achievement</DialogTitle>
                  <DialogDescription className="dark:text-gray-400">Add a new achievement to your profile</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="achievement-title" className="dark:text-gray-300">Title *</Label>
                    <Input
                      id="achievement-title"
                      value={newAchievement.title}
                      onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                      placeholder="e.g., First Prize in Hackathon"
                      className="dark:bg-gray-900 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="achievement-desc" className="dark:text-gray-300">Description *</Label>
                    <Textarea
                      id="achievement-desc"
                      value={newAchievement.description}
                      onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                      placeholder="Describe your achievement..."
                      rows={3}
                      className="dark:bg-gray-900 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="achievement-proof" className="dark:text-gray-300">Proof (URL)</Label>
                    <Input
                      id="achievement-proof"
                      type="url"
                      value={newAchievement.proof}
                      onChange={(e) => setNewAchievement({ ...newAchievement, proof: e.target.value })}
                      placeholder="Link to certificate or proof"
                      className="dark:bg-gray-900 dark:border-gray-600"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAchievementDialog(false)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                    Cancel
                  </Button>
                  <Button onClick={handleAddAchievement} className={`bg-gradient-to-r ${getRoleColor()} border-0`}>
                    Add Achievement
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Report User Dialog */}
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Report User</DialogTitle>
                  <DialogDescription className="dark:text-gray-400">
                    Please describe the issue you're reporting. Our team will review it shortly.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe the issue..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="min-h-32 dark:bg-gray-900 dark:border-gray-600"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReportDialogOpen(false)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitReport} disabled={!reportReason.trim()} variant="destructive">
                    Submit Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </main>
      </div>
    </div>
  );
};