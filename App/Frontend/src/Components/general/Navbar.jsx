import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion'; 
import {
  Bell,
  User,
  Menu,
  X,
  Home,
  Calendar,
  LogOut,
  Settings,
  Search,     
  Briefcase,
  LayoutDashboard, 
} from 'lucide-react';
import { logoutSuccess } from '../../store/auth.slice.js';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx'; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx';
import { Badge } from '../ui/badge.jsx';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); 

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Helper to determine dashboard path based on role
  const getDashboardRoute = () => {
    if (!user?.role) return '/';
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'organizer':
        return '/organizer/dashboard';
      case 'sponsor':
        return '/sponsor/admin'; 
      case 'admin':
        return '/admin/control-panel';
      default:
        return '/';
    }
  };

  // Helper to check if we are currently inside "My Space"
  // This checks if the current path starts with the user's role root path
  const isMySpaceActive = () => {
    if (!isAuthenticated) return false;
    
    const path = location.pathname;

    // 1. Check shared "My Space" pages
    if (path.startsWith('/inbox') || 
        path.startsWith('/profile') || 
        path.startsWith('/settings')) {
      return true;
    }

    // 2. Check role-specific dashboard paths
    if (user?.role) {
      return path.startsWith(`/${user.role}`) || 
             (user.role === 'admin' && path.startsWith('/admin'));
    }

    return false;
  };

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/events', label: 'Events', icon: Calendar },
    { path: '/sponsors', label: 'Sponsors', icon: Briefcase }, 
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getInitials = (name) => {
    if (!name) return user?.username?.substring(0, 2).toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const isStudentView = user?.role === 'student';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-blue-100 dark:border-gray-800 ${
        scrolled
          ? 'bg-blue-50/95 backdrop-blur-md shadow-sm dark:bg-slate-900/95'
          : 'bg-blue-50/80 backdrop-blur-md dark:bg-slate-900/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isStudentView
                  ? 'bg-gradient-to-br from-purple-50 via-pink-500 to-orange-500'
                  : 'bg-gradient-to-br from-indigo-600 to-purple-600'
              }`}
            >
              <Calendar className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CEMS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative group"
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      active
                        ? isStudentView
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{link.label}</span>
                    {link.label === 'Inbox' && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 min-w-[20px] px-1 text-xs">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </motion.div>
                </Link>
              );
            })}

            {/* My Space Button */}
            {isAuthenticated && (
              <Link to={getDashboardRoute()}>
                <motion.div
                   whileHover={{ y: -2 }}
                   transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                     isMySpaceActive()
                       ? isStudentView
                         ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                         : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                       : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800/50'
                   }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">My Space</span>
                </motion.div>
              </Link>
            )}
            
            {/* Search Bar */}
            {isAuthenticated && (
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                />
              </form>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hidden md:flex"
                  onClick={() => navigate('/inbox')}
                >
                  <Bell className="w-5 h-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user?.profile?.profilePic} alt={user?.profile?.name} />
                        <AvatarFallback className={
                          isStudentView
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                            : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                        }>
                          {getInitials(user?.profile?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p>{user?.profile?.name || user?.username}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardRoute()} className="cursor-pointer">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        My Space
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}

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

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      active
                        ? isStudentView
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                    {link.label === 'Inbox' && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
              
              {/* Mobile My Space Link */}
              {isAuthenticated && (
                <Link
                  to={getDashboardRoute()}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isMySpaceActive()
                      ? isStudentView
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>My Space</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};