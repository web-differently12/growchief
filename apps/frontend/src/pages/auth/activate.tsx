import { ActivateForm } from "@growchief/frontend/components/auth/activate.form.tsx";

export default function ActivatePage() {
  return (
    <div className="w-full max-w-md space-y-[20px]">
      <div className="text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#612BD3] to-[#8B5CF6] bg-clip-text text-transparent">
          Activate your account
        </h1>
        <p className="mt-[8px] text-sm text-secondary">
          Enter the activation code sent to your email
        </p>
      </div>
      <div className="bg-innerBackground rounded-[8px] p-[20px] border border-[#1F1F1F]">
        <ActivateForm />
      </div>
    </div>
  );
}
