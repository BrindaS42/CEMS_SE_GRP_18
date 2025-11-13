import PropTypes from 'prop-types';
import { User, Mail, Phone, MapPin, Calendar, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Sidebar } from '../Components/Organizers/Sidebar';

const ProfilePage = ({ 
  onNavigate,
  isSidebarCollapsed = true,
  onToggleSidebar,
  currentRole = 'organizer',
}) => {
  // Mock user data - in real app this would come from auth context
  const userProfile = {
    name: 'John Doe',
    email: 'john@college.edu',
    phone: '+1 (555) 123-4567',
    location: 'Campus Building A, Room 204',
    role: currentRole.charAt(0).toUpperCase() + currentRole.slice(1),
    joinedDate: 'January 2024',
    bio: 'Passionate about organizing events and bringing the college community together.',
    profilePic: '',
  };

  return (
    <div className="flex h-screen bg-background pt-16">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={onToggleSidebar}
        activePage="profile"
        onNavigate={onNavigate}
        role={currentRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto smooth-scroll" data-page-content>
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userProfile.profilePic} alt={userProfile.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                      {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl">{userProfile.name}</h1>
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                        {userProfile.role}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{userProfile.bio}</p>
                  </div>
                  
                  <Button className="bg-gradient-to-r from-primary to-accent text-white">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Your personal contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span>{userProfile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span>{userProfile.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span>{userProfile.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span>{userProfile.joinedDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
                <CardDescription>Your recent activity on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-2xl mb-1">12</div>
                    <div className="text-sm text-muted-foreground">Events Created</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-2xl mb-1">48</div>
                    <div className="text-sm text-muted-foreground">Events Attended</div>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="text-2xl mb-1">156</div>
                    <div className="text-sm text-muted-foreground">Hours Volunteered</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back Button */}
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => onNavigate?.('dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

ProfilePage.propTypes = {
  onNavigate: PropTypes.func,
  isSidebarCollapsed: PropTypes.bool,
  onToggleSidebar: PropTypes.func,
  currentRole: PropTypes.oneOf(['organizer', 'student', 'sponsor', 'admin']),
};

ProfilePage.defaultProps = {
  isSidebarCollapsed: true,
  currentRole: 'organizer',
};

export default ProfilePage;