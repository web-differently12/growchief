import { type FC, useMemo } from "react";
import { useLocation, matchPath } from "react-router";
import { routes } from "@growchief/frontend/routes.tsx";
import { useUser } from "@growchief/frontend/utils/store.ts";

export const PageName: FC = () => {
  const location = useLocation();
  const user = useUser();

  const currentRoute = useMemo(() => {
    return routes(user!).find((route) =>
      route.path
        ? matchPath({ path: route.path, end: false }, location.pathname)
        : route.index && location.pathname === "/",
    );
  }, [location]);

  return <>{currentRoute?.label ?? ""}</>;
};
