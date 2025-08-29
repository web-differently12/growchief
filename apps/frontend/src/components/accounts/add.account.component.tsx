import { useGroupContext } from "@growchief/frontend/context/group.context.tsx";
import { usePlatforms } from "@growchief/frontend/requests/platform.request.ts";
import { useProxiesRequest } from "@growchief/frontend/requests/proxies.request.ts";
import type { FC } from "react";
import { useCallback, useState } from "react";
import { useModals } from "@growchief/frontend/utils/store.ts";
import type { BotGroup } from "@prisma/client";
import { BotLoginInsideButton } from "@growchief/frontend/components/accounts/login.screen.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { Select } from "@growchief/frontend/components/ui/select.tsx";
import { AddProxyComponent } from "@growchief/frontend/components/proxies/add.proxy.component.tsx";

interface Platform {
  name: string;
  identifier: string;
}

const ConnectPlatform: FC<{
  platform: Platform;
  group: BotGroup;
  close: () => void;
  mutate: () => void;
  proxyId?: string;
}> = ({ platform, group, close, mutate, proxyId }) => {
  return (
    <BotLoginInsideButton
      mutate={mutate}
      groupId={group.id}
      botId=""
      onClose={close}
      source="login"
      platform={platform.identifier}
      proxyId={proxyId}
    />
  );
};

const PlatformCard: FC<{
  platform: Platform;
  close: () => void;
  mutate: () => void;
  proxyId?: string;
}> = ({ platform, close, mutate, proxyId }) => {
  const { group } = useGroupContext();
  const modals = useModals();
  const platformSrc = `/socials/${platform.identifier.toLowerCase()}.png`;

  return (
    <div
      className="rounded-[8px] justify-center items-center border border-background hover:bg-boxHover transition-all duration-200 w-[140px] h-[140px] p-[12px] flex flex-col cursor-pointer"
      onClick={() => {
        close();
        modals.show({
          label: `Logging in into ${platform.name}, add your credentials once prompt`,
          width: "80%",
          component: (closeInner) => (
            <ConnectPlatform
              mutate={mutate}
              platform={platform}
              group={group}
              close={closeInner}
              proxyId={proxyId}
            />
          ),
        });
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col items-center gap-[8px] w-full">
          <div className="w-[48px] h-[48px] rounded-full bg-background border border-background overflow-hidden flex items-center justify-center">
            <img
              src={platformSrc}
              alt={platform.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center">
            <h3 className="text-[13px] font-[600] text-primary leading-[1.2]">
              {platform.name}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProxySelectionStep: FC<{
  onNext: (proxyId?: string) => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const proxiesRequest = useProxiesRequest();
  const { data: proxies = [], isLoading, mutate } = proxiesRequest.getProxies();
  const [selectedProxyId, setSelectedProxyId] = useState<string>("");
  const modals = useModals();

  const handleCreateProxy = useCallback(() => {
    modals.show({
      label: "Add Proxy",
      component: (close) => (
        <AddProxyComponent
          close={close}
          mutate={(newProxyId?: string) => {
            mutate(); // Refresh the proxies list
            if (newProxyId) {
              setSelectedProxyId(newProxyId); // Auto-select the new proxy
            }
          }}
        />
      ),
    });
  }, [modals, mutate]);

  if (isLoading) {
    return (
      <div className="px-[20px] py-[40px] text-center">
        <div className="text-[14px] text-secondary">Loading proxies...</div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-[20px] mb-[16px]">
        <h2 className="text-[16px] font-[600] text-primary mb-[4px]">
          Select Proxy (Optional)
        </h2>
        <p className="text-[12px] text-secondary">
          Choose a proxy for this account or skip to use no proxy
        </p>
        <p className="text-[12px] text-secondary">
          Please be advised that it is better to have the proxy during login and
          not later
        </p>
      </div>

      <div className="mb-[24px]">
        <div className="flex items-center justify-between mb-[8px]">
          <label className="block text-[14px] font-[500] text-primary">
            Proxy
          </label>
          {proxies.length > 0 && (
            <Button
              variant="ghost"
              onClick={handleCreateProxy}
              className="text-[12px] px-[8px] py-[4px] h-auto"
            >
              + Create New Proxy
            </Button>
          )}
        </div>

        {proxies.length === 0 ? (
          <div className="border border-background rounded-[6px] p-[16px] text-center bg-background/50">
            <div className="text-[13px] text-secondary mb-[8px]">
              No proxies configured yet
            </div>
            <div className="text-[11px] text-secondary/70 mb-[12px]">
              Create a proxy to enhance account security and avoid rate limits
            </div>
            <div className="flex justify-center">
              <Button onClick={handleCreateProxy}>
                Create Your First Proxy
              </Button>
            </div>
          </div>
        ) : (
          <Select
            value={selectedProxyId}
            onChange={(e) => setSelectedProxyId(e.target.value)}
            className="w-full"
          >
            <option value="">No proxy (direct connection)</option>
            {proxies.map((proxy) => (
              <option key={proxy.id} value={proxy.id}>
                {proxy.ip} ({proxy.provider} - {proxy.country.toUpperCase()})
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="flex items-center justify-between pt-[16px] border-t border-background">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => onNext(selectedProxyId || undefined)}>
          Continue
        </Button>
      </div>
    </>
  );
};

const PlatformSelectionStep: FC<{
  proxyId?: string;
  onBack: () => void;
  close: () => void;
  mutate: () => void;
}> = ({ proxyId, onBack, close, mutate }) => {
  const { group } = useGroupContext();
  const platforms = usePlatforms();
  const { data: platformList, isLoading } = platforms.list();

  if (isLoading || !platformList || platformList?.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-[16px]">
        <h2 className="text-[16px] font-[600] text-primary mb-[4px]">
          Choose a Platform
        </h2>
        <p className="text-[12px] text-secondary">
          Select a platform to add an account to {group?.name}
          {proxyId && " (using selected proxy)"}
        </p>
      </div>

      <div className="flex items-center justify-between mb-[16px]">
        <Button variant="ghost" className="!px-0" onClick={onBack}>
          Back to Proxy Selection
        </Button>
      </div>

      <div className="flex flex-wrap gap-[12px]">
        {platformList.map((platform: Platform) => (
          <PlatformCard
            mutate={() => {
              setTimeout(() => {
                mutate();
              }, 1000);
            }}
            key={platform.identifier}
            platform={platform}
            close={close}
            proxyId={proxyId}
          />
        ))}
      </div>
    </>
  );
};

export const AddAccountComponent: FC<{
  close: () => void;
  mutate: () => void;
}> = ({ close, mutate }) => {
  const [step, setStep] = useState<"proxy" | "platform">("proxy");
  const [selectedProxyId, setSelectedProxyId] = useState<string | undefined>();

  const handleProxyNext = useCallback((proxyId?: string) => {
    setSelectedProxyId(proxyId);
    setStep("platform");
  }, []);

  const handleBackToProxy = useCallback(() => {
    setStep("proxy");
  }, []);

  if (step === "proxy") {
    return <ProxySelectionStep onNext={handleProxyNext} onBack={close} />;
  }

  return (
    <PlatformSelectionStep
      proxyId={selectedProxyId}
      onBack={handleBackToProxy}
      close={close}
      mutate={mutate}
    />
  );
};
