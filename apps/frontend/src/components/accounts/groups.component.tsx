import { type FC, useCallback } from "react";
import { useAccountsRequest } from "@growchief/frontend/requests/accounts.request.ts";
import {
  Link,
  matchPath,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router";
import clsx from "clsx";
import { LineIcon } from "@growchief/frontend/components/icons/line.icon.tsx";
import type { BotGroup } from "@prisma/client";
import { AccountsComponent } from "@growchief/frontend/components/accounts/accounts.component.tsx";
import { GroupContext } from "@growchief/frontend/context/group.context";
import { PlusIcon } from "@growchief/frontend/components/icons/plus.icon.tsx";
import { useModals } from "@growchief/frontend/utils/store.ts";
import { AddGroup } from "@growchief/frontend/components/accounts/add.group.component.tsx";

export const Group: FC<{ group: BotGroup, path: string }> = ({ group, path }) => {
  const location = useLocation();
  const isActive = !!matchPath(
    { path: (`/${path}/` + group.id) as string, end: false },
    location.pathname,
  );

  return (
    <Link
      to={`/${path}/` + group.id}
      className={clsx(
        "cursor-pointer flex items-center gap-[12px] group/profile hover:bg-boxHover rounded-e-[8px]",
        isActive && "bg-boxHover",
      )}
    >
      <div
        className={clsx(
          "h-full w-[4px] rounded-s-[3px] opacity-0 group-hover/profile:opacity-100 transition-opacity",
          isActive && "opacity-100",
        )}
      >
        <LineIcon />
      </div>
      {group.name}
    </Link>
  );
};

export const GroupsComponent: FC = () => {
  const accountsRequest = useAccountsRequest();
  const { data } = accountsRequest.groups();
  const params = useParams();
  const modals = useModals();
  const createGroup = useCallback(() => {
    modals.show({
      label: "Add Group",
      component: (close) => <AddGroup close={close} />,
    });
  }, []);

  return (
    <div className="flex-1 flex gap-[1px]">
      <div className="bg-innerBackground p-[20px] flex flex-col w-[260px]">
        <div className="flex flex-1 flex-col gap-[15px]">
          <div
            onClick={createGroup}
            className="h-[44px] gap-[8px] bg-btn-primary w-full text-white px-[16px] items-center cursor-pointer text-center flex rounded-[8px] text-[16px] font-[500]"
          >
            <div>
              <PlusIcon />
            </div>
            <div>Add Group</div>
          </div>
          <div className="flex flex-col gap-[8px]">
            {(data || []).map((group) => (
              <Group path="accounts" group={group} key={group.id} />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-innerBackground flex-1 flex-col flex gap-[12px]">
        <Routes>
          {data?.length && (
            <Route
              path="/"
              element={<Navigate to={`/accounts/${data?.[0]?.id}`} />}
            />
          )}
          {data?.length &&
            !!params["*"] &&
            !!data.find((g) => g.id === params["*"]) && (
              <Route
                path={params["*"]}
                element={
                  <GroupContext.Provider
                    value={{
                      group: data.find((g) => g.id === params["*"])!,
                    }}
                  >
                    <AccountsComponent />
                  </GroupContext.Provider>
                }
              />
            )}
          {data?.length && (
            <Route
              path="*"
              element={<Navigate to={`/accounts/${data?.[0]?.id}`} />}
            />
          )}
        </Routes>
      </div>
    </div>
  );
};
