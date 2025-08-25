import { LoginForm } from "@growchief/frontend/components/auth/login.form";
import { Link } from "react-router";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-[20px]">
      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r">Welcome Back</h1>
      </div>
      <div className="bg-innerBackground rounded-[8px] p-[20px] pt-[0]">
        <LoginForm />
      </div>
      <p className="mt-[8px] text-sm text-secondary text-center">
        Don't have an account?{" "}
        <Link
          to="/auth/register"
          className="font-mediums text-primary hover:underline hover:font-[600] transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
