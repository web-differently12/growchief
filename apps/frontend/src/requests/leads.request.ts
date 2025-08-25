import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useCallback } from "react";
import useSWR from "swr";

export interface Lead {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  url: string;
  organization_name: string | null;
  platform: string;
  picture: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  name: string;
}

export interface LeadWithWorkflows {
  lead: Lead;
  workflows: Workflow[];
  createdAt: string;
}

export interface LeadsResponse {
  leads: LeadWithWorkflows[];
  count: number;
}

export const useLeadsRequest = () => {
  const fetch = useFetch();

  const getLeads = useCallback(
    (page: number) => async (): Promise<LeadsResponse> => {
      return (await fetch(`/leads?page=${page}`)).json();
    },
    [fetch],
  );

  return {
    getLeads: (page: number) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSWR<LeadsResponse>(`leads-${page}`, getLeads(page)),
  };
};
