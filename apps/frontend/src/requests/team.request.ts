import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useCallback } from "react";
import useSWR from "swr";
import type { Invite } from "@growchief/frontend/components/team/join.team.modal.tsx";

export const useTeamRequest = () => {
  const fetch = useFetch();

  const invites = useCallback(async () => {
    return (await fetch("/users/invites")).json();
  }, []);

  const list = useCallback(async () => {
    return (await fetch("/teams/list")).json();
  }, []);

  return {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    invites: () => useSWR<Invite[]>("invites", invites),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    list: () => useSWR("teams", list),
  };
};
