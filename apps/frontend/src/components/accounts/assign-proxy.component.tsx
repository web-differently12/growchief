import { type FC, useCallback, useState } from "react";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { Select } from "@growchief/frontend/components/ui/select.tsx";
import { useAccountsRequest } from "@growchief/frontend/requests/accounts.request.ts";
import { useProxiesRequest } from "@growchief/frontend/requests/proxies.request.ts";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import type { Bot } from "@prisma/client";

interface AssignProxyComponentProps {
  bot: Bot;
  close: () => void;
  mutate: () => Promise<any>;
}

export const AssignProxyComponent: FC<AssignProxyComponentProps> = ({
  bot,
  close,
  mutate,
}) => {
  const accountsRequest = useAccountsRequest();
  const proxiesRequest = useProxiesRequest();
  const toaster = useToaster();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProxyId, setSelectedProxyId] = useState<string>("");

  // Get all available proxies
  const { data: proxies = [], isLoading: proxiesLoading } =
    proxiesRequest.getProxies();

  const handleAssign = useCallback(async () => {
    if (!selectedProxyId) {
      toaster.show("Please select a proxy", "warning");
      return;
    }

    setIsLoading(true);
    try {
      await accountsRequest.assignProxy(bot.id, selectedProxyId);
      const selectedProxy = proxies.find((p) => p.id === selectedProxyId);
      toaster.show(
        `Proxy ${selectedProxy?.ip} assigned to "${bot.name}" successfully`,
        "success"
      );
      await mutate();
      close();
    } catch (error) {
      console.error("Failed to assign proxy:", error);
      toaster.show("Failed to assign proxy", "warning");
    } finally {
      setIsLoading(false);
    }
  }, [
    bot.id,
    bot.name,
    selectedProxyId,
    accountsRequest,
    toaster,
    mutate,
    close,
    proxies,
  ]);

  const handleRemove = useCallback(async () => {
    setIsLoading(true);
    try {
      await accountsRequest.removeProxy(bot.id);
      toaster.show(`Proxy removed from "${bot.name}" successfully`, "success");
      await mutate();
      close();
    } catch (error) {
      console.error("Failed to remove proxy:", error);
      toaster.show("Failed to remove proxy", "warning");
    } finally {
      setIsLoading(false);
    }
  }, [bot.id, bot.name, accountsRequest, toaster, mutate, close]);

  // Find current proxy info if bot has one
  const currentProxy = bot.proxyId
    ? proxies.find((p) => p.id === bot.proxyId)
    : undefined;

  return (
    <div>
      <div className="mb-[24px]">
        <h2 className="text-[18px] font-[600] text-primary mb-[8px]">
          Proxy Assignment
        </h2>
        <p className="text-[14px] text-secondary">
          Assign a proxy to "{bot.name}" to route its connections through a
          specific server.
        </p>
      </div>

      {currentProxy && (
        <div className="mb-[24px]">
          <label className="block text-[14px] font-[500] text-primary mb-[8px]">
            Current Proxy
          </label>
          <div className="p-[12px] bg-background rounded-[6px] border border-input-border">
            <div className="flex items-center gap-[8px]">
              <span className="text-[14px] font-mono text-primary">
                {currentProxy.ip}
              </span>
              <span className="text-[12px] text-secondary">
                ({currentProxy.provider} - {currentProxy.country.toUpperCase()})
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-[24px]">
        <label className="block text-[14px] font-[500] text-primary mb-[8px]">
          {currentProxy ? "Change to Proxy" : "Assign Proxy"}
        </label>
        {proxiesLoading ? (
          <div className="p-[12px] bg-background rounded-[6px] border border-input-border">
            <span className="text-[14px] text-secondary">
              Loading proxies...
            </span>
          </div>
        ) : proxies.length > 0 ? (
          <Select
            value={selectedProxyId}
            onChange={(e) => setSelectedProxyId(e.target.value)}
            className="w-full"
          >
            <option value="">Select a proxy...</option>
            {proxies
              .filter((proxy) => proxy.id !== currentProxy?.id)
              .map((proxy) => (
                <option key={proxy.id} value={proxy.id}>
                  {proxy.ip} ({proxy.provider} - {proxy.country.toUpperCase()})
                </option>
              ))}
          </Select>
        ) : (
          <div className="p-[12px] bg-background rounded-[6px] border border-input-border">
            <span className="text-[14px] text-secondary italic">
              No proxies available. Configure proxies first.
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-[16px] border-t border-background">
        <div>
          {currentProxy && (
            <Button
              variant="ghost"
              onClick={handleRemove}
              disabled={isLoading}
              className="text-red-400 hover:text-red-300 hover:bg-red-600/20"
            >
              {isLoading ? "Removing..." : "Remove Proxy"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-[12px]">
          <Button variant="ghost" onClick={close} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isLoading || !selectedProxyId || proxies.length === 0}
          >
            {isLoading
              ? "Assigning..."
              : currentProxy
                ? "Change Proxy"
                : "Assign Proxy"}
          </Button>
        </div>
      </div>
    </div>
  );
};
