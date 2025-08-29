import { type FC, useCallback } from "react";
import { emitter, useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useDecisionModal } from "@growchief/frontend/utils/use.decision.modal.tsx";

export const LogoutComponent: FC = () => {
  const fetch = useFetch();
  const decision = useDecisionModal();

  const logout = useCallback(async () => {
    const logout = await decision.open({
      label: "Logout",
      description: "Are you sure you want to logout?",
      approveLabel: "Logout",
      cancelLabel: "Cancel",
    });

    if (logout) {
      await fetch("/users/logout", {
        method: "POST",
      });

      emitter.emit("event", { name: "logout" });
    }
  }, []);
  return (
    <div
      onClick={logout}
      className="text-red-600 hover:underline hover:font-bold cursor-pointer"
    >
      Logout
    </div>
  );
};
