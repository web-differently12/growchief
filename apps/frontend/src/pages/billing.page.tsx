import type { FC } from "react";
import { BillingComponent } from "@growchief/frontend/components/billing/billing.component.tsx";

export const BillingPage: FC = () => {
  return (
    <div className="flex flex-1 bg-innerBackground rounded-b-[8px] p-[20px]">
      <BillingComponent />
    </div>
  );
};
