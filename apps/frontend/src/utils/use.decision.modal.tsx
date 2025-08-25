import { useModals } from "@growchief/frontend/utils/store.ts";
import { type FC, useCallback } from "react";
import { Button } from "@growchief/frontend/components/ui/button.tsx";

export const DecisionModal: FC<{
  description: string;
  approveLabel: string;
  cancelLabel: string;
  close: () => void;
  resolution: (value: boolean) => void;
}> = ({ description, cancelLabel, approveLabel, resolution, close }) => {
  return (
    <div className="flex flex-col">
      <div>{description}</div>
      <div className="flex gap-[12px] mt-[16px]">
        <Button
          onClick={() => {
            resolution(true);
            close();
          }}
        >
          {approveLabel}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            resolution(false);
            close();
          }}
        >
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
};

export const useDecisionModal = () => {
  const modals = useModals();
  const open = useCallback(
    ({
      label = "Are you sure?",
      description = "Are you sure you want to close this modal?" as any,
      approveLabel = "Yes",
      cancelLabel = "No",
    } = {}) => {
      return new Promise<boolean>((res) => {
        modals.show({
          label,
          askClose: false,
          beforeClose: () => res(false),
          component: (close) => (
            <DecisionModal
              close={close}
              resolution={(value) => res(value)}
              description={description}
              approveLabel={approveLabel}
              cancelLabel={cancelLabel}
            />
          ),
        });
      });
    },
    [modals],
  );

  return { open };
};
