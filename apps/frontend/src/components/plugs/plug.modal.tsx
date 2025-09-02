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

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      active: existingPlug?.active ?? true,
    },
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        setLoading(true);

        const plugData: CreatePlugData = {
          identifier: plug.identifier,
          active: data.active,
        };

        if (existingPlug) {
          await plugsRequest.updatePlug(existingPlug.id, {
            active: data.active,
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
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-[16px]">
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
