import type { FC } from "react";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { useNavigate } from "react-router";

export const BillingModal: FC<{ message: string; close: () => void }> = ({
  message,
  close,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <div>{message}</div>
      <div className="flex gap-[12px] mt-[16px]">
        <Button
          onClick={() => {
            navigate("/billing");
            close();
          }}
        >
          Move to billing
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            close();
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
