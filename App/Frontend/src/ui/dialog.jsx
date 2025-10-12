import React from 'react';

export function Dialog({ onOpenChange, open, ...rest }) {
  // swallow custom props, render container
  return <div {...rest} />;
}
export function DialogTrigger({ asChild, children, ...rest }) {
  if (asChild && React.isValidElement(children)) {
    return children;
  }
  return <button {...rest}>{children}</button>;
}
export function DialogContent({ onOpenChange, open, ...rest }) { return <div {...rest} />; }
export function DialogHeader(props) { return <div {...props} />; }
export function DialogTitle(props) { return <h3 {...props} />; }
export function DialogDescription(props) { return <p {...props} />; }
