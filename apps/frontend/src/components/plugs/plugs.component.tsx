import { useAccountsRequest } from "@growchief/frontend/requests/accounts.request.ts";
import { Group } from "@growchief/frontend/components/accounts/groups.component.tsx";
import { Navigate, Route, Routes, useParams } from "react-router";
import { type FC, useEffect, useState } from "react";
import clsx from "clsx";
import { LineIcon } from "@growchief/frontend/components/icons/line.icon.tsx";
import type { Bot } from "@prisma/client";
import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import useSWR from "swr";

interface Plug {
  methodName: string;
  priority: number;
  identifier: string;
  description: string;
  title: string;
  randomSelectionChance: number;
}

export const RenderPlugs: FC<{ bot: Bot }> = ({ bot }) => {
  const fetch = useFetch();
  const { data: plugsData, isLoading } = useSWR<Plug[]>(
    "/plugs/" + bot.platform,
    async () => {
      return (await fetch("/plugs/" + bot.platform)).json();
    }
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-secondary">Loading plugs...</div>
      </div>
    );
  }

  if (!plugsData || plugsData.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[16px] font-[600] text-primary mb-[8px]">
            No plugs available
          </div>
          <div className="text-[14px] text-secondary">
            No plugs found for {bot.platform} platform
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-[16px]">
        {plugsData.map((plug) => (
          <div
            key={plug.identifier}
            className="shadow-menu bg-innerBackground border border-background rounded-[8px] p-[16px] hover:bg-boxHover transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-[12px]">
              <div className="flex-1">
                <h3 className="text-[14px] font-[600] text-primary mb-[4px] transition-colors">
                  {plug.title}
                </h3>
                <div className="text-[12px] text-secondary mb-[8px]">
                  {plug.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PlugsInner: FC<{ id: string }> = ({ id }) => {
  const accountsRequest = useAccountsRequest();
  const { data: bots, isLoading } = accountsRequest.groupsBots(id);
  const [current, setCurrent] = useState<Bot | undefined>();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (bots?.length) {
      setCurrent(bots?.[0]);
    }
  }, [isLoading, bots]);

  if (isLoading) {
    return <div className="bg-innerBackground p-[20px] flex flex-1" />;
  }

  return bots?.length ? (
    <>
      <div className="bg-innerBackground p-[20px] flex flex-col w-[260px] gap-[8px]">
        {bots.map((bot) => (
          <div
            key={bot.id}
            onClick={() => setCurrent(bot)}
            className={clsx(
              "cursor-pointer relative flex items-center gap-[12px] group/profile hover:bg-boxHover rounded-e-[8px]",
              current?.id === bot.id && "bg-boxHover"
            )}
          >
            <div
              className={clsx(
                "h-full w-[4px] rounded-s-[3px] opacity-0 group-hover/profile:opacity-100 transition-opacity",
                current?.id === bot.id && "opacity-100"
              )}
            >
              <LineIcon />
            </div>
            <div className="relative">
              <img
                alt={bot?.name}
                loading="lazy"
                width={36}
                height={36}
                className="rounded-[8px]"
                src={bot?.profilePicture!}
              />
              <img
                alt={bot?.platform}
                width={18}
                height={18}
                className="rounded-[8px] absolute z-10 -bottom-[5px] -end-[5px] border border-fifth"
                src={"/socials/" + bot?.platform + ".png"}
              />
            </div>
            {bot.name}
          </div>
        ))}
      </div>
      <div className="bg-innerBackground p-[20px] flex flex-1">
        {current && <RenderPlugs bot={current} />}
      </div>
    </>
  ) : (
    <div className="bg-innerBackground p-[20px] flex flex-1">
      Not avatars added to this group
    </div>
  );
};
export const PlugsComponent = () => {
  const accountsRequest = useAccountsRequest();
  const { data } = accountsRequest.groups();
  const params = useParams();

  return (
    <div className="flex-1 flex gap-[1px]">
      <div className="bg-innerBackground p-[20px] flex flex-col w-[260px] gap-[8px]">
        {(data || []).map((group) => (
          <Group path="plugs" group={group} key={group.id} />
        ))}
      </div>
      {data?.length && params?.["*"] ? (
        <PlugsInner id={params?.["*"]!} />
      ) : (
        <div className="bg-innerBackground p-[20px] flex flex-1">
          <Routes>
            {data?.length && (
              <Route
                path="/"
                element={<Navigate to={`/plugs/${data?.[0]?.id}`} />}
              />
            )}
          </Routes>
        </div>
      )}
    </div>
  );
};
