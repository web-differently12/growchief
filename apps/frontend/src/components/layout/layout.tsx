import { type FC, Fragment, useCallback, useEffect, useMemo } from "react";
import { ModeIcon } from "@growchief/frontend/components/icons/mode.icon.tsx";
import { MenuItem } from "@growchief/frontend/components/layout/menu.item.tsx";
import {
  bottomRoutes,
  routes,
  topRoutes,
} from "@growchief/frontend/routes.tsx";
import { Navigate, Route, Routes } from "react-router";
import { PageName } from "@growchief/frontend/components/layout/page.name.tsx";
import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useBearStore } from "@growchief/frontend/utils/store.ts";
import { useShallow } from "zustand/react/shallow";
import { SubRoutesContext } from "@growchief/frontend/utils/sub.routes.context.tsx";
import { JoinTeamModal } from "@growchief/frontend/components/team/join.team.modal.tsx";
import { OrganizationSelector } from "@growchief/frontend/components/layout/organization.selector.tsx";
import { ModalManager } from "@growchief/frontend/utils/modal.manager";
import { NotificationsComponent } from "@growchief/frontend/components/notifications/notifications.component.tsx";
import { CheckSubscription } from "@growchief/frontend/components/layout/check.subscription.tsx";
import { SuperAdminComponent } from "@growchief/frontend/components/layout/super.admin.component.tsx";
import clsx from "clsx";

export const Layout: FC = () => {
  const fetch = useFetch();
  const { user, setUser } = useBearStore(
    useShallow((state) => ({ user: state.user, setUser: state.setUser })),
  );

  const loadUser = useCallback(async () => {
    const data = await (await fetch("/users/self")).json();
    setUser({ ...data, mutate: () => loadUser() });
  }, []);

  const memoRoutes = useMemo(() => {
    if (!user) {
      return {
        routes: [],
        topRoutes: [],
        bottomRoutes: [],
      };
    }

    return {
      routes: routes(user),
      topRoutes: topRoutes(user),
      bottomRoutes: bottomRoutes(user),
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      loadUser();
    }
  }, []);

  if (!user) {
    return null;
  }

  if (!user.org.subscription && !user.selfhosted) {
    return (
      <div className="flex flex-1 flex-col">
        {user.isSuperAdmin && <SuperAdminComponent />}
        <CheckSubscription />
        <div className="blurMe">
          <JoinTeamModal />
          <Routes>
            {memoRoutes.routes
              .filter((f) => f.label === "Billing")
              .map((route) => (
                <Fragment key={route.label}>
                  <Route {...route} path="*" />
                </Fragment>
              ))}
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {user.isSuperAdmin && <SuperAdminComponent />}
      <JoinTeamModal />
      <div className="flex gap-[8px] flex-1">
        <div className="w-[86px] bg-innerBackground rounded-[8px] pt-[20px] pb-[12px] text-center select-none">
          <div className={clsx("fixed blurMe w-[86px] top-0 h-full pt-[32px] pb-[24px] px-[8px] flex flex-col gap-[32px]", user.isSuperAdmin && 'pt-[85px]')}>
            <div className="flex justify-center items-center">
              <div className="w-[60px] h-[60px] rounded-full overflow-hidden logo-shadow">
                <img
                  src="/logo.svg"
                  alt="Logo"
                  className="w-full h-full object-cover rounded-full overflow-hidden"
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex flex-1 flex-col gap-[16px]">
                {memoRoutes.topRoutes
                  .filter((f) => f.menu)
                  .map((route) => (
                    <MenuItem
                      key={route.label}
                      label={route.label}
                      to={route.path?.split("/")[1]!}
                      icon={route.icon}
                    />
                  ))}
              </div>
              <div className="flex flex-col gap-[16px]">
                {memoRoutes.bottomRoutes
                  .filter((f) => f.menu)
                  .map((route) => (
                    <MenuItem
                      key={route.label}
                      label={route.label}
                      to={route.path?.split("/")[1]!}
                      icon={route.icon}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
        <ModalManager>
          <div className="flex-1 flex flex-col gap-[1px]">
            <div className="h-[80px] flex bg-innerBackground rounded-t-[8px] px-[20px] items-center text-[24px] font-[600]">
              <div className="flex flex-1">
                <PageName />
              </div>
              <div className="select-none flex flex-row-reverse text-secondary gap-[20px]">
                <NotificationsComponent />
                <div className="w-[1px] h-[24px] bg-secondary/20" />
                <ModeIcon />
                <OrganizationSelector />
              </div>
            </div>
            <Routes>
              <Route
                path="/auth/*"
                element={<Navigate to="/analytics" replace />}
              />
              <Route path="/" element={<Navigate to="/analytics" replace />} />
              {memoRoutes.routes.map((route) => (
                <Route
                  {...route}
                  element={
                    <SubRoutesContext.Provider
                      key={route.label}
                      value={{ routes: route?.sub || [] }}
                    >
                      {route.element}
                    </SubRoutesContext.Provider>
                  }
                />
              ))}
            </Routes>
          </div>
        </ModalManager>
      </div>
    </div>
  );
};
