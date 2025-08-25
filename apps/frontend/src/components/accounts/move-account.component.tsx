import { type FC, useCallback, useState } from "react";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { Select } from "@growchief/frontend/components/ui/select.tsx";
import { useAccountsRequest } from "@growchief/frontend/requests/accounts.request.ts";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import type { Bot } from "@prisma/client";
import { useGroupContext } from "@growchief/frontend/context/group.context.tsx";
import { useNavigate } from "react-router";

interface MoveAccountComponentProps {
  bot: Bot;
  close: () => void;
  mutate: () => Promise<any>;
}

export const MoveAccountComponent: FC<MoveAccountComponentProps> = ({
  bot,
  close,
  mutate,
}) => {
  const { group: currentGroup } = useGroupContext();
  const accountsRequest = useAccountsRequest();
  const toaster = useToaster();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const push = useNavigate();

  // Get all groups
  const { data: groups = [] } = accountsRequest.groups();

  // Filter out the current group
  const availableGroups = groups.filter(
    (group) => group.id !== currentGroup.id,
  );

  const handleMove = useCallback(async () => {
    if (!selectedGroupId) {
      toaster.show("Please select a group", "warning");
      return;
    }

    setIsLoading(true);
    try {
      await accountsRequest.moveBotToGroup(bot.id, selectedGroupId);
      const targetGroup = groups.find((g) => g.id === selectedGroupId);
      toaster.show(
        `Account moved to "${targetGroup?.name}" successfully`,
        "success",
      );
      await mutate();
      push(`/accounts/${selectedGroupId}`);
      close();
    } catch (error) {
      console.error("Failed to move account:", error);
      toaster.show("Failed to move account", "warning");
    } finally {
      setIsLoading(false);
    }
  }, [
    bot.id,
    selectedGroupId,
    accountsRequest,
    toaster,
    mutate,
    close,
    groups,
  ]);

  return (
    <div>
      <div className="mb-[24px]">
        <h2 className="text-[18px] font-[600] text-primary mb-[8px]">
          Move Account
        </h2>
        <p className="text-[14px] text-secondary">
          Move "{bot.name}" to a different group. This action will transfer the
          account and all its data to the selected group.
        </p>
      </div>

      <div className="mb-[24px]">
        <label className="block text-[14px] font-[500] text-primary mb-[8px]">
          Current Group
        </label>
        <div className="p-[12px] bg-background rounded-[6px] border border-input-border">
          <span className="text-[14px] text-secondary">
            {currentGroup.name}
          </span>
        </div>
      </div>

      <div className="mb-[24px]">
        <label className="block text-[14px] font-[500] text-primary mb-[8px]">
          Move to Group
        </label>
        {availableGroups.length > 0 ? (
          <Select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full"
          >
            <option value="">Select a group...</option>
            {availableGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Select>
        ) : (
          <div className="p-[12px] bg-background rounded-[6px] border border-input-border">
            <span className="text-[14px] text-secondary italic">
              No other groups available. Create a new group first.
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-[12px] pt-[16px] border-t border-background">
        <Button variant="ghost" onClick={close} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleMove}
          disabled={
            isLoading || !selectedGroupId || availableGroups.length === 0
          }
        >
          {isLoading ? "Moving..." : "Move Account"}
        </Button>
      </div>
    </div>
  );
};
