import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { toggleDarkMode, setDarkMode } from '../store/slices/uiSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { 
  Moon, 
  Sun, 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette 
} from 'lucide-react';

export default function Settings() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state: RootState) => state.ui);

  // Load dark mode preference from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      dispatch(setDarkMode(JSON.parse(savedDarkMode)));
    }
  }, [dispatch]);

  // Save dark mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const handleDarkModeToggle = () => {
    dispatch(toggleDarkMode());
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Triangular design elements */}
      <div className="absolute top-20 right-10 w-0 h-0 border-l-[25px] border-l-transparent border-t-[25px] border-t-college-yellow opacity-20"></div>
      <div className="absolute top-32 right-20 w-0 h-0 border-l-[18px] border-l-transparent border-t-[18px] border-t-college-red opacity-30"></div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-college-blue dark:text-white flex items-center gap-3">
          <SettingsIcon className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences and account settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-college-blue" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how the application looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  {darkMode ? (
                    <Moon className="h-4 w-4 text-college-blue" />
                  ) : (
                    <Sun className="h-4 w-4 text-college-yellow" />
                  )}
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={handleDarkModeToggle}
                className="data-[state=checked]:bg-college-blue"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-college-blue" />
              Account
            </CardTitle>
            <CardDescription>
              Manage your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Account settings will be available in future updates.
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-college-blue" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Notification preferences will be available in future updates.
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-college-blue" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Security settings will be available in future updates.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Event Management System v1.0 - Built for DAU College
        </p>
      </div>
    </div>
  );
}