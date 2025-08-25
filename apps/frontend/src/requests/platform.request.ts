import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useCallback } from "react";
import useSWR from "swr";

const getPlatforms = {} as Record<string, any>;

export const usePlatforms = () => {
  const fetch = useFetch();

  const platforms = useCallback(async () => {
    getPlatforms['cache'] ??= (await fetch("/bots/platforms")).json();
    return getPlatforms['cache'];
  }, []);

  return {
    list: () =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSWR<{ name: string; identifier: string }[]>("platforms", platforms, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        revalidateIfStale: false,
      }),
  };
};
