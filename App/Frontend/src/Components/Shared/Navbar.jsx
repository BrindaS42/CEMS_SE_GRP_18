import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  User, 
  Menu, 
  X, 
  Home, 
  Calendar, 
  MessageSquare, 
  LayoutDashboard,
  LogOut,
  Settings,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';
import { messageService } from '../../utils/messageService';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';

export const Navbar = ({ 
  activePage = 'dashboard', 
  onNavigate,
  userName,
  currentRole,
  availableRoles = [],
  onRoleChange,
}) => {
  const { user, logout, isAuthenticated } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
    }
  }, [isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const response = await messageService.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const navLinks = [
    { path: 'home', label: 'Home', icon: Home },
    { path: 'events', label: 'Events', icon: Calendar },
    ...(isAuthenticated ? [
      { path: 'dashboard', label: 'User', icon: UserCircle },
    ] : []),
  ];

  const isActive = (path) => {
    // For the "User" button (dashboard), consider it active when on any dashboard-related page
    if (path === 'dashboard') {
      return ['dashboard', 'admin', 'inbox', 'profile', 'settings', 'control-panel'].includes(activePage);
    }
    return activePage === path;
  };

  const getInitials = (name) => {
    if (!name) return user?.username?.substring(0, 2).toUpperCase() || 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isStudentView = user?.role === 'student';

  const handleNavClick = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-card shadow-sm dark:bg-card border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')} 
            className="flex items-center gap-3 group"
            type="button"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent"
            >
              <Calendar className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CEMS
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <button 
                  key={link.path} 
                  onClick={() => handleNavClick(link.path)} 
                  className="relative group"
                  type="button"
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      active
                        ? 'bg-gradient-to-r from-primary to-accent text-white'
                        : 'text-foreground hover:bg-muted dark:hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{link.label}</span>
                    {link.label === 'Inbox' && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 min-w-[20px] px-1 text-xs">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </motion.div>
                </button>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hidden md:flex"
                  onClick={() => handleNavClick('inbox')}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-white text-xs flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user?.profile?.profilePic} alt={user?.profile?.name} />
                        <AvatarFallback
                          className={
                            isStudentView
                              ? 'bg-gradient-to-br from-secondary to-accent text-white'
                              : 'bg-gradient-to-br from-primary to-accent text-white'
                          }
                        >
                          {getInitials(user?.profile?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm">Name: {userName || user?.profile?.name || user?.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    
                    {/* Role Selector */}
                    {availableRoles.length > 0 && onRoleChange && currentRole && (
                      <>
                        <div className="px-2 py-2">
                          <span className="text-xs text-muted-foreground mb-1 block">Role:</span>
                          <Select value={currentRole} onValueChange={onRoleChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    <DropdownMenuItem onClick={() => handleNavClick('profile')} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavClick('settings')} className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => handleNavClick('login')}>
                  Login
                </Button>
                <Button onClick={() => handleNavClick('register')} className="bg-gradient-to-r from-primary to-accent text-white">
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-t border-border"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    type="button"
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-gradient-to-r from-primary to-accent text-white'
                        : 'text-foreground hover:bg-muted dark:hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                    {link.label === 'Inbox' && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {unreadCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

Navbar.propTypes = {
  activePage: PropTypes.string,
  onNavigate: PropTypes.func,
  userName: PropTypes.string,
  currentRole: PropTypes.string,
  availableRoles: PropTypes.arrayOf(PropTypes.string),
  onRoleChange: PropTypes.func,
};

Navbar.defaultProps = {
  activePage: 'dashboard',
  availableRoles: [],
};