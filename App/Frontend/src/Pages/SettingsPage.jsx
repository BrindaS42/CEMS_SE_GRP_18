import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react'; // Added AnimatePresence
import {
  Settings,
  Lock,
  Globe,
  Moon,
  Sun,
  Shield,
  Monitor, 
  Check, // Added Check
  X, // Added X
  Info // Added Info
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Separator } from '@/Components/ui/separator';
import { Sidebar } from '@/Components/general/Sidebar';
import { SegmentedControl } from '@/Components/ui/segmented-control';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { useTheme } from '../utils/ThemeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Components/ui/select';
import { toast } from 'sonner';
import { requestPasswordReset, verifyOtpAndResetPassword } from '../Store/auth.slice'; // Imported auth actions

export const SettingsPage = ({ onNavigate, isSidebarCollapsed, onToggleSidebar }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme, setTheme } = useTheme(); 
  const [activePage, setActivePage] = useState('settings');

  const handleNavigation = (page) => setActivePage(page);

  // Default to 'privacy'
  const [activeTab, setActiveTab] = useState('privacy');
  const isStudentView = user?.role === 'student';

  // --- Password Change State ---
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
  });

  // Dynamic Password Check
  useEffect(() => {
    setPasswordCriteria({
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
    });
  }, [newPassword]);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      // Assuming the API handles logged-in users by token, but passing email/role explicitly 
      // ensures clarity if the backend expects it in the body.
      await dispatch(requestPasswordReset({ email: user.email, role: user.role })).unwrap();
      setOtpSent(true);
      toast.success(`OTP sent to ${user.email}`);
    } catch (error) {
      toast.error(error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitChange = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!Object.values(passwordCriteria).every(Boolean)) {
      toast.error('Please ensure password meets all requirements');
      return;
    }

    setLoading(true);
    try {
      await dispatch(verifyOtpAndResetPassword({
        otp,
        newPassword,
        email: user.email,
        role: user.role
      })).unwrap();
      
      toast.success('Password changed successfully!');
      // Reset state
      setOtpSent(false);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Helper component for password rules
  const PasswordRule = ({ satisfied, label }) => (
    <div className={`flex items-center gap-2 text-sm transition-colors duration-200 ${satisfied ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
      {satisfied ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-background pt-16">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={onToggleSidebar}
        activePage={activePage}
        onNavigate={handleNavigation}
        role={user?.role}
      />
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/50 dark:bg-black/20">
        <main className="flex-1 overflow-y-auto smooth-scroll p-6 page-transition">
          <div className={`max-w-4xl transition-colors duration-300`}>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                    isStudentView
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                  }`}
                >
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Settings
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your account preferences and configurations
                  </p>
                </div>
              </div>
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
                  { value: 'privacy', label: <div className="flex items-center justify-center gap-2"><Lock className="w-4 h-4" /> Privacy</div> },
                  { value: 'preferences', label: <div className="flex items-center justify-center gap-2"><Globe className="w-4 h-4" /> Preferences</div> },
                ]}
                value={activeTab}
                onChange={setActiveTab}
                variant={user?.role || 'blue'}
              />

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden animate-fade-in">
                  <div className="p-6 md:p-8 space-y-8">
                    <div>
                      <h3 className="text-xl font-bold mb-1 dark:text-white">Privacy & Security</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Control your data and account security.</p>
                    </div>

                    <div className="space-y-8">
                      {/* Change Password Section */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium dark:text-gray-300 flex items-center gap-2">
                          Change Password
                          {otpSent && <span className="text-xs font-normal text-muted-foreground">(Step 2 of 2)</span>}
                        </Label>
                        
                        <div className="border rounded-xl p-6 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-950/30">
                          {!otpSent ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                  <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">Secure Password Change</p>
                                  <p>We'll send a verification code to <strong>{user?.email}</strong> to confirm it's you.</p>
                                </div>
                              </div>
                              <Button onClick={handleSendOtp} disabled={loading} className="w-full sm:w-auto">
                                {loading ? 'Sending...' : 'Send Verification Code'}
                              </Button>
                            </div>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
                              {/* Left: Form */}
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Verification Code</Label>
                                  <Input 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)} 
                                    placeholder="Enter 6-digit code" 
                                    maxLength={6}
                                    className="dark:bg-gray-950/50"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>New Password</Label>
                                  <Input 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    placeholder="Enter new password"
                                    className="dark:bg-gray-950/50"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Confirm Password</Label>
                                  <Input 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    placeholder="Confirm new password"
                                    className="dark:bg-gray-950/50"
                                  />
                                </div>
                                <div className="flex gap-3 pt-2">
                                  <Button 
                                    onClick={handleSubmitChange} 
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 hover:opacity-90"
                                  >
                                    {loading ? 'Updating...' : 'Change Password'}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setOtpSent(false);
                                      setOtp('');
                                      setNewPassword('');
                                      setConfirmPassword('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>

                              {/* Right: Requirements */}
                              <div className="bg-white dark:bg-black/20 p-5 rounded-xl border dark:border-gray-700 h-fit shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
                                  <Info className="w-5 h-5" />
                                  <h4 className="font-semibold">Password Requirements</h4>
                                </div>
                                <div className="space-y-3">
                                  <PasswordRule satisfied={passwordCriteria.length} label="At least 8 characters" />
                                  <PasswordRule satisfied={passwordCriteria.upper} label="One uppercase letter (A-Z)" />
                                  <PasswordRule satisfied={passwordCriteria.lower} label="One lowercase letter (a-z)" />
                                  <PasswordRule satisfied={passwordCriteria.number} label="One number (0-9)" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator className="bg-gray-100 dark:bg-gray-800" />

                      {/* Danger Zone */}
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4 dark:bg-red-900/10 dark:border-red-900/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <h4 className="font-semibold text-red-900 dark:text-red-300">
                            Danger Zone
                          </h4>
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button variant="destructive" className="rounded-lg bg-red-600 hover:bg-red-700 border-0">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Preferences Settings */}
              {activeTab === 'preferences' && (
                <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden animate-fade-in">
                  <div className="p-6 md:p-8 space-y-8">
                    <div>
                      <h3 className="text-xl font-bold mb-1 dark:text-white">
                        Appearance & Preferences
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Customize how CEMS looks and feels for you.</p>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Theme Selection */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium dark:text-gray-300">Theme Mode</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Select your preferred interface appearance.
                        </p>
                        
                        <RadioGroup 
                          value={theme} 
                          onValueChange={(value) => setTheme(value)} 
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
                        >
                          {/* Light Theme Option */}
                          <label
                            htmlFor="light"
                            className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              theme === 'light' 
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700'
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
                              <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-blue-500' : 'text-gray-400'}`} />
                              <span className={`font-medium ${theme === 'light' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>Light</span>
                            </div>
                          </label>

                          {/* Dark Theme Option */}
                          <label
                            htmlFor="dark"
                            className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              theme === 'dark' 
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700'
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
                              <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-500' : 'text-gray-400'}`} />
                              <span className={`font-medium ${theme === 'dark' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>Dark</span>
                            </div>
                          </label>

                          {/* System Theme Option */}
                          <label
                            htmlFor="system"
                            className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                              theme === 'system' 
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <RadioGroupItem value="system" id="system" className="sr-only" />
                            <div className="w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-2">
                               <Monitor className={`w-8 h-8 ${theme === 'system' ? 'text-blue-500' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Monitor className={`w-4 h-4 ${theme === 'system' ? 'text-blue-500' : 'text-gray-400'}`} />
                              <span className={`font-medium ${theme === 'system' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>System</span>
                            </div>
                          </label>
                        </RadioGroup>
                      </div>
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