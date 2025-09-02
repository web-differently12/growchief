import { WorkflowPage } from "@growchief/frontend/pages/workflow.page.tsx";
import { WorkflowsIcon } from "@growchief/frontend/components/icons/workflows.icon.tsx";
import { AccountsIcon } from "@growchief/frontend/components/icons/accounts.icon.tsx";
import { AccountsPage } from "@growchief/frontend/pages/accounts.page.tsx";
import { NotFoundPage } from "@growchief/frontend/pages/not-found.page.tsx";
import { BillingPage } from "@growchief/frontend/pages/billing.page.tsx";
import { BillingIcon } from "@growchief/frontend/components/icons/billing.icon.tsx";
import { SettingsIcon } from "@growchief/frontend/components/icons/settings.icon.tsx";
import { SettingsPage } from "@growchief/frontend/pages/settings.page.tsx";
import { LeadsIcon } from "@growchief/frontend/components/icons/leads.icon.tsx";
import { LeadsPage } from "@growchief/frontend/pages/leads.page.tsx";
import { TeamComponent } from "@growchief/frontend/components/team/team.component.tsx";
import { GlobalSettingsComponent } from "@growchief/frontend/components/settings/global.settings.component.tsx";
import { ProxiesPage } from "@growchief/frontend/pages/proxies.page.tsx";
import type { RouteProps } from "react-router";
import type { ReactNode } from "react";
import type { User } from "@growchief/frontend/utils/store.ts";
import { ProxyIcon } from "@growchief/frontend/components/icons/proxy.icon.tsx";
import { AnalyticsIcon } from "@growchief/frontend/components/icons/analytics.icon.tsx";
import { AnalyticsPage } from "@growchief/frontend/pages/analytics.page.tsx";
import { PlugsPage } from "@growchief/frontend/pages/plugs.page.tsx";
import { PlugsIcon } from "@growchief/frontend/components/icons/plugs.icon.tsx";

export type OneRoute = RouteProps & {
  label: string;
  menu: boolean;
  icon: ReactNode;
  sub?: RoutesType;
};

export type RoutesType = Array<OneRoute>;

export const topRoutes: (user: User) => RoutesType = (_: User) => [
  {
    index: true,
    label: "Analytics",
    path: "/analytics/*",
    menu: true,
    element: <AnalyticsPage />,
    icon: <AnalyticsIcon />,
  },
  {
    index: true,
    label: "Workflows",
    path: "/workflows/*",
    menu: true,
    element: <WorkflowPage />,
    icon: <WorkflowsIcon />,
  },
  {
    label: "Accounts",
    path: "/accounts/*",
    menu: true,
    element: <AccountsPage />,
    icon: <AccountsIcon />,
  },
  {
    label: "Proxies",
    path: "/proxies/*",
    menu: true,
    element: <ProxiesPage />,
    icon: <ProxyIcon />,
  },
  {
    label: "Plugs",
    path: "/plugs/*",
    menu: true,
    element: <PlugsPage />,
    icon: <PlugsIcon />,
  },
  {
    label: "Leads",
    path: "/leads",
    menu: true,
    element: <LeadsPage />,
    icon: <LeadsIcon />,
  },
];

export const bottomRoutes: (user: User) => RoutesType = (user: User) => [
  ...(["ADMIN", "SUPERADMIN"].indexOf(user?.org?.users?.[0]?.role) > -1 &&
  !user.selfhosted
    ? [
        {
          label: "Billing",
          path: "/billing",
          menu: true,
          element: <BillingPage />,
          icon: <BillingIcon />,
        },
      ]
    : []),
  {
    label: "Settings",
    path: "/settings/*",
    menu: true,
    element: <SettingsPage />,
    icon: <SettingsIcon />,
    sub: [
      {
        label: "Global",
        path: "/global",
        menu: true,
        element: <GlobalSettingsComponent />,
        icon: <SettingsIcon />,
      },
      ...(["ADMIN", "SUPERADMIN"].indexOf(user?.org?.users?.[0]?.role) > -1
        ? [
            {
              label: "Teams",
              path: "/teams",
              menu: true,
              element: <TeamComponent />,
              icon: <SettingsIcon />,
            },
          ]
        : []),
    ],
  },
  {
    label: "Page Not Found",
    path: "*",
    menu: false,
    element: <NotFoundPage />,
    icon: <></>,
  },
];

export const routes: (user: User) => RoutesType = (user: User) => [
  ...topRoutes(user),
  ...bottomRoutes(user),
];
