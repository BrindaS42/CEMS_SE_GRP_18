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
  Database,
  HelpCircle,
  LogOut,
  Save,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
// import { useAuth } from '../context/AuthContext';
import {Sidebar} from '../components/general/Sidebar';
import { toast } from 'sonner';

export const SettingsPage = ({ onNavigate, isSidebarCollapsed, onToggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isSidebarCollapsed ?? true);
  const [activePage, setActivePage] = useState('settings');

  const handleNavigation = (page) => setActivePage(page);

  const handleToggleSidebar = () => {
    if (onToggleSidebar) onToggleSidebar();
    else setSidebarCollapsed((s) => !s);
  };
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);

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
            className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ${isStudentView
                ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'
                : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50'
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
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${isStudentView
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                  }`}
              >
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Settings
              </h1>
            </div>
            <p className="text-gray-600">
              Manage your account settings and preferences
            </p>
          </motion.div>

          {/* Settings Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="gap-2">
                  <User className="w-4 h-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="gap-2">
                  <Lock className="w-4 h-4" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="preferences" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Preferences
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <Card className="p-6">
                  <h3 className="text-xl font-black mb-4">General Settings</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        defaultValue={user?.username}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        defaultValue={user?.email}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger id="language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-3">
                      <Button variant="outline">Cancel</Button>
                      <Button
                        onClick={handleSaveSettings}
                        className={
                          isStudentView
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Notifications Settings */}
              <TabsContent value="notifications">
                <Card className="p-6">
                  <h3 className="text-xl font-black mb-4">
                    Notification Preferences
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <Label>Email Notifications</Label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Receive email updates about your events
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gray-500" />
                          <Label>Push Notifications</Label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Get notified about important updates
                        </p>
                      </div>
                      <Switch
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gray-500" />
                          <Label>Event Reminders</Label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Receive reminders before events start
                        </p>
                      </div>
                      <Switch
                        checked={eventReminders}
                        onCheckedChange={setEventReminders}
                      />
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-3">
                      <Button variant="outline">Cancel</Button>
                      <Button
                        onClick={handleSaveSettings}
                        className={
                          isStudentView
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Privacy Settings */}
              <TabsContent value="privacy">
                <Card className="p-6">
                  <h3 className="text-xl font-black mb-4">Privacy & Security</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Profile Visibility</Label>
                      <Select defaultValue="public">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        Choose who can see your profile
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label>Password</Label>
                      <div className="grid gap-4">
                        <Input type="password" placeholder="Current password" />
                        <Input type="password" placeholder="New password" />
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-red-600" />
                        <h4 className="font-semibold text-red-900">
                          Danger Zone
                        </h4>
                      </div>
                      <p className="text-sm text-red-700 mb-3">
                        Delete your account and all associated data
                      </p>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline">Cancel</Button>
                      <Button
                        onClick={handleSaveSettings}
                        className={
                          isStudentView
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Preferences Settings */}
              <TabsContent value="preferences">
                <Card className="p-6">
                  <h3 className="text-xl font-black mb-4">
                    Appearance & Preferences
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {darkMode ? (
                            <Moon className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Sun className="w-4 h-4 text-gray-500" />
                          )}
                          <Label>Dark Mode</Label>
                        </div>
                        <p className="text-sm text-gray-500">
                          Toggle dark mode theme
                        </p>
                      </div>
                      <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select defaultValue="utc">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="est">Eastern Time</SelectItem>
                          <SelectItem value="pst">Pacific Time</SelectItem>
                          <SelectItem value="ist">
                            Indian Standard Time
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select defaultValue="mdy">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Default View</Label>
                      <Select defaultValue="grid">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">Grid View</SelectItem>
                          <SelectItem value="list">List View</SelectItem>
                          <SelectItem value="compact">
                            Compact View
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-3">
                      <Button variant="outline">Cancel</Button>
                      <Button
                        onClick={handleSaveSettings}
                        className={
                          isStudentView
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
          </div>
          </main>
      </div>
    </div>
  );
};
