"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useFetch } from "@growchief/frontend/utils/use.fetch";
import { RegisterFormDto } from "@growchief/shared-both/dto/auth/register.form.dto.ts";
import { useToaster } from "@growchief/frontend/utils/use.toaster";
import { Input } from "@growchief/frontend/components/ui/input.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { LoginButton } from "@growchief/frontend/components/auth/login.button.tsx";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const fetch = useFetch();
  const toast = useToaster();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: classValidatorResolver(RegisterFormDto),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      company: "",
    },
  });

  async function onSubmit(data: RegisterFormDto) {
    setIsLoading(true);
    setAuthError(null);
    setUserEmail(data.email);

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          website: new URL(window.location.href).href,
          provider: "LOCAL",
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        setAuthError(errorData || "Registration failed");
        return;
      }

      setRegistrationSuccess(true);
    } catch (error) {
      toast.show(
        "Something went wrong with the server. Please try again later.",
        "warning",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (registrationSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="p-4 bg-[#1A1A1A] border border-[#1F1F1F] rounded-md">
          <h2 className="text-xl font-semibold mb-2 text-[#612BD3]">
            Account Created Successfully!
          </h2>
          <p className="text-gray-300 mb-4">
            We've sent an activation link to{" "}
            <span className="font-medium">{userEmail}</span>
          </p>
          <p className="text-sm text-gray-400">
            Please check your email and click the activation link to complete
            your registration.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Didn't receive an email? Check your spam folder or{" "}
          <button
            onClick={() => setRegistrationSuccess(false)}
            className="text-[#612BD3] hover:text-[#612BD3]/80 underline"
          >
            try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoginButton provider="GOOGLE">
        <div className="grid grid-cols-1 gap-3 mb-[20px]">
          <button
            type="button"
            className="flex items-center justify-center py-2 px-4 bg-white rounded-md border text-black transition-colors"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Continue with Google
          </button>
        </div>
      </LoginButton>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {authError && (
          <div className="p-3 bg-[#2C0D00] border border-[#FD7302]/30 rounded-md">
            <p className="text-sm text-[#FD7302]">{authError}</p>
          </div>
        )}
        <div className="space-y-2">
          <div className="text-sm font-medium">Email</div>
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
        <div className="space-y-2">
          <div className="text-sm font-medium">Password</div>
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
          <div className="text-sm font-medium">
            Confirm Password
          </div>
          <div className="relative">
            <Input
              id="confirm-password"
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
        <div className="space-y-2">
          <div className="text-sm font-medium">Company</div>
          <div className="relative">
            <Input
              id="company"
              placeholder="Your company name"
              type="text"
              className="bg-[#1A1A1A] border-[#1F1F1F] focus:border-[#FD7302] focus:ring-[#FD7302]/20 transition-all"
              {...register("company")}
            />
          </div>
          {errors.company && (
            <p className="text-sm text-[#FD7302]">{errors.company.message}</p>
          )}
        </div>

        <div className="pt-2">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </div>
      </form>
    </>
  );
}
