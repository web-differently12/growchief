import type { FC } from "react";
import { AnalyticsComponent } from "@growchief/frontend/components/analytics/analytics.component.tsx";

export const AnalyticsPage: FC = () => {
  return (
    <div className="flex-1 bg-innerBackground rounded-b-[8px]">
      <AnalyticsComponent />
    </div>
  );
};
