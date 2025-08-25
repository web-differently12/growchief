"use client";

import { type FC, Fragment } from "react";
import { useMemo, useState } from "react";
import { capitalize, sortBy } from "lodash";
import { mutate } from "swr";
import { InviteStatus } from "@prisma/client";
import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import { useUser } from "@growchief/frontend/utils/store.ts";
import { makeId } from "@growchief/shared-both/utils/make.id.ts";
import { Button } from "../ui/button";

interface Member {
  role: "SUPERADMIN" | "ADMIN" | "USER";
  user: {
    email: string;
    id: string;
    status?: string;
  };
}

const role = {
  SUPERADMIN: 1,
  ADMIN: 2,
  USER: 3,
};

export const TeamMembersList: FC<{
  list: Member[];
  invites: { email: string; role: string; status: InviteStatus }[];
}> = (props) => {
  const { list, invites } = props;
  const [removingId, setRemovingId] = useState<string | null>(null);
  const fetch = useFetch();
  const toast = useToaster();
  const user = useUser();

  const merged: Member[] = useMemo(() => {
    return invites.reduce((all, current) => {
      const toFind = all.findIndex((item) => item.user.email === current.email);
      if (toFind === -1) {
        return [
          ...all,
          {
            role: current.role,
            user: {
              email: current.email,
              id: makeId(10),
              status: current.status,
            },
          },
        ] as Member[];
      }

      // @ts-ignore
      all[toFind].user.status = current.status;

      return all as Member[];
    }, list);
  }, [list, invites]);

  const handleRemoveMember = async (userId: string, email: string) => {
    setRemovingId(userId);

    try {
      const response = await fetch(`/teams`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to remove team member");

      await mutate("teams");

      toast.show("Team member removed successfully", "success");
    } catch (error) {
      toast.show("Failed to remove team member", "warning");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-y-[10px] items-center">
        <div className="font-[600]">Member</div>
        <div className="font-[600]">Role</div>
        <div className="font-[600]">Status</div>
        <div className="text-right pr-6 font-[600]">Actions</div>
        {sortBy(merged, (o) => role[o.role]).map((member: Member) => (
          <Fragment key={member.user.id}>
            <div className="min-h-[42px] flex items-center">
              <div>
                <div className="font-medium">
                  {member.user.email || "Invited User"}
                </div>
              </div>
            </div>
            <div>{capitalize(member.role)}</div>
            <div>{member.user.status || 'ACTIVE'}</div>
            <div className="text-right flex justify-end">
              {member.user.id !== user?.id &&
                // @ts-ignore
                (((role[member.role] as number) >=
                  // @ts-ignore
                  role[user?.org?.users?.[0]?.role]) as number) && (
                  <Button
                    disabled={removingId === member.user.id}
                    onClick={() =>
                      handleRemoveMember(member.user.id, member.user.email)
                    }
                  >
                    {removingId === member.user.id ? (
                      <>Removing...</>
                    ) : (
                      "Remove"
                    )}
                  </Button>
                )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
