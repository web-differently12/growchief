import { ForgotPasswordForm } from "@growchief/frontend/components/auth/forgot-password.form.tsx";
import { Link } from "react-router";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-[20px]">
      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#612BD3] to-[#8B5CF6] bg-clip-text text-transparent">
          Forgot Password
        </h1>
        <p className="mt-[8px] text-sm text-secondary">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>
      <div className="bg-innerBackground rounded-[8px] p-[20px] border border-[#1F1F1F]">
        <ForgotPasswordForm />
      </div>
      <div className="text-center">
        <p className="text-sm text-secondary">
          Remembered your password?{" "}
          <Link
            to="/auth/login"
            className="font-medium text-[#612BD3] hover:text-[#612BD3]/80 transition-colors"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
