import React from 'react';

export function Button({ variant = 'default', size = 'md', asChild, className, children, ...rest }) {
  if (asChild && React.isValidElement(children)) {
    return children;
  }
  const classes = [
    'btn',
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : 'btn-md',
    variant === 'outline' ? 'btn-outline' : variant === 'ghost' ? 'btn-ghost' : '',
    className || ''
  ].filter(Boolean).join(' ');
  return <button className={classes} {...rest}>{children}</button>;
}
