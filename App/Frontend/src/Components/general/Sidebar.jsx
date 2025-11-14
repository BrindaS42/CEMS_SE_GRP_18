import PropTypes from 'prop-types';
import { LayoutDashboard, Settings, Inbox, User, Wrench, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../ui/utils';
import { motion } from 'motion/react';
import { useRef, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export function Sidebar({ isCollapsed, onToggleCollapse, activePage, onNavigate }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const currentRole = user?.role || 'organizer';
  // Get role-specific color
  const getRoleColor = () => {
    switch (currentRole) {
      case 'student':
        return 'var(--student-primary)';
      case 'sponsor':
        return 'var(--sponsor-primary)';
      case 'admin':
        return 'var(--admin-primary)';
      case 'organizer':
        return 'var(--organizer-primary)';
      default:
        return 'var(--primary)';
    }
  };

  // Get icon color based on type
  const getIconColor = (iconType) => {
    switch (iconType) {
      case 'dashboard':
        return '#14b8a6'; // Teal for dashboard
      case 'admin':
        return '#f59e0b'; // Amber for admin panel
      case 'inbox':
        return '#3b82f6'; // Blue for inbox
      case 'profile':
        return '#8b5cf6'; // Purple for profile
      case 'settings':
        return '#64748b'; // Slate for settings
      default:
        return 'currentColor';
    }
  };

  // Get background color for selected state
  const getBackgroundColor = (iconType) => {
    return getIconColor(iconType);
  };

  // Define menu items based on role
  const getMenuItems = () => {
    if (currentRole === 'admin') {
      return [
        { icon: LayoutDashboard, label: 'Control Panel', href: '/admin/control-panel', id: 'control-panel', iconType: 'dashboard' },
        { icon: Inbox, label: 'Inbox', href: '/inbox', id: 'inbox', iconType: 'inbox' },
        { icon: User, label: 'Profile', href: '/profile', id: 'profile', iconType: 'profile' },
        { icon: Settings, label: 'Settings', href: '/settings', id: 'settings', iconType: 'settings' },
      ];
    }

    if (currentRole === 'student') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/student/dashboard', id: 'dashboard', iconType: 'dashboard' },
        { icon: Users, label: 'Admin Panel', href: '/student/admin', id: 'admin', iconType: 'admin' },
        { icon: Inbox, label: 'Inbox', href: '/inbox', id: 'inbox', iconType: 'inbox' },
        { icon: User, label: 'Profile', href: '/profile', id: 'profile', iconType: 'profile' },
        { icon: Settings, label: 'Settings', href: '/settings', id: 'settings', iconType: 'settings' },
      ];
    }

    if (currentRole === 'sponsor') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/sponsor/dashboard', id: 'dashboard', iconType: 'dashboard' },
        { icon: Wrench, label: 'Admin Panel', href: '/sponsor/admin', id: 'admin', iconType: 'admin' },
        { icon: Inbox, label: 'Inbox', href: '/inbox', id: 'inbox', iconType: 'inbox' },
        { icon: User, label: 'Profile', href: '/profile', id: 'profile', iconType: 'profile' },
        { icon: Settings, label: 'Settings', href: '/settings', id: 'settings', iconType: 'settings' },
      ];
    }

    // Default to organizer menu items
    return [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/organizer/dashboard', id: 'dashboard', iconType: 'dashboard' },
      { icon: Wrench, label: 'Admin Panel', href: '/organizer/admin', id: 'admin', iconType: 'admin' },
      { icon: Inbox, label: 'Inbox', href: '/inbox', id: 'inbox', iconType: 'inbox' },
      { icon: User, label: 'Profile', href: '/profile', id: 'profile', iconType: 'profile' },
      { icon: Settings, label: 'Settings', href: '/settings', id: 'settings', iconType: 'settings' },
    ];
  };

  const menuItems = getMenuItems();

  const buttonRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState(null);

  const activeIndex = menuItems.findIndex(item => item.id === activePage);

  useLayoutEffect(() => {
    if (activeIndex !== -1 && buttonRefs.current[activeIndex]) {
      const button = buttonRefs.current[activeIndex];
      if (button) {
        // Get the parent nav element to calculate relative position
        const nav = button.closest('nav');
        const navRect = nav?.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        
        if (navRect) {
          setIndicatorStyle({
            top: buttonRect.top - navRect.top,
            height: button.offsetHeight,
          });
        }
      }
    }
  }, [activeIndex, activePage, isCollapsed]);

  const handleNavigation = (e, pageId) => {
    // Prevent any event bubbling
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

    // Find the menu item to know the target href
    const menuItem = menuItems.find(item => item.id === pageId);

    // Call the optional onNavigate callback (do not short-circuit navigation)
    if (onNavigate) {
      try {
        onNavigate(pageId);
      } catch (err) {
        // swallow callback errors to avoid breaking navigation
        // eslint-disable-next-line no-console
        console.error('onNavigate callback error:', err);
      }
    }

    // Always perform router navigation when an href is available
    if (menuItem && menuItem.href) {
      navigate(menuItem.href);
    }
  };

  return (
    <aside
      className={cn(
        'bg-sidebar border-r border-sidebar-border flex flex-col relative gpu-accelerate overflow-hidden',
        'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Menu Items */}
      <nav className="flex-1 py-6 relative">
        {/* Animated Background Indicator */}
        {activeIndex !== -1 && indicatorStyle && (() => {
          const activeItem = menuItems[activeIndex];
          return (
            <motion.div
              className="absolute left-3 right-3 rounded-lg z-0"
              style={{ 
                backgroundColor: getBackgroundColor(activeItem.iconType),
              }}
              initial={false}
              animate={{
                top: indicatorStyle.top,
                height: indicatorStyle.height,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
            />
          );
        })()}

        <div className="space-y-1 px-3 relative z-10">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <button
                key={item.id}
                ref={(el) => (buttonRefs.current[index] = el)}
                onClick={(e) => handleNavigation(e, item.id)}
                type="button"
                className={cn(
                  'w-full h-10 flex items-center rounded-lg overflow-hidden',
                  'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  'relative z-10',
                  isActive
                    ? 'text-white'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                {/* Fixed width icon container - always centered */}
                <div className="w-14 h-10 flex items-center justify-center flex-shrink-0">
                  <Icon 
                    className={cn(
                      'w-5 h-5',
                      'transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                      isActive && 'scale-110'
                    )}
                    style={{ 
                      stroke: isActive ? 'currentColor' : getIconColor(item.iconType),
                      fill: 'none'
                    }}
                  />
                </div>
                {/* Text label that fades out */}
                {!isCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden pr-3">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          type="button"
          className={cn(
            'w-full h-10 flex items-center gap-3 px-3 rounded-lg',
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            'transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
            'micro-interact',
            isCollapsed ? 'justify-center' : 'justify-start'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <motion.span
                initial={false}
                animate={{
                  opacity: isCollapsed ? 0 : 1,
                  width: isCollapsed ? 0 : 'auto',
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="whitespace-nowrap overflow-hidden"
              >
                Collapse
              </motion.span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

Sidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  activePage: PropTypes.string,
  onNavigate: PropTypes.func,
};

Sidebar.defaultProps = {
  activePage: 'dashboard',
  onNavigate: () => {},
};
