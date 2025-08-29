import type { FC, ReactNode } from "react";
import { Link, useLocation, matchPath } from "react-router";
import clsx from "clsx";

export const MenuItem: FC<{
  label: string;
  to: string;
  icon: ReactNode;
  onClick?: () => void;
}> = ({ label, to, icon, onClick }) => {
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
      onClick={onClick}
      className={clsx(
        "rounded-[12px] transition-all font-[600] gap-[4px] flex justify-center items-center hover:text-text-menu hover:bg-menu",
        // Mobile: horizontal layout with text, Desktop: vertical layout
        "lg:flex-col lg:h-[54px] lg:text-[10px] max-lg:justify-start",
        "flex-row h-[48px] text-[14px] px-[16px] lg:px-0",
        isActive && "text-text-menu bg-menu"
      )}
    >
      <div className="lg:text-inherit text-[20px]">{icon}</div>
      <div className="lg:block lg:text-center ml-3 lg:ml-0">{label}</div>
    </Link>
  );
};
