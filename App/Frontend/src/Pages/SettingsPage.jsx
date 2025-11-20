import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import {
  Settings,
  User,
  Bell,
  Lock,
  Globe,
  Moon,
  Sun,
  Mail,
  Shield,
  Monitor, // Added Monitor icon
  Save,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Sidebar } from '../components/general/Sidebar';
import { SegmentedControl } from '../components/ui/segmented-control';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'; // Added RadioGroup
import { useTheme } from '../utils/ThemeContext'; // Added useTheme hook
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

export const SettingsPage = ({ onNavigate, isSidebarCollapsed, onToggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const { theme, setTheme } = useTheme(); // Use theme context
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isSidebarCollapsed ?? true);
  const [activePage, setActivePage] = useState('settings');

  const handleNavigation = (page) => setActivePage(page);

  const handleToggleSidebar = () => {
    if (onToggleSidebar) onToggleSidebar();
    else setSidebarCollapsed((s) => !s);
  };

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);

  const [activeTab, setActiveTab] = useState('general');
  const isStudentView = user?.role === 'student';

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="flex h-screen bg-background pt-16">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        activePage={activePage}
        onNavigate={handleNavigation}
        role={user?.role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto smooth-scroll p-6 page-transition">
          <div
            className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
              isStudentView
                ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950'
                : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-950'
            }`}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isStudentView
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                  }`}
                >
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Settings
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your account settings and preferences
              </p>
            </motion.div>

            {/* Settings Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <SegmentedControl
                options={[
                  { value: 'general', label: <div className="flex items-center justify-center gap-2"><User className="w-4 h-4" /> General</div> },
                  { value: 'notifications', label: <div className="flex items-center justify-center gap-2"><Bell className="w-4 h-4" /> Notifications</div> },
                  { value: 'privacy', label: <div className="flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> Privacy</div> },
                  { value: 'preferences', label: <div className="flex items-center justify-center gap-2"><Globe className="w-4 h-4" /> Preferences</div> },
                ]}
                value={activeTab}
                onChange={setActiveTab}
                variant={user?.role || 'blue'}
              />

              {/* General Settings */}
              {activeTab === 'general' && (
                <Card className="p-6 dark:bg-gray-800 dark:border-gray-700 animate-fade-in">
                  <h3 className="text-xl font-black mb-4 dark:text-white">General Settings</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="dark:text-gray-300">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        defaultValue={user?.username}
                        className="dark:bg-gray-900 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="dark:text-gray-300">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        defaultValue={user?.email}
                        className="dark:bg-gray-900 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language" className="dark:text-gray-300">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger id="language" className="dark:bg-gray-900 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">Cancel</Button>
                      <Button
                        onClick={handleSaveSettings}
                        className={
                          isStudentView
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0'
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <Card className="p-6 dark:bg-gray-800 dark:border-gray-700 animate-fade-in">
                  <h3 className="text-xl font-black mb-4 dark:text-white">
                    Notification Preferences
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <Label className="dark:text-gray-300">Email Notifications</Label>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive email updates about your events
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <Label className="dark:text-gray-300">Push Notifications</Label>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified about important updates
                        </p>
                      </div>
                      <Switch
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <Label className="dark:text-gray-300">Event Reminders</Label>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive reminders before events start
                        </p>
                      </div>
                      <Switch
                        checked={eventReminders}
                        onCheckedChange={setEventReminders}
                      />
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">Cancel</Button>
                      <Button
                        onClick={handleSaveSettings}
                        className={
                          isStudentView
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0'
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <Card className="p-6 dark:bg-gray-800 dark:border-gray-700 animate-fade-in">
                  <h3 className="text-xl font-black mb-4 dark:text-white">Privacy & Security</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Profile Visibility</Label>
                      <Select defaultValue="public">
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Choose who can see your profile
                      </p>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="space-y-4">
                      <Label className="dark:text-gray-300">Password</Label>
                      <div className="grid gap-4">
                        <Input type="password" placeholder="Current password" className="dark:bg-gray-900 dark:border-gray-600" />
                        <Input type="password" placeholder="New password" className="dark:bg-gray-900 dark:border-gray-600" />
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          className="dark:bg-gray-900 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h4 className="font-semibold text-red-900 dark:text-red-300">
                          Danger Zone
                        </h4>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300/80 mb-3">
                        Delete your account and all associated data
                      </p>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">Cancel</Button>
                      <Button
                        onClick={handleSaveSettings}
                        className={
                          isStudentView
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0'
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Preferences Settings */}
              {activeTab === 'preferences' && (
                <Card className="p-6 dark:bg-gray-800 dark:border-gray-700 animate-fade-in">
                  <h3 className="text-xl font-black mb-4 dark:text-white">
                    Appearance & Preferences
                  </h3>
                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <div className="space-y-3">
                      <Label className="dark:text-gray-300 text-base">Theme Mode</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Choose how the application looks on your device
                      </p>
                      
                      <RadioGroup 
                        value={theme} 
                        onValueChange={(value) => setTheme(value)} 
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
                      >
                        {/* Light Theme Option */}
                        <label
                          htmlFor="light"
                          className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                            theme === 'light' 
                              ? 'border-primary bg-accent/50 dark:bg-accent/10' 
                              : 'border-border dark:border-gray-700'
                          }`}
                        >
                          <RadioGroupItem value="light" id="light" className="sr-only" />
                          <div className="w-full aspect-video bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center mb-2 overflow-hidden">
                            <div className="w-3/4 h-3/4 bg-white rounded shadow-sm flex flex-col gap-2 p-2">
                              <div className="w-1/2 h-2 bg-gray-200 rounded" />
                              <div className="w-full h-2 bg-gray-100 rounded" />
                              <div className="w-full h-2 bg-gray-100 rounded" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4 text-orange-500" />
                            <span className="font-medium dark:text-gray-200">Light</span>
                          </div>
                        </label>

                        {/* Dark Theme Option */}
                        <label
                          htmlFor="dark"
                          className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                            theme === 'dark' 
                              ? 'border-primary bg-accent/50 dark:bg-accent/10' 
                              : 'border-border dark:border-gray-700'
                          }`}
                        >
                          <RadioGroupItem value="dark" id="dark" className="sr-only" />
                          <div className="w-full aspect-video bg-gray-900 rounded-lg border border-gray-800 flex items-center justify-center mb-2 overflow-hidden">
                             <div className="w-3/4 h-3/4 bg-gray-800 rounded shadow-sm flex flex-col gap-2 p-2">
                              <div className="w-1/2 h-2 bg-gray-700 rounded" />
                              <div className="w-full h-2 bg-gray-700 rounded" />
                              <div className="w-full h-2 bg-gray-700 rounded" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4 text-indigo-400" />
                            <span className="font-medium dark:text-gray-200">Dark</span>
                          </div>
                        </label>

                        {/* System Theme Option */}
                        <label
                          htmlFor="system"
                          className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                            theme === 'system' 
                              ? 'border-primary bg-accent/50 dark:bg-accent/10' 
                              : 'border-border dark:border-gray-700'
                          }`}
                        >
                          <RadioGroupItem value="system" id="system" className="sr-only" />
                          <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 flex items-center justify-center mb-2">
                             <Monitor className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-blue-500" />
                            <span className="font-medium dark:text-gray-200">System</span>
                          </div>
                        </label>
                      </RadioGroup>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Timezone</Label>
                      <Select defaultValue="utc">
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">Eastern Time</SelectItem>
                          <SelectItem value="pst">Pacific Time</SelectItem>
                          <SelectItem value="ist">
                            Indian Standard Time
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Date Format</Label>
                      <Select defaultValue="mdy">
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">Default View</Label>
                      <Select defaultValue="grid">
                        <SelectTrigger className="dark:bg-gray-900 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="grid">Grid View</SelectItem>
                          <SelectItem value="list">List View</SelectItem>
                          <SelectItem value="compact">
                            Compact View
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">Cancel</Button>
                      <Button
                        onClick={handleSaveSettings}
                        className={
                          isStudentView
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0'
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};