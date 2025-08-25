import { type FC, useCallback, useState } from "react";
import { useProxiesRequest } from "@growchief/frontend/requests/proxies.request.ts";
import { useModals } from "@growchief/frontend/utils/store.ts";
import { Select } from "@growchief/frontend/components/ui/select.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { Input } from "@growchief/frontend/components/ui/input.tsx";
import { LoadingComponent } from "@growchief/frontend/components/ui/loading.component.tsx";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import clsx from "clsx";
import { isIP } from "is-ip";
import isDomainName from "is-domain-name";

interface ProxyData {
  identifier: string;
  label: string;
}

// Validation functions using existing libraries
const isValidIPAddress = (input: string): boolean => {
  return isIP(input.trim());
};

const isValidDomain = (input: string): boolean => {
  return isDomainName(input.trim());
};

const isValidIPOrDomain = (input: string): boolean => {
  if (!input.trim()) return false;

  // Remove port if present (e.g., "127.0.0.1:8080" -> "127.0.0.1")
  const cleanInput = input.trim().split(":")[0];

  return isValidIPAddress(cleanInput) || isValidDomain(cleanInput);
};

const AddCustomProxy: FC<{
  close: () => void;
  onSuccess?: (proxyId: string) => void;
}> = ({ close, onSuccess }) => {
  const proxiesRequest = useProxiesRequest();
  const { createCustomProxy } = proxiesRequest;
  const [serverAddress, setServerAddress] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toaster = useToaster();

  // Check if server address has protocol
  const hasProtocol = /^(https?|ftp|ftps):\/\//i.test(serverAddress.trim());

  // Validate if server address is a valid IP or domain
  const isValidAddress = isValidIPOrDomain(serverAddress);
  const showValidationError =
    serverAddress.trim() && !hasProtocol && !isValidAddress;

  const createProxyFunction = useCallback(async () => {
    if (!serverAddress.trim() || !username.trim() || !password.trim()) {
      toaster.show("Please fill in all fields", "warning");
      return;
    }

    // Check for protocol in server address
    const hasProtocol = /^(https?|ftp|ftps):\/\//i.test(serverAddress.trim());
    if (hasProtocol) {
      toaster.show(
        "Please remove protocol (http://, https://, etc.) from server address",
        "warning",
      );
      return;
    }

    // Validate server address format
    if (!isValidIPOrDomain(serverAddress)) {
      toaster.show("Please enter a valid IP address or domain name", "warning");
      return;
    }

    setLoading(true);
    try {
      const result = await createCustomProxy(serverAddress, username, password);
      toaster.show("Custom proxy added successfully!", "success");
      if (onSuccess && result?.id) {
        onSuccess(result.id);
      }
      close();
    } catch (error) {
      toaster.show("Failed to add custom proxy", "warning");
    } finally {
      setLoading(false);
    }
  }, [
    serverAddress,
    username,
    password,
    createCustomProxy,
    close,
    toaster,
    onSuccess,
  ]);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <div className="min-h-[300px]">
      <div className="mb-[16px]">
        <h3 className="text-[16px] font-[600] text-primary mb-[4px]">
          Add Custom Proxy
        </h3>
        <p className="text-[12px] text-secondary">
          Enter your proxy server details
        </p>
      </div>

      <div className="space-y-[16px]">
        <div>
          <label className="block text-[14px] font-[500] text-primary mb-[6px]">
            Server Address
          </label>
          <Input
            type="text"
            placeholder="e.g., 192.168.1.100:8080 or proxy.example.com:8080"
            value={serverAddress}
            onChange={(e) => setServerAddress(e.target.value)}
            className={clsx(
              "w-full",
              (hasProtocol || showValidationError) &&
                "border-red-400 focus:border-red-400 focus:ring-red-400/20",
            )}
          />
          <p
            className={clsx(
              "text-[11px] mt-[4px]",
              hasProtocol || showValidationError
                ? "text-red-400"
                : "text-secondary/70",
            )}
          >
            {hasProtocol
              ? "❌ Remove protocol (http://, https://, etc.)"
              : showValidationError
                ? "❌ Enter a valid IP address or domain name"
                : "✅ Enter IP address or domain (e.g., 192.168.1.1 or proxy.example.com)"}
          </p>
        </div>

        <div>
          <label className="block text-[14px] font-[500] text-primary mb-[6px]">
            Username
          </label>
          <Input
            type="text"
            placeholder="Proxy username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-[14px] font-[500] text-primary mb-[6px]">
            Password
          </label>
          <Input
            type="password"
            placeholder="Proxy password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-[24px] flex items-center justify-end gap-[12px]">
        <Button variant="ghost" onClick={close}>
          Cancel
        </Button>
        <Button
          onClick={createProxyFunction}
          disabled={
            !serverAddress.trim() ||
            !username.trim() ||
            !password.trim() ||
            hasProtocol ||
            !!showValidationError
          }
        >
          Add Custom Proxy
        </Button>
      </div>
    </div>
  );
};

