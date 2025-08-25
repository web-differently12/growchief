import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useCallback } from "react";
import useSWR from "swr";

export interface Proxy {
  id: string;
  ip: string;
  provider: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  botsCount: number;
}

export const useProxiesRequest = () => {
  const fetch = useFetch();

  const getProxies = useCallback(async (): Promise<Proxy[]> => {
    return (await fetch("/proxies")).json();
  }, [fetch]);

  const getTypes = useCallback(async () => {
    return (await fetch("/proxies/types")).json();
  }, [fetch]);

  const getCountries = useCallback(
    (identifier: string) => async () => {
      return (await fetch(`/proxies/${identifier}/countries`)).json();
    },
    [fetch],
  );

  const createProxy = useCallback(
    async (identifier: string, country: string) => {
      return (
        await fetch(`/proxies/${identifier}`, {
          method: "POST",
          body: JSON.stringify({
            country,
          }),
        })
      ).json();
    },
    [],
  );

  const createCustomProxy = useCallback(
    async (serverAddress: string, username: string, password: string) => {
      return (
        await fetch("/proxies/custom", {
          method: "POST",
          body: JSON.stringify({
            serverAddress,
            username,
            password,
          }),
        })
      ).json();
    },
    [fetch],
  );

  const deleteCustomProxy = useCallback(
    async (proxyId: string) => {
      return (
        await fetch(`/proxies/custom/${proxyId}`, {
          method: "DELETE",
        })
      ).json();
    },
    [fetch],
  );

  const deleteProxy = useCallback(
    async (identifier: string, ip: string) => {
      return (
        await fetch(`/proxies/${identifier}`, {
          method: "DELETE",
          body: JSON.stringify({
            ip,
          }),
        })
      ).json();
    },
    [fetch],
  );

  return {
    createProxy,
    createCustomProxy,
    deleteCustomProxy,
    deleteProxy,
    // eslint-disable-next-line react-hooks/rules-of-hooks
    getProxies: () => useSWR<Proxy[]>("proxies", getProxies),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    getTypes: () => useSWR<any[]>("types", getTypes),
    getCountries: (id: string) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSWR<any[]>(`countries-list-${id}`, getCountries(id)),
  };
};
