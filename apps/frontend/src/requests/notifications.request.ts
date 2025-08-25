import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import useSWR from "swr";

export const useNotificationsRequests = () => {
  const fetch = useFetch();

  return {
    count: () =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSWR(
        "notifications/count",
        async () => await (await fetch("/notifications/unread-count")).json(),
      ),
    notifications: (isOpen: boolean) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSWR(
        isOpen ? "notifications/list" : null,
        async () => await (await fetch("/notifications/recent")).json(),
        {
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        },
      ),
  };
};
