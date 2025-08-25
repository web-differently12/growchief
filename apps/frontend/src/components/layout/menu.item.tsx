import type { FC, ReactNode } from "react";
import { Link, useLocation, matchPath } from "react-router";
import clsx from "clsx";

export const MenuItem: FC<{ label: string; to: string; icon: ReactNode }> = ({ label, to, icon }) => {
  const location = useLocation();

  // Exact on "/", prefix match for others
  const isActive =
    to === "/"
      ? location.pathname === "/"
      : !!matchPath({ path: to, end: false }, location.pathname);

  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={clsx(
        "rounded-[12px] transition-all text-[10px] font-[600] h-[54px] gap-[4px] flex flex-col justify-center items-center hover:text-text-menu hover:bg-menu",
        isActive && "text-text-menu bg-menu"
      )}
    >
      <div>{icon}</div>
      <div>{label}</div>
    </Link>
  );
};