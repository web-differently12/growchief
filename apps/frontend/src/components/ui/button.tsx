"use client";

import clsx from "clsx";
import * as React from "react";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "default" | "destructive" | "ghost" | "secondary";
    size?: "default" | "sm" | "lg";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={clsx(
        "rounded-[8px] text-[14px] font-[600] whitespace-nowrap flex items-center justify-center px-[18px] text-center transition-all",
        variant === "default" &&
          "bg-btn-primary hover:bg-btn-primary/90 text-white py-[10px]",
        variant === "outline" &&
          "border border-secondary bg-transparent hover:bg-innerBackground text-secondary py-[10px]",
        variant === "secondary" &&
          "bg-innerBackground text-primary border border-[#1F1F1F] py-[10px]",
        variant === "destructive" &&
          "bg-red-600 hover:bg-red-700 text-white py-[10px]",
        variant === "ghost" &&
          "bg-transparent hover:bg-innerBackground text-secondary hover:text-primary py-[10px]",
        size === "sm" && "h-[30px] py-[6px] px-[12px] text-[12px]",
        size === "lg" && "h-[52px] px-[20px] py-[12px]",
        props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
