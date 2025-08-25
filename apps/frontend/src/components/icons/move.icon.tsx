import type { FC } from "react";

export const MoveIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 2L10 4H9V7H12V6L14 8L12 10V9H9V12H10L8 14L6 12H7V9H4V10L2 8L4 6V7H7V4H6L8 2Z"
        fill="currentColor"
      />
    </svg>
  );
};
