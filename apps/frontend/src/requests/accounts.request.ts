import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useCallback } from "react";
import useSWR from "swr";
import type { Bot, BotGroup } from "@prisma/client";

export const useAccountsRequest = () => {
  const fetch = useFetch();

  const groupBots = useCallback(async () => {
    return (await fetch("/bots/groups-bots")).json();
  }, []);

  const groups = useCallback(async () => {
    return (await fetch("/bots/groups")).json();
  }, []);

  const bots = useCallback(
    (groupId: string) => async () => {
      return (await fetch(`/bots/groups/${groupId}/bots`)).json();
    },
    [],
  );

  const deleteBot = useCallback(
    async (botId: string) => {
      const res = await fetch(`/bots/${botId}`, { method: "DELETE" });
      return res.json() as Promise<{ ok: true }>;
    },
    [fetch],
  );

  const updateWorkingHours = useCallback(
    async (botId: string, data: { timezone: number; workingHours: string }) => {
      const res = await fetch(`/bots/${botId}/working-hours`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.json() as Promise<{ ok: true }>;
    },
    [fetch],
  );

  const moveBotToGroup = useCallback(
    async (botId: string, groupId: string) => {
      const res = await fetch(`/bots/${botId}/move-group`, {
        method: "PUT",
        body: JSON.stringify({ groupId }),
      });
      return res.json() as Promise<{ ok: true }>;
    },
    [fetch],
  );

  const updateBotStatus = useCallback(
    async (botId: string, status: "ACTIVE" | "PAUSED") => {
      const res = await fetch(`/bots/${botId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      return res.json() as Promise<{ ok: true }>;
    },
    [fetch],
  );

  const assignProxy = useCallback(
    async (botId: string, proxyId: string) => {
      const res = await fetch(`/bots/${botId}/assign-proxy`, {
        method: "PUT",
        body: JSON.stringify({ proxyId }),
      });
      return res.json() as Promise<{ ok: true }>;
    },
    [fetch],
  );

  const removeProxy = useCallback(
    async (botId: string) => {
      const res = await fetch(`/bots/${botId}/remove-proxy`, {
        method: "PUT",
      });
      return res.json() as Promise<{ ok: true }>;
    },
    [fetch],
  );

  const canAddAccount = useCallback(async () => {
    await fetch("/bots/can-add-account");
  }, []);

  return {
    groupAndBots: () =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSWR<Array<BotGroup & { bots: Bot[] }>>(
        "accounts-groups-bots",
        groupBots,
      ),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    groups: () => useSWR<BotGroup[]>("accounts-groups", groups),
    canAddAccount,
    groupsBots: (groupId: string) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSWR<Bot[]>(`accounts-bots-${groupId}`, bots(groupId)),
    deleteBot,
    updateWorkingHours,
    moveBotToGroup,
    updateBotStatus,
    assignProxy,
    removeProxy,
  };
};
