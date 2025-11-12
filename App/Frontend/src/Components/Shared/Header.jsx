import PropTypes from 'prop-types';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../components/ui/utils';

const roleLabels = {
  organizer: 'Organizer',
  student: 'Student',
  sponsor: 'Sponsor',
};

export function Header({ 
  currentRole, 
  availableRoles, 
  onRoleChange,
  userName = 'John Doe',
  userAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (role) => {
    if (role !== currentRole && onRoleChange) {
      onRoleChange(role);
    }
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    // Implement logout logic
  };

  // Get initials from userName
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 animate-fade-in gpu-accelerate">
      {/* Left: Current Role Display */}
      <div>
        <h1 className="text-foreground">{roleLabels[currentRole]}</h1>
      </div>

      {/* Right: Role Switcher + Profile */}
      <div className="flex items-center gap-4">
        {/* Role Switcher Dropdown */}
        {availableRoles.length > 1 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg',
                'bg-muted hover:bg-muted-hover',
                'transition-all duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]',
                'border border-border',
                'micro-interact'
              )}
            >
              <span className="text-sm text-muted-foreground">Current Role:</span>
              <span className="text-sm text-foreground">{roleLabels[currentRole]}</span>
              <ChevronDown 
                className={cn(
                  'w-4 h-4 text-muted-foreground transition-transform duration-200',
                  isDropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className={cn(
                    'absolute right-0 top-full mt-2 w-48',
                    'bg-card border border-border rounded-xl shadow-lg',
                    'overflow-hidden z-50',
                    'gpu-accelerate'
                  )}
                >
                  <div className="py-2">
                    {availableRoles.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleSelect(role)}
                        className={cn(
                          'w-full px-4 py-2.5 text-left',
                          'transition-all duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]',
                          'flex items-center justify-between',
                          role === currentRole
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <span className="text-sm">{roleLabels[role]}</span>
                        {role === currentRole && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-primary"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-foreground">{userName}</span>
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
          <Avatar className="w-10 h-10 ring-2 ring-primary/20 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 cursor-pointer">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

const roleEnum = PropTypes.oneOf(['organizer', 'student', 'sponsor']);

Header.propTypes = {
  currentRole: roleEnum.isRequired,
  availableRoles: PropTypes.arrayOf(roleEnum).isRequired,
  onRoleChange: PropTypes.func,
  userName: PropTypes.string,
  userAvatar: PropTypes.string,
};

Header.defaultProps = {
  userName: 'John Doe',
  userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
};