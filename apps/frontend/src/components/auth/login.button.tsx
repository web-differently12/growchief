import { useCallback } from "react";
import type { FC, ReactNode } from "react";
import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";

export const LoginButton: FC<{ children: ReactNode; provider: string }> = (
  props,
) => {
  const { provider, children } = props;
  const fetch = useFetch();
  const login = useCallback(async () => {
    const get = await (
      await fetch(
        `/auth/oauth/${provider}?website=${new URL(window.location.href).origin}`,
      )
    ).text();

    window.location.href = get;
  }, []);
  return <div onClick={login}>{children}</div>;
};
