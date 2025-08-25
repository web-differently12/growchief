import type { ReactNode } from "react";

export default function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-[100vh] flex justify-center items-center bg-background shadow-login">
      <div className="w-[500px] p-[30px] rounded-[8px] border border-[#1F1F1F] bg-innerBackground shadow-lg">
        <div className="w-full flex justify-center items-center gap-[10px] mb-[24px]">
          <img src="/logo.svg" alt="Logo" className="w-[60px]" />
          <div className="text-2xl font-bold mt-[2px] text-primary">
            GrowChief
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
