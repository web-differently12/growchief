import type { FC } from "react";
import { useState } from "react";
import { useUser } from "@growchief/frontend/utils/store.ts";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import { Input } from "@growchief/frontend/components/ui/input.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import clsx from "clsx";

type ExampleTab = "organization" | "email" | "urls";

export const GetCodeComponent: FC<{ close: () => void; id: string }> = ({
  close,
  id,
}) => {
  const user = useUser();
  const toaster = useToaster();
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<ExampleTab>("organization");

  // Get the current domain for the API URL
  const getCurrentDomain = () => {
    if (import.meta.env.VITE_BACKEND_URL) {
      return import.meta.env.VITE_BACKEND_URL;
    }
    return window.location.origin + "/api";
  };

  const workflowUrl = `${getCurrentDomain()}/public/workflow/${id}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(workflowUrl);
      toaster.show("Workflow URL copied to clipboard!", "success");
    } catch (error) {
      toaster.show("Failed to copy URL", "warning");
    }
  };

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

  const getExampleData = (tab: ExampleTab) => {
    switch (tab) {
      case "organization":
        return JSON.stringify(
          {
            organization_name: "Example Corp",
            firstName: "John",
            lastName: "Doe",
          },
          null,
          2
        );
      case "email":
        return JSON.stringify(
          {
            email: "john.doe@example.com",
          },
          null,
          2
        );
      case "urls":
        return JSON.stringify(
          {
            urls: ["https://x.com/johndoe", "https://linkedin.com/in/johndoe"],
          },
          null,
          2
        );
    }
  };

  const getTabDescription = (tab: ExampleTab) => {
    switch (tab) {
      case "organization":
        return "Use when you have organization and person details";
      case "email":
        return "Use when you only have an email address";
      case "urls":
        return "Use when you have profile URLs or social media links";
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div>
        <h3 className="text-lg font-semibold text-primary mb-4">
          Workflow API Endpoint
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Workflow URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  value={workflowUrl}
                  readOnly
                  className="font-mono text-sm"
                  placeholder="Workflow URL will appear here"
                />
              </div>
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                size="sm"
                className="px-3 h-full"
                title="Copy workflow URL"
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
              Use this URL to trigger your workflow via API calls. Send POST
              requests to this endpoint.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              API Key
            </label>
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
              Include this API key in your request headers for authentication
            </p>
          </div>

          <div className="bg-innerBackground pt-4 rounded-lg">
            <h4 className="text-sm font-semibold text-primary mb-4">
              Example Usage
            </h4>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-4">
              {(["organization", "email", "urls"] as ExampleTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                      "px-3 py-2 text-xs font-medium rounded-md transition-colors",
                      activeTab === tab
                        ? "bg-btn-primary text-white"
                        : "bg-background text-secondary hover:text-primary hover:bg-innerBackgroundHover"
                    )}
                  >
                    {tab === "organization"
                      ? "Organization"
                      : tab === "email"
                        ? "Email"
                        : "URLs"}
                  </button>
                )
              )}
            </div>

            {/* Tab Description */}
            <p className="text-xs text-secondary mb-3">
              {getTabDescription(activeTab)}
            </p>

            {/* cURL Example */}
            <div className="bg-background p-3 rounded border">
              <pre className="text-xs text-secondary overflow-x-auto">
                {`curl -X POST "${workflowUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: ${displayApiKey()}" \\
  -d '${getExampleData(activeTab)}'`}
              </pre>
            </div>

            {/* JSON Example */}
            <div className="mt-3">
              <h5 className="text-xs font-medium text-primary mb-2">
                JSON Payload:
              </h5>
              <div className="bg-background p-3 rounded border">
                <pre className="text-xs text-secondary overflow-x-auto">
                  {getExampleData(activeTab)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-input-border">
        <Button onClick={close} variant="outline">
          Close
        </Button>
      </div>
    </div>
  );
};
