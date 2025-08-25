"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";

export default function ActivateTokenPage() {
  const [isActivating, setIsActivating] = useState(true);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [error, setError] = useState("");
  const params = useParams();
  const push = useNavigate();
  const fetch = useFetch();
  const token = params.token as string;

  useEffect(() => {
    async function activateAccount() {
      try {
        const response = await fetch("/auth/activate", {
          method: "POST",
          body: JSON.stringify({ code: token }),
        });

        const data = await response.json();

        setIsActivating(false);

        if (data.can) {
          setActivationSuccess(true);
          // Redirect to dashboard after successful activation
          setTimeout(() => {
            push("/");
          }, 2000);
        } else {
          setError("Invalid or expired activation link. Please try again.");
        }
      } catch (error) {
        setIsActivating(false);
        setError("An error occurred during activation. Please try again.");
      }
    }

    if (token) {
      activateAccount();
    } else {
      setIsActivating(false);
      setError("Invalid activation link");
    }
  }, [token, fetch, push]);

  return (
    <div className="w-full max-w-md space-y-[20px]">
      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#612BD3] to-[#8B5CF6] bg-clip-text text-transparent">
          Account Activation
        </h1>
      </div>

      <div className="p-[20px] bg-innerBackground border border-[#1F1F1F] rounded-[8px] text-center">
        {isActivating && (
          <>
            <div className="py-[16px] flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FD7302]"></div>
            </div>
            <p className="text-secondary">Activating your account...</p>
          </>
        )}

        {!isActivating && activationSuccess && (
          <>
            <h2 className="text-xl font-semibold mb-[8px] text-[#612BD3]">
              Account Activated!
            </h2>
            <p className="text-secondary">
              Your account has been successfully activated. Redirecting to
              dashboard...
            </p>
          </>
        )}

        {!isActivating && error && (
          <div className="justify-center flex flex-col">
            <h2 className="text-xl font-semibold mb-[8px] text-red-500">
              Activation Failed
            </h2>
            <p className="text-secondary mb-[16px]">{error}</p>
            <Button
              onClick={() => push("/auth/register")}
              className="bg-btn-primary hover:bg-btn-primary/90"
            >
              Back to Registration
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
