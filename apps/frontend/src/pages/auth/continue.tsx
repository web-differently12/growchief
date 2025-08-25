"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import { Input } from "@growchief/frontend/components/ui/input.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";

export default function ActivatePage() {
  const [params] = useSearchParams();
  const fetch = useFetch();
  const provider = params.get("provider");
  const website = params.get("website");
  const state = params.get("state");
  const code = params.get("code");
  const toast = useToaster();

  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);

  const fetchToken = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await (
        await fetch(`/auth/oauth/${provider}/exists`, {
          method: "POST",
          body: JSON.stringify({
            state,
            code,
            website,
            provider,
          }),
        })
      ).json();

      if (data.token) {
        setTokenData(data);
      } else {
        setError("Failed to authenticate with provider");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      toast.show("Failed to authenticate with provider.", "warning");
    } finally {
      setIsLoading(false);
    }
  }, [state, code, website, provider, fetch]);

  const register = useCallback(async () => {
    if (!company.trim() || !tokenData?.token) return;

    setIsLoading(true);
    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          provider,
          providerToken: tokenData.token,
          website,
          company,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        setError(errorData || "Registration failed");
        return;
      }

      setIsRegistered(true);
    } catch (error) {
      setError("Registration failed. Please try again.");
      toast.show(
        "Something went wrong with the server. Please try again later.",
        "warning"
      );
    } finally {
      setIsLoading(false);
    }
  }, [company, tokenData, provider, website, fetch]);

  // Fetch token on first load if not already fetched
  useEffect(() => {
    if (!tokenData && !isLoading) {
      fetchToken();
    }
  }, []);

  if (isRegistered) {
    return (
      <div className="w-full max-w-md space-y-[20px]">
        <div className="p-[20px] bg-innerBackground border border-[#1F1F1F] rounded-[8px] text-center">
          <h2 className="text-xl font-semibold mb-[8px] text-[#612BD3]">
            Registration Successful!
          </h2>
          <p className="text-secondary">
            Your account has been created successfully.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && !tokenData) {
    return (
      <div className="w-full max-w-md space-y-[20px]">
        <div className="py-[20px] flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FD7302]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-[20px]">
      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#612BD3] to-[#8B5CF6] bg-clip-text text-transparent">
          Complete Your Registration
        </h1>
      </div>
      <div className="p-[20px] bg-innerBackground border border-[#1F1F1F] rounded-[8px]">
        {error && (
          <div className="p-[12px] mb-[16px] bg-[#2C0D00] border border-[#FD7302]/30 rounded-[8px]">
            <p className="text-sm text-[#FD7302]">{error}</p>
          </div>
        )}

        <div className="space-y-[16px]">
          <div className="space-y-[8px]">
            <div className="text-sm font-medium text-secondary">
              Company Name
            </div>
            <div className="relative">
              <Input
                id="company"
                placeholder="Enter your company name"
                type="text"
                className="bg-innerBackground border-[#1F1F1F] focus:border-[#FD7302] focus:ring-[#FD7302]/20 transition-all"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {company.trim() === "" && (
              <p className="text-sm text-[#FD7302]">Company name is required</p>
            )}
          </div>

          <Button
            className="w-full"
            disabled={isLoading || company.trim() === ""}
            onClick={register}
          >
            {isLoading ? "Registering..." : "Complete Registration"}
          </Button>
        </div>
      </div>
    </div>
  );
}
