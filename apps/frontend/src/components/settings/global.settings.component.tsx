import { useState } from "react";
import { useUser } from "@growchief/frontend/utils/store.ts";
import { Input } from "@growchief/frontend/components/ui/input.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";

export const GlobalSettingsComponent = () => {
  const user = useUser();
  const toaster = useToaster();
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  const handleCopyApiKey = async () => {
    if (!user?.org?.apiKey) return;

    try {
      await navigator.clipboard.writeText(user.org.apiKey);
      toaster.show("API key copied to clipboard!", "success");
    } catch (error) {
      toaster.show("Failed to copy API key", "warning");
    }
  };

  const toggleApiKeyVisibility = () => {
    setIsApiKeyVisible(!isApiKeyVisible);
  };

  const displayApiKey = () => {
    if (!user?.org?.apiKey) return "";

    if (isApiKeyVisible) {
      return user.org.apiKey;
    }

    // Show first 4 and last 4 characters with dots in between
    const key = user.org.apiKey;
    if (key.length <= 8) {
      return "•".repeat(key.length);
    }
    return `${key.slice(0, 4)}${"•".repeat(key.length - 8)}${key.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-primary mb-4">
          Global Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              API Key
            </label>
            <div className="text-[12px] mt-[4px] flex flex-col gap-[10px] mb-2">
              <a
                className="underline hover:font-bold hover:underline"
                href="https://docs.growchief.com/public-api"
                target="_blank"
              >
                Read how to use it over the documentation.
              </a>
              <a
                className="underline hover:font-bold hover:underline"
                href="https://www.npmjs.com/package/n8n-nodes-growchief"
                target="_blank"
              >
                Check out our N8N custom node for GrowChief.
              </a>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  value={displayApiKey()}
                  readOnly
                  className="pr-10 font-mono text-sm h-full"
                  placeholder="No API key available"
                />
                <button
                  onClick={toggleApiKeyVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                  title={isApiKeyVisible ? "Hide API key" : "Show API key"}
                >
                  {isApiKeyVisible ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              <Button
                onClick={handleCopyApiKey}
                variant="outline"
                size="sm"
                disabled={!user?.org?.apiKey}
                className="px-3 h-full"
                title="Copy API key"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
                Copy
              </Button>
            </div>
            <p className="text-xs text-secondary mt-1">
              Use this API key to authenticate with our services
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
