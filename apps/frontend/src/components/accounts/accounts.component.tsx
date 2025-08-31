import { type FC, useCallback } from "react";
import { useAccountsRequest } from "@growchief/frontend/requests/accounts.request.ts";
import type { Bot } from "@prisma/client";
import clsx from "clsx";
import {
  GroupContext,
  useGroupContext,
} from "@growchief/frontend/context/group.context.tsx";
import { PlusIcon } from "@growchief/frontend/components/icons/plus.icon.tsx";
import { DeleteIcon } from "@growchief/frontend/components/icons/delete.icon.tsx";
import { useModals } from "@growchief/frontend/utils/store.ts";
import { useDecisionModal } from "@growchief/frontend/utils/use.decision.modal.tsx";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import { AddAccountComponent } from "@growchief/frontend/components/accounts/add.account.component.tsx";
import { WorkingHoursComponent } from "@growchief/frontend/components/accounts/working-hours.component.tsx";
import { MoveAccountComponent } from "@growchief/frontend/components/accounts/move-account.component.tsx";
import { AssignProxyComponent } from "@growchief/frontend/components/accounts/assign-proxy.component.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { ClockIcon } from "@growchief/frontend/components/icons/clock.icon.tsx";
import { MoveIcon } from "@growchief/frontend/components/icons/move.icon.tsx";
import { ProxyIcon } from "@growchief/frontend/components/icons/proxy.icon.tsx";
import { createToolTip } from "@growchief/frontend/utils/create.tool.tip.tsx";
import { NextActionComponent } from "@growchief/frontend/components/accounts/next.action.component.tsx";

const StatusBadge: FC<{ status: string; logged: boolean }> = ({
  status,
  logged,
}) => {
  const isActive = status === "ACTIVE" && logged;
  const isPaused = status === "PAUSED";

  return (
    <div
      className={clsx(
        "px-[8px] py-[2px] rounded-full text-[11px] font-[600] inline-flex items-center",
        isActive
          ? "bg-menu text-text-menu"
          : isPaused
            ? "bg-yellow-600/20 text-yellow-400"
            : "bg-red-600/20 text-red-400",
      )}
    >
      <div
        className={clsx(
          "w-[6px] h-[6px] rounded-full mr-[6px]",
          isActive ? "bg-text-menu" : isPaused ? "bg-yellow-400" : "bg-red-400",
        )}
      />
      {isActive ? "Active" : isPaused ? "Paused" : "Inactive"}
    </div>
  );
};

