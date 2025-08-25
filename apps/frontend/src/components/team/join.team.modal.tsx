"use client";
import { useFetch } from "@growchief/frontend/utils/use.fetch";
import type { FC } from "react";
import { useState } from "react";
import { mutate } from "swr";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { CloseIcon } from "@growchief/frontend/components/icons/close.icon.tsx";
import { useUser } from "@growchief/frontend/utils/store.ts";
import { useTeamRequest } from "@growchief/frontend/requests/team.request.ts";

export type Invite = {
  id: string;
  role: string;
  organization: {
    id: string;
    companyName: string;
  };
};

export const JoinTeamModal: FC = () => {
  const fetch = useFetch();
  const teamRequest = useTeamRequest();
  const [loading, setLoading] = useState<string | null>(null);
  const user = useUser();

  // Always keep the dialog open
  const [open, setOpen] = useState(true);

  const { data, isLoading } = teamRequest.invites();

  const handleAction = async (
    inviteId: string,
    action: "accept" | "decline",
  ) => {
    try {
      setLoading(inviteId);
      await fetch(`/users/invite/${inviteId}`, {
        method: "POST",
        body: JSON.stringify({
          action,
        }),
      });
      // Refresh invites data
      await mutate("invites");
      await mutate("organization");
      user?.mutate();
    } catch (error) {
      console.error(`Failed to ${action} invite:`, error);
    } finally {
      setLoading(null);
    }
  };

  // Don't render the modal if there are no invites or still loading
  if (isLoading || !data?.length) {
    return null;
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 w-full h-full z-[200] bg-popup transition-all animate-fadeIn">
      <div className="gap-[40px] p-[32px] bg-innerBackground float-left absolute flex flex-col -translate-x-[50%] left-[50%] top-[100px] rounded-[24px]">
        <div className="flex items-center">
          <div className="text-[24px] font-[600] flex-1">Invitations</div>
          <div onClick={() => setOpen(false)} className="cursor-pointer">
            <CloseIcon />
          </div>
        </div>
        <div className="bg-zinc-900 border-zinc-800 text-white max-w-md w-full">
          <div>
            <div className="text-xl font-bold">Team Invitations</div>
            <div className="text-zinc-400 mt-2">
              You have been invited to join the following teams:
            </div>
          </div>

          <div className="my-4 space-y-4">
            {data.map((invite) => (
              <div
                key={invite.id}
                className="border border-zinc-800 rounded-md p-4 flex gap-4 items-center"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-lg">
                    {invite.organization.companyName}
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Role: {invite.role.toLowerCase()}
                  </p>
                </div>

                <div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(invite.id, "decline")}
                      disabled={loading === invite.id}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(invite.id, "accept")}
                      disabled={loading === invite.id}
                    >
                      {loading === invite.id ? "Processing..." : "Accept"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs text-zinc-500 mt-2">
              Accepting an invitation will add you to the team.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
