import type { FC } from "react";
import { useState } from "react";
import { mutate } from "swr";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import { useFetch } from "@growchief/frontend/utils/use.fetch";
import { Input } from "@growchief/frontend/components/ui/input.tsx";
import { Select } from "@growchief/frontend/components/ui/select.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";

export const InviteTeamMemberDialog: FC<{ close: () => void }> = ({
  close,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN" | "SUPERADMIN">("USER");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToaster();
  const fetch = useFetch();

  const handleInvite = async () => {
    if (!email) {
      toast.show("Please enter an email address", "warning");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/teams/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) throw new Error("Failed to invite team member");

      await mutate("teams");

      toast.show(`Invitation sent to ${email}`, "success");

      // Reset form and close dialog
      setEmail("");
      setRole("USER");
      close();
    } catch (error) {
      toast.show("Failed to send invitation", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="grid gap-4">
        <div className="flex flex-col gap-1">
          <div className="col-span-4">Email Address</div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="col-span-4">Role</div>
          <Select
            value={role}
            onChange={(event) =>
              setRole(event.target.value as "USER" | "ADMIN" | "SUPERADMIN")
            }
            disabled={isLoading}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERADMIN">Superadmin</option>
          </Select>
        </div>
      </div>

      <div className="flex gap-[20px] mt-[40px]">
        <Button
          size="lg"
          type="button"
          onClick={handleInvite}
          disabled={isLoading}
        >
          {isLoading ? <>Sending...</> : "Send Invitation"}
        </Button>
      </div>
    </div>
  );
};
