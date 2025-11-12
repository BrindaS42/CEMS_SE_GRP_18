// skeleton.jsx

import React from 'react';
import PropTypes from "prop-types";
import { cn } from "./utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

Skeleton.propTypes = {
  className: PropTypes.string,
};

export { Skeleton };