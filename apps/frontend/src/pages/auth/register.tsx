import { RegisterForm } from "@growchief/frontend/components/auth/register.form";
import { Link } from "react-router";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md space-y-[20px]">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
      </div>
      <div className="bg-innerBackground rounded-[8px] p-[20px] pt-0">
        <RegisterForm />
      </div>
      <p className="mt-[8px] text-sm text-secondary text-center">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-medium hover:underline text-primary transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
