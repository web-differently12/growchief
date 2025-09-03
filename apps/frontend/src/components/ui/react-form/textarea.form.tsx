"use client";

import clsx from "clsx";
import { useFormContext } from "react-hook-form";
import { type FC, type ComponentProps, useMemo, useRef } from "react";
import { Button } from "@growchief/frontend/components/ui/button.tsx";

const TextareaForm: FC<ComponentProps<"textarea"> & { label: string }> = ({
  className,
  label,
  name,
  ...props
}) => {
  const form = useFormContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const content = form.watch(name as string);
  const error = form?.formState?.errors?.[name!];
  const colorVariables = useMemo(() => {
    return (content || "").replace(/{{\s+?[A-Za-z]+?\s+?}}/g, (match: any) => {
      return `<span class="highlight">${match}</span>`;
    });
  }, [content]);

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const currentValue = form.getValues(name as string) || "";
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    const variableText = `{{ ${variable} }}`;
    const newValue =
      currentValue.slice(0, selectionStart) +
      variableText +
      currentValue.slice(selectionEnd);

    // Update form value and trigger validation
    form.setValue(name as string, newValue, {
      shouldValidate: true,
      shouldDirty: true,
    });

    // Focus the textarea and set cursor position after the inserted variable
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPosition = selectionStart + variableText.length;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };

  return (
    <div>
      <div className="text-[14px] mb-2">{label}</div>

      {/* Quick Variables Section */}
      <div className="w-full">
        <div className="flex gap-[1px] rounded-tr-[8px] rounded-tl-[8px] overflow-hidden">
          <Button
            type="button"
            size="sm"
            onClick={() => insertVariable("firstName")}
            className="rounded-none flex-1"
          >
            First Name
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => insertVariable("lastName")}
            className="rounded-none flex-1"
          >
            Last Name
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          dangerouslySetInnerHTML={{ __html: colorVariables }}
          className="behind absolute break-words top-0 left-0 h-full w-full pointer-events-none whitespace-pre-wrap z-[1] bg-innerBackground text-[14px] px-[12px] py-[8px] border border-transparent"
        />
        <div
          dangerouslySetInnerHTML={{ __html: colorVariables }}
          className="above absolute break-words top-0 left-0 h-full w-full pointer-events-none whitespace-pre-wrap z-[3] text-[14px] px-[12px] py-[8px] border border-transparent"
        />
        <textarea
          {...props}
          ref={(e) => {
            textareaRef.current = e;
            form.register(name as string).ref(e);
          }}
          className={clsx(
            "flex min-h-[200px] w-full rounded-br-[8px] rounded-bl-[8px] border border-input-border relative z-[2] px-[12px] py-[8px] text-[14px] text-primary placeholder:text-secondary transition-all focus:outline-none focus:border-btn-primary focus:ring-1 focus:ring-btn-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
            error &&
              "!border-rose-500 focus:!border-rose-500 focus:!ring-rose-500/20",
            className,
          )}
          name={name}
          onChange={form.register(name as string).onChange}
          onBlur={form.register(name as string).onBlur}
        />
      </div>

      {error && (
        <p className="text-sm text-rose-500 mt-1">{error.message as string}</p>
      )}
    </div>
  );
};
TextareaForm.displayName = "TextareaForm";

export { TextareaForm };
