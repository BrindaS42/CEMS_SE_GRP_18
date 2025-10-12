import React from 'react';

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function Textarea({ className, ...rest }) {
  return <textarea className={cx(className)} {...rest} />;
}
