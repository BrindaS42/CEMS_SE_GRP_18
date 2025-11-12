import { LayoutDashboard, Inbox, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../components/ui/utils';
import { motion } from 'motion/react';
import { useRef, useLayoutEffect, useState } from 'react';
import PropTypes from 'prop-types'; // --- FIX 1: Imported PropTypes ---

export function AdminSidebar({ isCollapsed, onToggleCollapse, activePage = 'control-panel', onNavigate }) {
  // Get icon color based on type
  const getIconColor = (iconType) => {
    switch (iconType) {
      case 'control-panel':
        return '#14b8a6'; // Teal for control panel (will show gradient when not active)
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

  // Get background color/gradient for selected state
  const getBackgroundStyle = (iconType) => {
    if (iconType === 'control-panel') {
      return {
        background: 'linear-gradient(135deg, #14b8a6 0%, #f59e0b 100%)',
      };
    }
    return {
      backgroundColor: getIconColor(iconType),
    };
  };

  // --- FIX 2: Extracted logic from nested ternary ---
  const getIconStroke = (item, isActive) => {
    if (isActive) {
      return 'currentColor';
    }
    if (item.iconType === 'control-panel') {
      return '#14b8a6';
    }
    // Fallback to the original getIconColor function
    return getIconColor(item.iconType);
  };
  // --- End Fix 2 ---

  const menuItems = [
    { icon: LayoutDashboard, label: 'Control Panel', href: '/admin/control-panel', id: 'control-panel', iconType: 'control-panel' },
    { icon: Inbox, label: 'Inbox', href: '/inbox', id: 'inbox', iconType: 'inbox' },
    { icon: User, label: 'Profile', href: '/profile', id: 'profile', iconType: 'profile' },
    { icon: Settings, label: 'Settings', href: '/settings', id: 'settings', iconType: 'settings' },
  ];

  const buttonRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState(null);

  // Normalize activePage: 'dashboard' should map to 'control-panel' for admin
  const normalizedActivePage = activePage === 'dashboard' ? 'control-panel' : activePage;
  const activeIndex = menuItems.findIndex(item => item.id === normalizedActivePage);

  useLayoutEffect(() => {
    if (activeIndex !== -1 && buttonRefs.current[activeIndex]) {
      const button = buttonRefs.current[activeIndex];
      if (button) {
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
    e.stopPropagation();
    if (onNavigate) {
      onNavigate(pageId);
    }
  };

  return (
    <aside
      className={cn(
        'bg-sidebar border-r border-sidebar-border flex flex-col relative gpu-accelerate',
        'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* SVG Definitions for Gradient */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="control-panel-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Menu Items */}
      <nav className="flex-1 py-6 relative">
        {/* Animated Background Indicator */}
        {activeIndex !== -1 && indicatorStyle && (() => {
          const activeItem = menuItems[activeIndex];
          return (
            <motion.div
              className="absolute left-3 right-3 rounded-lg z-0"
              style={getBackgroundStyle(activeItem.iconType)}
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
            const isActive = normalizedActivePage === item.id;
            
            return (
              <button
                key={item.id} // This is already correctly using item.id (not index)
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
                  {item.iconType === 'control-panel' && !isActive ? (
                    // Gradient icon for control panel using two overlaid icons
                    <div className="relative w-5 h-5">
                      <Icon 
                        className="w-5 h-5 absolute inset-0"
                        style={{ 
                          stroke: '#14b8a6',
                          fill: 'none',
                          opacity: 0.6
                        }}
                      />
                      <Icon 
                        className="w-5 h-5 absolute inset-0"
                        style={{ 
                          stroke: '#f59e0b',
                          fill: 'none',
                          opacity: 0.6,
                          mixBlendMode: 'screen'
                        }}
                      />
                    </div>
                  ) : (
                    <Icon 
                      className={cn(
                        'w-5 h-5',
                        'transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        isActive && 'scale-110'
                      )}
                      style={{ 
                        // --- FIX 2: Using the helper function ---
                        stroke: getIconStroke(item, isActive),
                        fill: 'none'
                      }}
                    />
                  )}
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
              <span className="whitespace-nowrap overflow-hidden">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

// --- FIX 1: Added PropTypes validation ---
AdminSidebar.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  activePage: PropTypes.string,
  onNavigate: PropTypes.func
};