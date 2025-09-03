import type { Bot, BotGroup } from "@prisma/client";
import { createContext, type FC, type ReactNode, useContext } from "react";
import {
  type Tools,
  useTools,
} from "@growchief/frontend/requests/workflows.request.ts";
import { useGroupsAndBots } from "@growchief/frontend/requests/accounts.request.ts";

export const PlatformsGroupsAndOptions = createContext<{
  groups: Array<BotGroup & { bots: Bot[] }>;
  tools: Tools[];
}>({} as any);

export const PlatformsGroupsAndOptionsWrapper: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isLoading: loading1, data: accountsData } = useGroupsAndBots();
  const { isLoading: loading2, data: toolsData } = useTools();

  if (loading1 || loading2) {
    return (
      <div className="flex-1 relative bg-innerBackground rounded-b-[8px]" />
    );
  }

  return (
    <PlatformsGroupsAndOptions.Provider
      value={{
        groups: accountsData!,
        tools: toolsData! || [],
      }}
    >
      {children}
    </PlatformsGroupsAndOptions.Provider>
  );
};

export const usePlatformsGroupsAndOptions = () =>
  useContext(PlatformsGroupsAndOptions);