const AddProxy: FC<{
  identifier: string;
  close: () => void;
  onSuccess?: (proxyId: string) => void;
}> = ({ identifier, close, onSuccess }) => {
  const { data, isLoading } = useProxiesRequest().getCountries(identifier);
  const { createProxy } = useProxiesRequest();
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const toaster = useToaster();

  const createProxyFunction = useCallback(async () => {
    setLoading(true);
    try {
      const result = await createProxy(identifier, country);
      toaster.show("Proxy created successfully!", "success");
      if (onSuccess && result?.id) {
        onSuccess(result.id);
      }
      close();
    } catch (error) {
      close();
      toaster.show("Failed to create proxy", "warning");
    } finally {
      setLoading(false);
    }
  }, [country, identifier, createProxy, toaster, close, onSuccess]);

  if (isLoading || loading) {
    return <LoadingComponent />;
  }

  return (
    <div className="min-h-[300px]">
      <div className="text-[14px]">Select Proxy Country</div>
      <div className="py-[8px]">
        <Select onChange={(e) => setCountry(e.target.value)}>
          <option value="">-- Select --</option>
          {data?.map((p) => (
            <option value={p.identifier}>{p.label}</option>
          ))}
        </Select>
      </div>
      <div className="mt-[8px]">
        <Button disabled={!country} onClick={createProxyFunction}>
          Add Proxy
        </Button>
      </div>
    </div>
  );
};

const CustomProxyCard: FC<{
  close: () => void;
  mutate: (newProxyId?: string) => void;
}> = ({ close, mutate }) => {
  const modals = useModals();
  const addCustomProxy = useCallback(() => {
    modals.show({
      label: "Add Custom Proxy",
      component: (closeInner) => (
        <AddCustomProxy
          close={() => {
            closeInner();
            close();
          }}
          onSuccess={(proxyId) => {
            mutate(proxyId);
          }}
        />
      ),
    });
  }, [close, mutate, modals]);

  return (
    <div
      onClick={addCustomProxy}
      className="rounded-[8px] justify-center items-center border border-dashed border-secondary/30 hover:bg-boxHover hover:border-secondary/50 transition-all duration-200 w-[140px] h-[140px] p-[12px] flex flex-col cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col items-center gap-[8px] w-full">
          <div className="w-[48px] h-[48px] rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-secondary"
            >
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-[13px] font-[600] text-secondary leading-[1.2]">
              Custom Proxy
            </h3>
            <p className="text-[11px] text-secondary/70 mt-[2px]">
              Add your own
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProxyCard: FC<{
  platform: ProxyData;
  close: () => void;
  mutate: (newProxyId?: string) => void;
}> = ({ platform, close, mutate }) => {
  const platformSrc = `/proxies/${platform.identifier.toLowerCase()}.png`;
  const modals = useModals();
  const addProxy = useCallback(() => {
    modals.show({
      label: `Add proxy from ${platform.label}`,
      component: (closeInner) => (
        <AddProxy
          identifier={platform.identifier}
          close={() => {
            closeInner();
            close();
          }}
          onSuccess={(proxyId) => {
            mutate(proxyId);
          }}
        />
      ),
    });
  }, [platform.identifier, platform.label, close, mutate, modals]);

  return (
    <div
      onClick={addProxy}
      className="rounded-[8px] justify-center items-center border border-background hover:bg-boxHover transition-all duration-200 w-[140px] h-[140px] p-[12px] flex flex-col cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col items-center gap-[8px] w-full">
          <div className="w-[48px] h-[48px] rounded-full bg-background border border-background overflow-hidden flex items-center justify-center">
            <img
              src={platformSrc}
              alt={platform.label}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center">
            <h3 className="text-[13px] font-[600] text-primary leading-[1.2]">
              {platform.label}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};
export const AddProxyComponent: FC<{
  close: () => void;
  mutate: (newProxyId?: string) => void;
}> = ({ close, mutate }) => {
  const { data } = useProxiesRequest().getTypes();
  return (
    <>
      <div className="mb-[16px]">
        <h2 className="text-[16px] font-[600] text-primary mb-[4px]">
          Create a Proxy
        </h2>
        <p className="text-[12px] text-secondary">
          Select a provider to create your proxy
        </p>
      </div>
      <div className="flex flex-wrap gap-[12px]">
        <CustomProxyCard close={close} mutate={mutate} />
        {data?.map((p) => (
          <ProxyCard
            key={p.identifier}
            platform={p}
            close={close}
            mutate={mutate}
          />
        ))}
      </div>
    </>
  );
};
