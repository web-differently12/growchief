import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import useSWR from "swr";

export interface CreatePlugData {
  identifier: string;
  active: boolean;
  data?: string;
}

export interface UpdatePlugData {
  active?: boolean;
  data?: string;
}

export interface UserPlug {
  id: string;
  identifier: string;
  active: boolean;
  data: string;
  createdAt: string;
  updatedAt: string;
}

export const usePlugsRequest = () => {
  const fetch = useFetch();

  return {
    // Get plugs for a specific bot
    getBotPlugs: (botId: string) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useSWR<UserPlug[]>(
        botId ? `/plugs/bot/${botId}` : null,
        async () => {
          return (await fetch(`/plugs/bot/${botId}`)).json();
        },
      );
    },

    // Create a new plug
    createPlug: async (botId: string, data: CreatePlugData) => {
      const response = await fetch(`/plugs/bot/${botId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    // Update an existing plug
    updatePlug: async (plugId: string, data: UpdatePlugData) => {
      const response = await fetch(`/plugs/${plugId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    // Delete a plug
    deletePlug: async (plugId: string) => {
      const response = await fetch(`/plugs/${plugId}`, {
        method: "DELETE",
      });
      return response.json();
    },

    // Upsert a plug (create or update)
    upsertPlug: async (botId: string, data: CreatePlugData) => {
      const response = await fetch(`/plugs/bot/${botId}/upsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    // Check if plug exists for bot and identifier
    getPlugByBotAndIdentifier: async (botId: string, identifier: string) => {
      const response = await fetch(`/plugs/check/${botId}/${identifier}`);
      return response.json();
    },
  };
};
