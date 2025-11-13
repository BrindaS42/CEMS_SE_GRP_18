import PropTypes from 'prop-types';
import { Sidebar } from '../Components/Organizers/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useTheme } from '../utils/ThemeContext';
import { Monitor, Moon, Sun } from 'lucide-react';

export default function SettingsPage({ onNavigate, isSidebarCollapsed, onToggleSidebar, currentRole = 'organizer' }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen bg-background pt-16">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={onToggleSidebar}
        activePage="settings"
        onNavigate={onNavigate}
        role={currentRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Settings Content */}
        <main className="flex-1 overflow-y-auto smooth-scroll" data-page-content>
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your application preferences</p>
            </div>

            {/* Appearance Settings */}
            <Card className="animate-fade-in-up stagger-2 card-interact">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Theme Mode</span>
                  <RadioGroup value={theme} onValueChange={(value) => setTheme(value)}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Light Theme Option */}
                      <label
                        htmlFor="light"
                        className={`relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 cursor-pointer transition-all duration-300 ease-apple hover:bg-accent/50 hover:scale-105 hover:shadow-md ${
                          theme === 'light' 
                            ? 'border-primary bg-accent/30' 
                            : 'border-border'
                        }`}
                      >
                        <RadioGroupItem value="light" id="light" className="sr-only" />
                        <Sun className="w-8 h-8 text-primary" />
                        <div className="text-center">
                          <div className="font-medium">Light</div>
                          <div className="text-sm text-muted-foreground">Bright and clear</div>
                        </div>
                        {theme === 'light' && (
                          <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full" />
                        )}
                      </label>

                      {/* Dark Theme Option */}
                      <label
                        htmlFor="dark"
                        className={`relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 cursor-pointer transition-all hover:bg-accent/50 ${
                          theme === 'dark' 
                            ? 'border-primary bg-accent/30' 
                            : 'border-border'
                        }`}
                      >
                        <RadioGroupItem value="dark" id="dark" className="sr-only" />
                        <Moon className="w-8 h-8 text-primary" />
                        <div className="text-center">
                          <div className="font-medium">Dark</div>
                          <div className="text-sm text-muted-foreground">Easy on the eyes</div>
                        </div>
                        {theme === 'dark' && (
                          <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full" />
                        )}
                      </label>

                      {/* System Theme Option */}
                      <label
                        htmlFor="system"
                        className={`relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 cursor-pointer transition-all hover:bg-accent/50 ${
                          theme === 'system' 
                            ? 'border-primary bg-accent/30' 
                            : 'border-border'
                        }`}
                      >
                        <RadioGroupItem value="system" id="system" className="sr-only" />
                        <Monitor className="w-8 h-8 text-primary" />
                        <div className="text-center">
                          <div className="font-medium">System</div>
                          <div className="text-sm text-muted-foreground">Auto-adjust</div>
                        </div>
                        {theme === 'system' && (
                          <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full" />
                        )}
                      </label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Color Preview */}
                <div className="space-y-3">
                  <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">College Brand Colors</span>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[#2D3E7E] shadow-sm" />
                      <div className="text-xs text-center text-muted-foreground">Navy Blue</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[#FDB913] shadow-sm" />
                      <div className="text-xs text-center text-muted-foreground">Golden Yellow</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[#FF9F1C] shadow-sm" />
                      <div className="text-xs text-center text-muted-foreground">Orange</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[#F24333] shadow-sm" />
                      <div className="text-xs text-center text-muted-foreground">Red</div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[#6B8CAE] shadow-sm" />
                      <div className="text-xs text-center text-muted-foreground">Slate Blue</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Settings Cards */}
            <Card className="animate-fade-in-up stagger-2">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Notification settings coming soon...</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up stagger-3">
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Account settings coming soon...</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

SettingsPage.propTypes = {
  onNavigate: PropTypes.func,
  isSidebarCollapsed: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
  currentRole: PropTypes.oneOf(['organizer', 'student', 'sponsor', 'admin']),
};

SettingsPage.defaultProps = {
  currentRole: 'organizer',
};