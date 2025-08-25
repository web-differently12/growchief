import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useCallback } from "react";
import useSWR from "swr";

export const useOrganizationRequest = () => {
  const fetch = useFetch();

  const load = useCallback(async () => {
    return await (await fetch("/organizations/list")).json();
  }, []);

  return {
    list: () =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSWR("organizations", load, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        refreshWhenOffline: false,
        refreshWhenHidden: false,
        revalidateOnReconnect: false,
      }),
  };
};
