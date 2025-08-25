import type { FC } from "react";
import { LeadsComponent } from "@growchief/frontend/components/leads/leads.component.tsx";

export const LeadsPage: FC = () => {
  return (
    <div className="flex-1 bg-innerBackground rounded-b-[8px]">
      <LeadsComponent />
    </div>
  );
};
