import PropTypes from 'prop-types';
import { Button } from '../../Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../Components/ui/avatar';
import { LogOut } from 'lucide-react';

export function Header({ role = 'organizer' }) {
  const handleLogout = () => {
    console.log('Logout clicked');
    // Implement logout logic
  };

  const getRoleTitle = () => {
    switch (role) {
      case 'student':
        return 'Student';
      case 'sponsor':
        return 'Sponsor';
      case 'organizer':
      default:
        return 'Organiser';
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 animate-fade-in">
      {/* Role Title */}
      <div>
        <h1 className="text-foreground">{getRoleTitle()}</h1>
      </div>

      {/* Profile Section */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-foreground">John Doe</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-3 h-3 icon-interact" />
            Logout
          </Button>
        </div>
        <Avatar className="w-10 h-10 ring-2 ring-primary/20 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
          <AvatarFallback className="bg-secondary text-secondary-foreground">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

Header.propTypes = {
  role: PropTypes.oneOf(['organizer', 'student', 'sponsor']),
};

Header.defaultProps = {
  role: 'organizer',
};