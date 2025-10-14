// separator.jsx

"use client";

import * as React from "react";
import PropTypes from "prop-types";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "./utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  );
}

Separator.propTypes = {
  className: PropTypes.string,
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
  decorative: PropTypes.bool,
};

export { Separator };