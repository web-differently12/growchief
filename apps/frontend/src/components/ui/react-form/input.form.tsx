"use client";

import * as React from "react";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";

const InputForm = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { label: string }
>(({ className, label, type, name, ...props }, ref) => {
  const form = useFormContext();
  const error = name && form?.formState?.errors?.[name];

  return (
    <>
      <div className="text-[14px]">{label}</div>
      <input
        type={type}
        className={clsx(
          "flex h-[40px] w-full rounded-[8px] border border-input-border bg-innerBackground px-[12px] py-[8px] text-[14px] text-primary placeholder:text-secondary transition-all focus:outline-none focus:border-btn-primary focus:ring-1 focus:ring-btn-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
          error &&
            "!border-rose-500 focus:!border-rose-500 focus:!ring-rose-500/20",
          className
        )}
        name={name}
        ref={ref}
        {...props}
      />
      {error && <p className="text-sm text-[#FD7302] mt-1">{error.message as string}</p>}
    </>
  );
});
InputForm.displayName = "InputForm";

export { InputForm };
