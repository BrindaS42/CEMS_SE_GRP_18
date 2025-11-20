import { motion } from 'motion/react';
import { useRef, useLayoutEffect, useState } from 'react';
import { cn } from './utils';

export function SegmentedControl({ 
  options, 
  value, 
  onChange, 
  variant = 'blue',
  isFullWidth = false, // New prop to control width behavior
  className 
}) {
  const buttonRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // Define bright, role-specific color schemes
  const colors = {
    // Default fallbacks
    blue: {
      active: 'bg-primary shadow-sm',
      activeText: 'text-primary-foreground',
    },
    orange: {
      active: 'bg-secondary shadow-sm',
      activeText: 'text-secondary-foreground',
    },
    // Specific Role Colors (Apple-style brights)
    student: {
      // Purple/Pink Gradient
      active: 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-md',
      activeText: 'text-white',
    },
    organizer: {
      // Blue/Indigo Gradient
      active: 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md',
      activeText: 'text-white',
    },
    sponsor: {
      // Emerald/Teal Gradient
      active: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md',
      activeText: 'text-white',
    },
    admin: {
      // Slate/Zinc Gradient
      active: 'bg-gradient-to-r from-slate-700 to-zinc-800 shadow-md border border-slate-600',
      activeText: 'text-white',
    },
  };

  // Fallback to 'blue' if variant doesn't exist
  const colorScheme = colors[variant] || colors.blue;
  const selectedIndex = options.findIndex(option => option.value === value);

  useLayoutEffect(() => {
    if (selectedIndex !== -1 && buttonRefs.current[selectedIndex]) {
      const button = buttonRefs.current[selectedIndex];
      if (button) {
        setIndicatorStyle({
          left: button.offsetLeft,
          width: button.offsetWidth,
        });
      }
    }
  }, [selectedIndex, value, options, isFullWidth]); 

  return (
    <div 
      className={cn(
        // Layout: Default to inline-flex (compact), switch to flex w-full if isFullWidth is true
        isFullWidth ? "flex w-full" : "inline-flex w-fit",
        "p-1 rounded-xl relative select-none items-center",
        // Background: Darker in dark mode, lighter in light mode
        "bg-muted/50 dark:bg-slate-900/50 border border-border/50",
        className
      )}
    >
      {/* Animated Background Indicator */}
      {selectedIndex !== -1 && (
        <motion.div
          className={cn(
            "absolute rounded-lg h-[calc(100%-8px)] top-1",
            colorScheme.active
          )}
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />
      )}

      {/* Options */}
      {options.map((option, index) => {
        const isActive = option.value === value;
        
        return (
          <button
            key={option.value}
            ref={(el) => (buttonRefs.current[index] = el)}
            onClick={() => onChange(option.value)}
            className={cn(
              // If full width, force equal distribution. If not, use standard padding
              isFullWidth ? "flex-1" : "px-4",
              "relative z-10 py-1.5 rounded-lg transition-colors duration-200",
              "text-sm font-medium cursor-pointer text-center truncate",
              isActive 
                ? colorScheme.activeText 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <motion.span
              className="block truncate"
              initial={false}
              animate={{
                scale: isActive ? 1 : 0.95,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
              }}
            >
              {option.label}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}