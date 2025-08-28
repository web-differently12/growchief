"use client";

import * as React from "react";
import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import {
  Slider,
  type SliderProps,
} from "@growchief/frontend/components/ui/slider.tsx";

interface SliderFormProps
  extends Omit<SliderProps, "checked" | "onCheckedChange"> {
  label: string;
  name: string;
  description?: string;
}

const SliderForm = React.forwardRef<HTMLButtonElement, SliderFormProps>(
  ({ className, label, name, description, ...props }, ref) => {
    const form = useFormContext();
    const error = form?.formState?.errors?.[name];
    const value = form.watch(name);

    const handleCheckedChange = React.useCallback(
      (checked: boolean) => {
        form.setValue(name, checked, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      },
      [form, name]
    );

    // Register the field with react-hook-form
    React.useEffect(() => {
      form.register(name);
    }, [form, name]);

    return (
      <div className="space-y-2">
        <div className="flex flex-col gap-2">
          <div className="space-y-1">
            <div className="text-[14px] font-medium text-primary">{label}</div>
            {description && (
              <div className="text-[12px] text-secondary">{description}</div>
            )}
          </div>
          <Slider
            ref={ref}
            checked={!!value}
            onCheckedChange={handleCheckedChange}
            className={clsx(error && "ring-2 ring-rose-500/20", className)}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-[#FD7302] mt-1">
            {error.message as string}
          </p>
        )}
      </div>
    );
  }
);

SliderForm.displayName = "SliderForm";

export { SliderForm, type SliderFormProps };
