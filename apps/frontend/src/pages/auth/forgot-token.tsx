"use client";

import { Link, useParams } from "react-router";
import { ResetPasswordForm } from "@growchief/frontend/components/auth/reset-password.form.tsx";

export default function ResetPasswordPage() {
  const searchParams = useParams();
  const token = (searchParams.token as string) || "";

  if (!token) {
    return (
      <div className="w-full max-w-md space-y-[20px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#612BD3] to-[#8B5CF6] bg-clip-text text-transparent">
            Invalid Link
          </h1>
        </div>
        <div className="p-[20px] bg-innerBackground border border-[#1F1F1F] rounded-[8px]">
          <p className="text-sm text-secondary mb-[16px]">
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/auth/forgot-password"
            className="inline-block w-full text-center py-[12px] px-[16px] rounded-[8px] bg-btn-primary hover:bg-btn-primary/90 text-white transition-colors"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-[20px]">
      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FD7302] to-[#FBB072] bg-clip-text text-transparent">
          Reset Password
        </h1>
        <p className="mt-[8px] text-sm text-secondary">
          Create a new password for your account
        </p>
      </div>
      <div className="bg-innerBackground rounded-[8px] p-[20px] border border-[#1F1F1F]">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
