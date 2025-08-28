"use client";

import * as React from "react";
import clsx from "clsx";

interface SliderProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
  id?: string;
  name?: string;
}

const Slider = React.forwardRef<HTMLButtonElement, SliderProps>(
  (
    {
      checked = false,
      onCheckedChange,
      disabled = false,
      size = "default",
      className,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const handleToggle = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        handleToggle();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        id={id}
        name={name}
        className={clsx(
          "relative inline-flex items-center rounded-full border transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-btn-primary/20 focus:ring-offset-1",
          // Size variants
          size === "sm" && "h-[20px] w-[36px]",
          size === "default" && "h-[24px] w-[44px]",
          size === "lg" && "h-[28px] w-[52px]",
          // State variants
          checked
            ? "bg-btn-primary border-btn-primary"
            : "bg-innerBackground border-input-border",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-btn-primary/50",
          className
        )}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        {...props}
      >
        {/* Slider thumb */}
        <span
          className={clsx(
            "inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
            // Size variants for thumb
            size === "sm" && "h-[16px] w-[16px]",
            size === "default" && "h-[20px] w-[20px]",
            size === "lg" && "h-[24px] w-[24px]",
            // Position based on checked state
            checked
              ? size === "sm"
                ? "translate-x-[18px]"
                : size === "default"
                  ? "translate-x-[22px]"
                  : "translate-x-[26px]"
              : "translate-x-[2px]"
          )}
        />
      </button>
    );
  }
);

Slider.displayName = "Slider";

export { Slider, type SliderProps };
