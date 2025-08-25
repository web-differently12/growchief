"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { ResetPasswordFormDto } from "@growchief/shared-both/dto/auth/reset-password.form.dto.ts";
import { useFetch } from "@growchief/frontend/utils/use.fetch";
import { useNavigate } from "react-router";
import { useToaster } from "@growchief/frontend/utils/use.toaster";
import { Input } from "@growchief/frontend/components/ui/input.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";

export function ResetPasswordForm({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const fetch = useFetch();
  const push = useNavigate();
  const toast = useToaster();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: classValidatorResolver(ResetPasswordFormDto),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormDto) {
    setIsLoading(true);

    try {
      // This would be implemented later with the backend
      // For now, we'll simulate a successful response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // The real implementation would call the API endpoint:
      await fetch("/auth/forgot-return", {
        method: "POST",
        body: JSON.stringify({
          token,
          password: data.password,
          repeatPassword: data.confirmPassword,
        }),
      });

      toast.show("Password reset successful", "success");

      push("/auth/login");
    } catch (error) {
      toast.show("Something went wrong. Please try again later.", "warning");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-300">
          New Password
        </div>
        <div className="relative">
          <Input
            id="password"
            type="password"
            className="bg-[#1A1A1A] border-[#1F1F1F] focus:border-[#FD7302] focus:ring-[#FD7302]/20 transition-all"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-[#FD7302]">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div
          className="text-sm font-medium text-gray-300"
        >
          Confirm Password
        </div>
        <div className="relative">
          <Input
            id="confirmPassword"
            type="password"
            className="bg-[#1A1A1A] border-[#1F1F1F] focus:border-[#FD7302] focus:ring-[#FD7302]/20 transition-all"
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-[#FD7302]">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}
