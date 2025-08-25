"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { ForgotPasswordDto } from "@growchief/shared-both/dto/auth/forgot.password.dto.ts";
import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { Input } from "@growchief/frontend/components/ui/input.tsx";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fetch = useFetch();
  const toast = useToaster();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: classValidatorResolver(ForgotPasswordDto),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordDto) {
    setIsLoading(true);

    try {
      // This would be implemented later with the backend
      // For now, we'll simulate a successful response
      const response = await fetch("/auth/forgot", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process request");
      }

      setIsSuccess(true);
      toast.show(
        "Check your inbox for password reset instructions.",
        "success",
      );
    } catch (error: any) {
      toast.show("Something went wrong. Please try again later.", "warning");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="p-6 bg-[#1A1A1A] border border-[#1F1F1F] rounded-md">
        <h3 className="text-lg font-medium text-white">Check your email</h3>
        <p className="mt-2 text-sm text-gray-400">
          We've sent you a password reset link. Please check your inbox.
        </p>
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsSuccess(false)}
          >
            Try again with a different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-300">
          Email Address
        </div>
        <div className="relative">
          <Input
            id="email"
            placeholder="m@example.com"
            type="email"
            className="bg-[#1A1A1A] border-[#1F1F1F] focus:border-[#FD7302] focus:ring-[#FD7302]/20 transition-all"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-[#FD7302]">{errors.email.message}</p>
        )}
      </div>

      <Button className="w-full" type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
