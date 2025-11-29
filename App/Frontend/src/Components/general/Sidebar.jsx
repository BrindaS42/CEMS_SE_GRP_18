import PropTypes from 'prop-types';
import { LayoutDashboard, Settings, Inbox, User, Wrench, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../ui/utils';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function Sidebar({ isCollapsed, onToggleCollapse, onNavigate, role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const currentRole = role || user?.role || 'organizer';

  // Define menu items based on role
  const getMenuItems = () => {
    const commonItems = [
      { icon: Inbox, label: 'Inbox', href: '/inbox', id: 'inbox' },
      { icon: User, label: 'Profile', href: '/profile', id: 'profile' },
      { icon: Settings, label: 'Settings', href: '/settings', id: 'settings' },
    ];

    let roleSpecificItems = [];

    switch (currentRole) {
      case 'admin':
        roleSpecificItems = [
          { icon: LayoutDashboard, label: 'Control Panel', href: '/admin/control-panel', id: 'control-panel' },
        ];
        break;
      case 'student':
        roleSpecificItems = [
          { icon: LayoutDashboard, label: 'Dashboard', href: '/student/dashboard', id: 'dashboard' },
          { icon: Users, label: 'Admin Panel', href: '/student/admin', id: 'admin' },
        ];
        break;
      case 'sponsor':
        roleSpecificItems = [
          { icon: Wrench, label: 'Admin Panel', href: '/sponsor/admin', id: 'admin' },
        ];
        break;
      case 'organizer':
      default:
        roleSpecificItems = [
          { icon: LayoutDashboard, label: 'Dashboard', href: '/organizer/dashboard', id: 'dashboard' },
          { icon: Wrench, label: 'Admin Panel', href: '/organizer/admin', id: 'admin' },
        ];
        break;
    }

    return [...roleSpecificItems, ...commonItems];
  };

  const menuItems = getMenuItems();

  // Determine active page based on current path
  const getActivePageId = () => {
    const path = location.pathname;
    
    // Exact matches first
    const exactMatch = menuItems.find(item => item.href === path);
    if (exactMatch) return exactMatch.id;

    // Prefix matches for sub-pages (e.g. /profile/123 -> profile)
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/inbox')) return 'inbox';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/student/dashboard')) return 'dashboard';
    if (path.startsWith('/student/admin')) return 'admin';
    if (path.startsWith('/organizer/dashboard')) return 'dashboard';
    if (path.startsWith('/organizer/admin')) return 'admin';
    if (path.startsWith('/sponsor/admin')) return 'admin';
    if (path.startsWith('/admin/control-panel')) return 'control-panel';

    return '';
  };

  const activePageId = getActivePageId();

  const handleNavigation = (e, item) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

    if (onNavigate) {
      try {
        onNavigate(item.id);
      } catch (err) {
        console.error('onNavigate callback error:', err);
      }
    }

    if (item.href) {
      navigate(item.href);
    }
  };

  // Animation Variants
  const sidebarVariants = {
    expanded: { width: "16rem", transition: { type: "spring", stiffness: 300, damping: 30 } },
    collapsed: { width: "5rem", transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const labelVariants = {
    expanded: { opacity: 1, x: 0, display: "block", transition: { duration: 0.3, delay: 0.1 } },
    collapsed: { opacity: 0, x: -10, transitionEnd: { display: "none" }, transition: { duration: 0.2 } }
  };

  return (
    <motion.aside
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      className={cn(
        'bg-blue-50 dark:bg-slate-900 border-r border-blue-100 dark:border-gray-800 flex flex-col relative z-40 overflow-hidden',
        'h-full flex-shrink-0'
      )}
    >
      {/* Menu Items */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePageId === item.id;
          
          return (
            <button
              key={item.id}
              onClick={(e) => handleNavigation(e, item)}
              className={cn(
                'w-full h-10 flex items-center rounded-lg overflow-hidden group relative',
                'transition-colors duration-200',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-blue-100/50 dark:hover:bg-gray-800/50'
              )}
            >
              {/* Active State Background (White Highlight) */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 bg-white dark:bg-gray-800 shadow-sm border border-blue-100 dark:border-gray-700 rounded-lg z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Active Indicator Bar (Blue Pill) */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-blue-500 rounded-r-full z-20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon Container */}
              <div className="w-[calc(5rem-1.5rem)] flex items-center justify-center flex-shrink-0 h-full relative z-10">
                <Icon 
                  className={cn(
                    'w-5 h-5 transition-transform duration-300',
                    isActive && 'scale-110',
                    !isActive && 'group-hover:scale-105'
                  )}
                />
              </div>
              
              {/* Text Label */}
              <motion.span
                variants={labelVariants}
                className="whitespace-nowrap font-medium relative z-10"
              >
                {item.label}
              </motion.span>
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-blue-100 dark:border-gray-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className={cn(
            'w-full h-10 flex items-center rounded-lg transition-all duration-200',
            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
            'hover:bg-blue-100/50 dark:hover:bg-gray-800/50'
          )}
        >
          <div className="w-[calc(5rem-1.5rem)] flex items-center justify-center flex-shrink-0">
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </div>
          <motion.span
            variants={labelVariants}
            className="whitespace-nowrap text-sm font-medium"
          >
            Collapse
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
}

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  onNavigate: PropTypes.func,
  role: PropTypes.string,
};

Sidebar.defaultProps = {
  onNavigate: () => {},
  role: 'organizer',
};