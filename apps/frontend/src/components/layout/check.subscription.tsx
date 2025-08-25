import { type FC, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import clsx from "clsx";
import { LoadingComponent } from "@growchief/frontend/components/ui/loading.component.tsx";
import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useBearStore } from "@growchief/frontend/utils/store.ts";
import { useShallow } from "zustand/react/shallow";

export const CheckSubscription: FC = () => {
  const [query] = useSearchParams();
  const onboarding = query.get("onboarding");
  const [showLoading] = useState(!!onboarding);

  const fetch = useFetch();
  const { setUser } = useBearStore(
    useShallow((state) => ({ user: state.user, setUser: state.setUser })),
  );

  const loadUser = useCallback(async () => {
    const data = await (await fetch("/users/self")).json();
    setUser({ ...data, mutate: () => loadUser() });
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (onboarding) {
      document.querySelector("body")?.classList.add("overflow-hidden");
      Array.from(document.querySelectorAll(".blurMe") || []).map((p) =>
        p.classList.add("blur-xs", "pointer-events-none"),
      );

      interval = setInterval(loadUser, 3000);
    }

    return () => {
      clearInterval(interval);
      document.querySelector("body")?.classList.remove("overflow-hidden");
      Array.from(document.querySelectorAll(".blurMe") || []).map((p) =>
        p.classList.remove("blur-xs", "pointer-events-none"),
      );
    };
  }, [onboarding]);

  if (!showLoading) {
    return null;
  }
  return (
    <div
      style={{ zIndex: 9999 }}
      className="fixed flex left-0 top-0 min-w-full min-h-full bg-popup transition-all animate-fadeIn overflow-y-auto pb-[50px]"
    >
      <div className="relative flex-1">
        <div className="absolute top-0 left-0 min-w-full min-h-full pt-[100px] pb-[100px]">
          <div
            className={clsx(
              "gap-[40px] p-[32px] bg-innerBackground mx-auto flex flex-col w-fit left-[50%] rounded-[24px]",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="whitespace-pre-line">
              <LoadingComponent width={200} height={200} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
