import { type FC, useCallback } from "react";
import {
  useProxiesRequest,
  type Proxy,
} from "@growchief/frontend/requests/proxies.request.ts";
import clsx from "clsx";
import { PlusIcon } from "@growchief/frontend/components/icons/plus.icon.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { useModals } from "@growchief/frontend/utils/store.ts";
import { AddProxyComponent } from "@growchief/frontend/components/proxies/add.proxy.component.tsx";
import { DeleteIcon } from "@growchief/frontend/components/icons/delete.icon.tsx";
import { useDecisionModal } from "@growchief/frontend/utils/use.decision.modal.tsx";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";

const StatusBadge: FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div
      className={clsx(
        "px-[8px] py-[2px] rounded-full text-[11px] font-[600] inline-flex items-center",
        isActive ? "bg-menu text-text-menu" : "bg-red-600/20 text-red-400"
      )}
    >
      <div
        className={clsx(
          "w-[6px] h-[6px] rounded-full mr-[6px]",
          isActive ? "bg-text-menu" : "bg-red-400"
        )}
      />
      {isActive ? "Connected" : "Not Connected"}
    </div>
  );
};

const ProxyRow: FC<{
  proxy: Proxy;
  onDelete: (proxyId: string) => Promise<void>;
}> = ({ proxy, onDelete }) => {
  // Get flag emoji for country code
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return "🌍";
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const decisionModal = useDecisionModal();

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      const confirmed = await decisionModal.open({
        label: "Delete Proxy",
        description: `Are you sure you want to delete proxy "${proxy.ip}"? This action cannot be undone and will unassign it from all accounts.`,
        approveLabel: "Delete",
        cancelLabel: "Cancel",
      });

      if (confirmed) {
        await onDelete(proxy.id);
      }
    },
    [proxy.id, proxy.ip, decisionModal, onDelete]
  );

  return (
    <tr className="hover:bg-boxHover transition-all duration-200 border-t border-background">
      <td className="px-[20px] py-[16px]">
        <div className="flex items-center gap-[12px]">
          <div className="text-[20px]">{getFlagEmoji(proxy.country)}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-[600] text-primary leading-[1.2] font-mono">
              {proxy.ip}
            </h3>
            <p className="text-[12px] text-secondary mt-[2px]">
              {proxy.country.toUpperCase()}
            </p>
          </div>
        </div>
      </td>
      <td className="px-[20px] py-[16px]">
        <div className="text-[13px] text-secondary capitalize">
          {proxy.provider}
        </div>
      </td>
      <td className="px-[20px] py-[16px]">
        <div className="flex items-center gap-[8px]">
          <StatusBadge isActive={proxy.botsCount > 0} />
          <span className="text-[12px] text-secondary">
            {proxy.botsCount} account{proxy.botsCount !== 1 ? "s" : ""}
          </span>
        </div>
      </td>
      <td className="px-[20px] py-[16px]">
        <div className="text-[13px] text-secondary">
          {formatDate(proxy.createdAt)}
        </div>
      </td>
      <td className="px-[20px] py-[16px]">
        {proxy.provider === "custom" && (
          <div className="flex items-center gap-[8px]">
            <button
              onClick={handleDelete}
              className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] hover:bg-red-600/20 transition-all duration-200 text-red-400 hover:text-red-300"
              title={`Delete proxy ${proxy.ip}`}
            >
              <DeleteIcon className="w-[16px] h-[16px]" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export const ProxiesComponent: FC = () => {
  const proxiesRequest = useProxiesRequest();
  const {
    data: proxies,
    isLoading,
    error,
    mutate,
  } = proxiesRequest.getProxies();
  const modals = useModals();
  const toaster = useToaster();

  const addProxy = useCallback(() => {
    modals.show({
      label: "Add Proxy",
      component: (close) => (
        <AddProxyComponent close={close} mutate={() => mutate()} />
      ),
    });
  }, [modals, mutate]);

  const deleteProxy = useCallback(
    async (proxyId: string) => {
      try {
        const response = await proxiesRequest.deleteCustomProxy(proxyId);
        if (response.error) {
          toaster.show(response.error, "warning");
          return;
        }
        await mutate(); // Refresh the list
        toaster.show("Proxy deleted successfully", "success");
      } catch (error) {
        console.error("Failed to delete proxy:", error);
        toaster.show("Failed to delete proxy", "warning");
      }
    },
    [proxiesRequest, mutate, toaster]
  );

  if (isLoading) {
    return (
      <div className="bg-innerBackground rounded-[8px] overflow-hidden">
        <div className="px-[20px] py-[40px] text-center">
          <div className="text-[14px] text-secondary">Loading proxies...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-innerBackground rounded-[8px] overflow-hidden">
        <div className="px-[20px] py-[40px] text-center">
          <div className="text-[14px] text-red-400">Failed to load proxies</div>
        </div>
      </div>
    );
  }

  if (!proxies || proxies.length === 0) {
    return (
      <div className="bg-innerBackground rounded-[8px] overflow-hidden px-[20px] pt-[20px]">
        <div className="px-[20px] py-[40px] text-center">
          <div className="text-[14px] text-secondary mb-[16px]">
            No proxies configured yet
          </div>
          <Button
            onClick={addProxy}
            className="flex items-center gap-[8px] mx-auto px-[16px] py-[10px] bg-background hover:bg-boxHover rounded-[6px] transition-all duration-200 text-[13px] font-[500] text-primary"
          >
            <PlusIcon />
            Add your first proxy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-innerBackground rounded-[8px] overflow-hidden ">
      {proxies && proxies.length > 0 && (
        <div className="border-b border-background px-[20px] pt-[20px]">
          <div className="flex items-center justify-end mb-[20px]">
            <Button
              onClick={addProxy}
              className="flex items-center gap-[8px] px-[12px] py-[8px] bg-background hover:bg-boxHover rounded-[6px] transition-all duration-200 text-[13px] font-[500] text-primary"
            >
              <PlusIcon />
              Add Proxy
            </Button>
          </div>
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr className="border-b border-background">
            <th className="py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide px-[20px]">
              Proxy
            </th>
            <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
              Provider
            </th>
            <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
              Status
            </th>
            <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
              Created
            </th>
            <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {proxies?.map((proxy) => (
            <ProxyRow key={proxy.id} proxy={proxy} onDelete={deleteProxy} />
          ))}
        </tbody>
      </table>

      {proxies.length > 0 && (
        <div className="py-[16px] border-t border-background px-[20px]">
          <div className="text-[13px] text-secondary">
            Total: {proxies.length} prox{proxies.length !== 1 ? "ies" : "y"}
          </div>
        </div>
      )}
    </div>
  );
};
