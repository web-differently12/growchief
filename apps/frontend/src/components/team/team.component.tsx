"use client";

import type { FC } from "react";
import { TeamMembersList } from "./team-members-list";
import { InviteTeamMemberDialog } from "./invite-team-member-dialog";
import { useModals, useUser } from "@growchief/frontend/utils/store.ts";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { useTeamRequest } from "@growchief/frontend/requests/team.request.ts";

export const TeamComponent: FC = () => {
  const data = useUser();
  if (!data || !data?.roles?.create_team?.enabled) {
    return null;
  }

  return <TeamComponentInner />;
};

export const TeamComponentInner: FC = () => {
  const teamRequest = useTeamRequest();
  const modals = useModals();
  const { data, isLoading } = teamRequest.list();
  if (isLoading) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col gap-[1px]">
      <div className="flex bg-innerBackground rounded-t-[8px] px-[20px] items-center text-[24px] font-[600]">
        <div className="flex flex-1">
          <span>Team Management</span>
        </div>
        <div className="flex items-center gap-[20px]">
          <Button
            onClick={() =>
              modals.show({
                label: "Invite Team Member",
                component: (close) => <InviteTeamMemberDialog close={close} />,
              })
            }
            className="flex items-center gap-[8px] w-[200px]"
          >
            Invite Member
          </Button>
        </div>
      </div>
      <div className="bg-innerBackground rounded-b-[8px] px-[20px] py-[20px] flex-1">
        <p className="text-sm text-muted-foreground mb-[20px]">
          Manage your team members and their roles
        </p>
        <TeamMembersList list={data.users} invites={data.invites} />
      </div>
    </div>
  );
};
