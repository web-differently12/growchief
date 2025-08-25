"use client";

import * as React from "react";
import clsx from "clsx";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={clsx(
          "flex h-[40px] w-full rounded-[8px] border border-input-border bg-innerBackground px-[12px] py-[8px] text-[14px] text-primary placeholder:text-secondary transition-all focus:outline-none focus:border-btn-primary focus:ring-1 focus:ring-btn-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