const BotRow: FC<{
  bot: Bot;
  onDelete: (botId: string) => Promise<void>;
  onWorkingHours: (bot: Bot) => void;
  onMove: (bot: Bot) => void;
  onAssignProxy: (bot: Bot) => void;
  onToggleStatus: (botId: string, status: "ACTIVE" | "PAUSED") => Promise<void>;
}> = ({
  bot,
  onDelete,
  onWorkingHours,
  onMove,
  onAssignProxy,
  onToggleStatus,
}) => {
  const platformSrc = `/socials/${String(bot.platform || "").toLowerCase()}.png`;
  const decisionModal = useDecisionModal();

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      const confirmed = await decisionModal.open({
        label: "Delete Account",
        description: `Are you sure you want to delete "${bot.name}"? This action cannot be undone.`,
        approveLabel: "Delete",
        cancelLabel: "Cancel",
      });

      if (confirmed) {
        await onDelete(bot.id);
      }
    },
    [bot.id, bot.name, decisionModal, onDelete],
  );

  const handleWorkingHours = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onWorkingHours(bot);
    },
    [bot, onWorkingHours],
  );

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMove(bot);
    },
    [bot, onMove],
  );

  const handleAssignProxy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onAssignProxy(bot);
    },
    [bot, onAssignProxy],
  );

  const handleToggleStatus = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const newStatus = bot.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
      await onToggleStatus(bot.id, newStatus);
    },
    [bot.id, bot.status, onToggleStatus],
  );

  return (
    <tr className="hover:bg-boxHover transition-all duration-200 border-b border-background">
      <td className="px-[20px] py-[16px]">
        <div className="flex items-center gap-[12px]">
          <button
            {...createToolTip(
              bot.status === "ACTIVE" ? "Pause account" : "Activate account",
            )}
            onClick={handleToggleStatus}
            className={clsx(
              "relative w-[36px] h-[36px] rounded-full border flex-shrink-0 flex items-center justify-center transition-all duration-200",
              bot.status === "ACTIVE"
                ? "bg-red-600/20 border-red-600/30 hover:bg-red-600/30 text-red-400"
                : "bg-green-600/20 border-green-600/30 hover:bg-green-600/30 text-green-400",
            )}
          >
            {bot.status === "ACTIVE" ? (
              // Stop icon (square)
              <div className="w-[14px] h-[14px] bg-current rounded-[2px]" />
            ) : (
              // Play icon (triangle)
              <div className="w-0 h-0 border-l-[10px] border-l-current border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-[2px]" />
            )}
          </button>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-[12px]">
          <div className="relative">
            {bot.profilePicture ? (
              <img
                src={bot.profilePicture}
                alt={`${bot.name} avatar`}
                className="inset-[2px] w-[35px] h-[35px] object-cover rounded-full"
              />
            ) : (
              <div className="absolute inset-[2px] w-[calc(100%-4px)] h-[calc(100%-4px)] flex items-center justify-center text-[10px] opacity-20">
                {bot.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="absolute -bottom-[2px] -right-[2px] w-[16px] h-[16px] rounded-full bg-innerBackground border border-background overflow-hidden flex items-center justify-center">
              <img
                src={platformSrc}
                alt={String(bot.platform)}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-[600] text-primary leading-[1.2] truncate">
              {bot.name}
            </h3>
          </div>
        </div>
      </td>
      <td className="px-[20px] py-[16px]">
        <div className="text-[13px] text-secondary capitalize">
          {String(bot.platform || "").toLowerCase()}
        </div>
      </td>
      <td className="px-[20px] py-[16px]">
        <StatusBadge status={bot.status} logged={bot.logged} />
      </td>
      <td className="px-[20px] py-[16px]">
        <NextActionComponent id={bot.id} />
      </td>
      <td className="px-[20px] py-[16px]">
        <div className="flex items-center gap-[8px]">
          <button
            {...createToolTip("Configure working hours")}
            onClick={handleWorkingHours}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] hover:bg-background transition-all duration-200 text-secondary hover:text-primary"
            title={`Configure working hours for ${bot.name}`}
          >
            <ClockIcon className="w-[16px] h-[16px]" />
          </button>
          <button
            {...createToolTip("Move account to another group")}
            onClick={handleMove}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] hover:bg-background transition-all duration-200 text-secondary hover:text-primary"
            title={`Move ${bot.name} to another group`}
          >
            <MoveIcon className="w-[16px] h-[16px]" />
          </button>
          <button
            {...createToolTip("Assign proxy to account")}
            onClick={handleAssignProxy}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] hover:bg-background transition-all duration-200 text-secondary hover:text-primary"
            title={`Assign proxy to ${bot.name}`}
          >
            <ProxyIcon className="w-[16px] h-[16px]" />
          </button>
          <button
            {...createToolTip("Delete account")}
            onClick={handleDelete}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] hover:bg-red-600/20 transition-all duration-200 text-red-400 hover:text-red-300"
            title={`Delete ${bot.name}`}
          >
            <DeleteIcon className="w-[16px] h-[16px]" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export const AccountsComponent: FC = () => {
  const { group } = useGroupContext();
  const accountsRequest = useAccountsRequest();
  const modals = useModals();
  const toaster = useToaster();

  const {
    data: bots,
    isLoading,
    mutate,
  } = accountsRequest.groupsBots(group.id);

  const addAccount = useCallback(async () => {
    await accountsRequest.canAddAccount();
    modals.show({
      label: `Add Account to group: ${group.name}`,
      component: (close) => (
        <GroupContext.Provider value={{ group }}>
          <AddAccountComponent close={close} mutate={mutate} />
        </GroupContext.Provider>
      ),
    });
  }, [group.name, mutate]);

  const deleteBot = useCallback(
    async (botId: string) => {
      try {
        await accountsRequest.deleteBot(botId);
        await mutate(); // Refresh the list
        toaster.show("Account deleted successfully", "success");
      } catch (error) {
        console.error("Failed to delete account:", error);
        toaster.show("Failed to delete account", "warning");
      }
    },
    [accountsRequest, mutate, toaster],
  );

  const openWorkingHours = useCallback(
    (bot: Bot) => {
      modals.show({
        label: `Working Hours - ${bot.name}`,
        component: (close) => (
          <GroupContext.Provider value={{ group }}>
            <WorkingHoursComponent bot={bot} close={close} mutate={mutate} />
          </GroupContext.Provider>
        ),
      });
    },
    [group, mutate, modals],
  );

  const openMoveAccount = useCallback(
    (bot: Bot) => {
      modals.show({
        label: `Move Account - ${bot.name}`,
        component: (close) => (
          <GroupContext.Provider value={{ group }}>
            <MoveAccountComponent bot={bot} close={close} mutate={mutate} />
          </GroupContext.Provider>
        ),
      });
    },
    [group, mutate, modals],
  );

  const openAssignProxy = useCallback(
    (bot: Bot) => {
      modals.show({
        label: `Assign Proxy - ${bot.name}`,
        component: (close) => (
          <GroupContext.Provider value={{ group }}>
            <AssignProxyComponent bot={bot} close={close} mutate={mutate} />
          </GroupContext.Provider>
        ),
      });
    },
    [group, mutate, modals],
  );

  const toggleBotStatus = useCallback(
    async (botId: string, status: "ACTIVE" | "PAUSED") => {
      try {
        await accountsRequest.updateBotStatus(botId, status);
        await mutate(); // Refresh the list
        toaster.show(
          `Account ${status === "ACTIVE" ? "activated" : "paused"} successfully`,
          "success",
        );
      } catch (error) {
        console.error("Failed to update account status:", error);
        toaster.show("Failed to update account status", "warning");
      }
    },
    [accountsRequest, mutate, toaster],
  );

  if (isLoading) {
    return null;
  }

  return (
    <div className="bg-innerBackground overflow-hidden">
      {bots && bots.length > 0 && (
        <div className="border-b border-background px-[20px] pt-[20px]">
          <div className="flex items-center justify-end mb-[20px]">
            <Button
              onClick={addAccount}
              className="flex items-center gap-[8px] px-[12px] py-[8px] bg-background hover:bg-boxHover rounded-[6px] transition-all duration-200 text-[13px] font-[500] text-primary"
            >
              <PlusIcon />
              Add Account
            </Button>
          </div>
        </div>
      )}

      {bots && bots.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="border-b border-background">
              <th className="w-[80px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide" />
              <th className="py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                Account
              </th>
              <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                Platform
              </th>
              <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                Status
              </th>
              <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                Next Action
              </th>
              <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bots.map((bot: Bot) => (
              <BotRow
                key={bot.id}
                bot={bot}
                onDelete={deleteBot}
                onWorkingHours={openWorkingHours}
                onMove={openMoveAccount}
                onAssignProxy={openAssignProxy}
                onToggleStatus={toggleBotStatus}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="px-[20px] py-[40px] text-center">
          <div className="text-[14px] text-secondary mb-[16px]">
            No accounts added yet
          </div>
          <Button
            onClick={addAccount}
            className="flex items-center gap-[8px] mx-auto px-[16px] py-[10px] bg-background hover:bg-boxHover rounded-[6px] transition-all duration-200 text-[13px] font-[500] text-primary"
          >
            <PlusIcon />
            Add your first account
          </Button>
        </div>
      )}
    </div>
  );
};
