import { type FC, useState, useCallback } from "react";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { InputForm } from "@growchief/frontend/components/ui/react-form/input.form.tsx";
import {
  usePlugsRequest,
  type CreatePlugData,
  type UserPlug,
} from "@growchief/frontend/requests/plugs.request.ts";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import { useForm } from "react-hook-form";
import clsx from "clsx";

interface Plug {
  methodName: string;
  priority: number;
  identifier: string;
  description: string;
  title: string;
  randomSelectionChance: number;
  variables: {
    type: "input" | "textarea" | "number" | "boolean" | "select";
    title: string;
    defaultValue: string;
    id: string;
    placeholder: string;
    options?: { label: string; value: string }[];
    regex: {
      source: string;
      flags: string;
    };
  }[];
}

interface PlugModalProps {
  plug: Plug;
  botId: string;
  existingPlug?: UserPlug;
  close: () => void;
  mutate: () => void;
}

interface FormData {
  active: boolean;
  [key: string]: any; // For dynamic fields
}

export const PlugModal: FC<PlugModalProps> = ({
  plug,
  botId,
  existingPlug,
  close,
  mutate,
}) => {
  const plugsRequest = usePlugsRequest();
  const toaster = useToaster();
  const [loading, setLoading] = useState(false);

  // Parse existing data
  const existingData = existingPlug?.data ? JSON.parse(existingPlug.data) : {};

  // Build default values for dynamic fields
  const getDefaultValues = () => {
    const defaults: FormData = {
      active: existingPlug?.active ?? true,
    };

    plug.variables?.forEach((variable) => {
      const existingValue = existingData[variable.id];
      if (existingValue !== undefined) {
        defaults[variable.id] = existingValue;
      } else {
        switch (variable.type) {
          case "boolean":
            defaults[variable.id] = variable.defaultValue === "true";
            break;
          case "number":
            defaults[variable.id] = parseFloat(variable.defaultValue) || 0;
            break;
          default:
            defaults[variable.id] = variable.defaultValue || "";
        }
      }
    });

    return defaults;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: getDefaultValues(),
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        setLoading(true);

        // Extract dynamic field data
        const dynamicData: Record<string, any> = {};
        plug.variables?.forEach((variable) => {
          if (data[variable.id] !== undefined) {
            dynamicData[variable.id] = data[variable.id];
          }
        });

        const plugData: CreatePlugData = {
          identifier: plug.identifier,
          active: data.active,
          data: JSON.stringify(dynamicData),
        };

        if (existingPlug) {
          await plugsRequest.updatePlug(existingPlug.id, {
            active: data.active,
            data: JSON.stringify(dynamicData),
          });
          toaster.show("Plug updated successfully", "success");
        } else {
          await plugsRequest.upsertPlug(botId, plugData);
          toaster.show("Plug created successfully", "success");
        }

        mutate();
        close();
      } catch (error) {
        console.error("Failed to save plug:", error);
        toaster.show("Failed to save plug", "warning");
      } finally {
        setLoading(false);
      }
    },
    [plug.identifier, botId, existingPlug, plugsRequest, toaster, mutate, close]
  );

  return (
    <div className="min-w-[800px]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[16px]">
        {/* Dynamic fields based on plug variables */}
        {plug.variables?.map((variable) => (
          <div key={variable.id}>
            <div>{variable.title}</div>
            {variable.type === "input" && (
              <InputForm
                label=""
                {...register(variable.id, {
                  required: `${variable.title} is required`,
                  pattern: variable.regex
                    ? {
                        value: new RegExp(
                          variable.regex.source,
                          variable.regex.flags
                        ),
                        message: `Invalid format for ${variable.title}`,
                      }
                    : undefined,
                })}
                type="text"
                placeholder={variable.placeholder}
              />
            )}

            {variable.type === "textarea" && (
              <textarea
                {...register(variable.id, {
                  required: `${variable.title} is required`,
                  pattern: variable.regex
                    ? {
                        value: new RegExp(
                          variable.regex.source,
                          variable.regex.flags
                        ),
                        message: `Invalid format for ${variable.title}`,
                      }
                    : undefined,
                })}
                placeholder={variable.placeholder}
                className="w-full min-h-[500px] p-[12px] rounded-[8px] border border-input-border bg-innerBackground text-primary text-[14px] resize-none focus:outline-none focus:border-btn-primary"
                rows={3}
              />
            )}

            {variable.type === "number" && (
              <InputForm
                label={variable.title}
                {...register(variable.id, {
                  required: `${variable.title} is required`,
                  valueAsNumber: true,
                })}
                type="number"
                placeholder={variable.placeholder}
              />
            )}

            {variable.type === "boolean" && (
              <label className="flex items-center gap-[12px] cursor-pointer">
                <input
                  {...register(variable.id)}
                  type="checkbox"
                  className="w-[16px] h-[16px] rounded-[4px] border border-input-border bg-background checked:bg-btn-primary checked:border-btn-primary"
                />
                <span className="text-[14px] text-primary">
                  {variable.placeholder || "Enable"}
                </span>
              </label>
            )}

            {variable.type === "select" && variable.options && (
              <select
                {...register(variable.id, {
                  required: `${variable.title} is required`,
                })}
                className="w-full p-[12px] rounded-[8px] border border-input-border bg-innerBackground text-primary text-[14px] focus:outline-none focus:border-btn-primary"
              >
                <option value="">
                  {variable.placeholder || `Select ${variable.title}`}
                </option>
                {variable.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {errors[variable.id] && (
              <p className="text-[12px] text-red-400 mt-[4px]">
                {errors[variable.id]?.message as string}
              </p>
            )}
          </div>
        ))}

        <div>
          <label className="flex items-center gap-[12px] cursor-pointer">
            <input
              {...register("active")}
              type="checkbox"
              className="w-[16px] h-[16px] rounded-[4px] border border-input-border bg-background checked:bg-btn-primary checked:border-btn-primary"
            />
            <span className="text-[14px] font-[600] text-primary">Active</span>
          </label>
          <p className="text-[12px] text-secondary mt-[4px] ml-[28px]">
            Enable this plug to run automatically
          </p>
        </div>

        <div className="flex items-center gap-[12px] pt-[20px] border-t border-background">
          <Button
            type="submit"
            disabled={loading}
            className={clsx(
              "flex-1",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading
              ? "Saving..."
              : existingPlug
                ? "Update Plug"
                : "Create Plug"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={close}
            disabled={loading}
            className={clsx(loading && "opacity-50 cursor-not-allowed")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
