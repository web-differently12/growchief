import type { FC } from "react";
import { ProxiesComponent } from "@growchief/frontend/components/proxies/proxies.component.tsx";

export const ProxiesPage: FC = () => {
  return (
    <div className="flex-1 bg-innerBackground rounded-b-[8px]">
      <ProxiesComponent />
    </div>
  );
};
