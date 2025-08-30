import { useCallback, useState } from "react";
import useSWR from "swr";
import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import type { WorkflowNodes, Workflows } from "@prisma/client";
import type { ToolParams } from "@growchief/shared-both/utils/tool.decorator.ts";
import { makeId } from "@growchief/shared-both/utils/make.id.ts";

export interface Tools {
  name: string;
  identifier: string;
  tools: ToolParams[];
}

/**
 * Data hooks
 * Use these directly in components, at the top level (never conditionally).
 */

export const useTools = () => {
  const fetch = useFetch();

  const fetcher = useCallback(async () => {
    return (await fetch("/bots/tools")).json() as Promise<Tools[]>;
  }, [fetch]);

  return useSWR<Tools[]>("tools", fetcher, {
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
  });
};

export const useWorkflows = () => {
  const fetch = useFetch();

  const fetcher = useCallback(async () => {
    return (await fetch("/workflows")).json() as Promise<Workflows[]>;
  }, [fetch]);

  return useSWR<Workflows[]>("workflows", fetcher);
};

export const useWorkflowById = (id: string | undefined) => {
  const fetch = useFetch();
  const [state] = useState(makeId(10));
  const fetcher = useCallback(
    (newId: string) => async () => {
      if (!newId) return null;
      return (await fetch(`/workflows/${newId}`)).json() as Promise<
        (Workflows & { nodes: WorkflowNodes[] }) | null
      >;
    },
    [],
  );

  // Key is null/undefined -> SWR disabled until id exists
  const key = id ? `workflows/${state}` : null;

  const fetching = fetcher(id!);
  return useSWR<(Workflows & { nodes: WorkflowNodes[] }) | null>(
    key,
    fetching,
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: true,
      dedupingInterval: 0,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    },
  );
};

/**
 * Mutation bundle
 * Safe to return plain functions; no hooks are called inside these functions.
 */
export const useWorkflowsRequest = () => {
  const fetch = useFetch();

  const updateWorkflow = useCallback(
    async (id: string, body: unknown) => {
      const res = await fetch(`/workflows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return res.json() as Promise<Workflows>;
    },
    [fetch],
  );

  const createWorkflow = useCallback(
    async (name: string) => {
      const res = await fetch("/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return res.json() as Promise<Workflows>;
    },
    [fetch],
  );

  const deleteWorkflow = useCallback(
    async (id: string) => {
      const res = await fetch(`/workflows/${id}`, { method: "DELETE" });
      return res.json() as Promise<{ ok: true }>;
    },
    [fetch],
  );

  const changeWorkflowActivity = useCallback(
    async (id: string, active: boolean) => {
      const res = await fetch(`/workflows/change-activity/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      return res.json() as Promise<Workflows>;
    },
    [fetch],
  );

  const importURLList = useCallback(
    async (id: string) => {
      const res = await fetch(`/workflows/${id}/import-url-list`);
      return res.json() as Promise<{
        link: Array<{
          name: string;
          identifier: string;
          link: {
            source: string;
            flag: string;
          };
        }>;
        searchLink: Array<{
          name: string;
          identifier: string;
          searchURL: {
            description: string;
            regex: Array<{ source: string; flag: string }>;
          };
        }>;
      }>;
    },
    [fetch],
  );

  const uploadLeads = useCallback(
    async (workflowId: string, urls: string[] = [], link: string[] = []) => {
      const body: any = {};
      if (urls.length > 0) {
        body.urls = urls;
      }
      if (link.length > 0) {
        body.link = link;
      }
      
      await fetch(`/workflows/${workflowId}/upload-leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    [],
  );

  return {
    updateWorkflow,
    createWorkflow,
    deleteWorkflow,
    changeWorkflowActivity,
    importURLList,
    uploadLeads,
  };
};
