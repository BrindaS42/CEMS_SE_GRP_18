import { motion } from 'motion/react';
import { useRef, useLayoutEffect, useState } from 'react';
import { cn } from './utils';

export function SegmentedControl({ 
  options, 
  value, 
  onChange, 
  variant = 'blue',
  className 
}) {
  const buttonRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const colors = {
    blue: {
      active: 'var(--primary)',
      activeText: 'text-white dark:text-white',
      inactive: 'var(--muted)',
      inactiveText: 'text-muted-foreground dark:text-muted-foreground',
    },
    orange: {
      active: 'var(--secondary)',
      activeText: 'text-white dark:text-white',
      inactive: 'var(--muted)',
      inactiveText: 'text-muted-foreground dark:text-muted-foreground',
    },
    student: {
      active: 'var(--student-primary)',
      activeText: 'text-white dark:text-white',
      inactive: 'var(--muted)',
      inactiveText: 'text-muted-foreground dark:text-muted-foreground',
    },
    sponsor: {
      active: 'var(--sponsor-primary)',
      activeText: 'text-white dark:text-white',
      inactive: 'var(--muted)',
      inactiveText: 'text-muted-foreground dark:text-muted-foreground',
    },
    admin: {
      active: 'var(--admin-primary)',
      activeText: 'text-white dark:text-white',
      inactive: 'var(--muted)',
      inactiveText: 'text-muted-foreground dark:text-muted-foreground',
    },
    organizer: {
      active: 'var(--organizer-primary)',
      activeText: 'text-white dark:text-white',
      inactive: 'var(--muted)',
      inactiveText: 'text-muted-foreground dark:text-muted-foreground',
    },
  };

  const colorScheme = colors[variant];
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
  }, [selectedIndex, value]);

  return (
    <div 
      className={cn(
        "inline-flex p-1 rounded-full relative",
        className
      )}
      style={{ 
        backgroundColor: colorScheme.inactive,
      }}
    >
      {/* Animated Background Indicator */}
      {selectedIndex !== -1 && (
        <motion.div
          className="absolute rounded-full h-[calc(100%-8px)] top-1"
          style={{ 
            backgroundColor: colorScheme.active,
          }}
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
              "relative z-10 px-6 py-2 rounded-full transition-colors duration-200",
              "whitespace-nowrap cursor-pointer select-none text-center",
              isActive ? colorScheme.activeText : colorScheme.inactiveText
            )}
          >
            <motion.span
              className="block"
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