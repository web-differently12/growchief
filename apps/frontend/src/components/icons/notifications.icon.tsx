import { forwardRef } from "react";

export const NotificationsIcon = forwardRef<
  SVGSVGElement,
  {
    exists: boolean;
    onClick: () => void;
  }
>(({ exists, onClick }, ref) => {
  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer"
      onClick={onClick}
      ref={ref}
    >
      <path
        d="M14.4998 21H10.4998M18.4998 8C18.4998 6.4087 17.8676 4.88258 16.7424 3.75736C15.6172 2.63214 14.0911 2 12.4998 2C10.9085 2 9.38235 2.63214 8.25713 3.75736C7.13192 4.88258 6.49977 6.4087 6.49977 8C6.49977 11.0902 5.72024 13.206 4.84944 14.6054C4.1149 15.7859 3.74763 16.3761 3.7611 16.5408C3.77601 16.7231 3.81463 16.7926 3.96155 16.9016C4.09423 17 4.69237 17 5.88863 17H19.1109C20.3072 17 20.9053 17 21.038 16.9016C21.1849 16.7926 21.2235 16.7231 21.2384 16.5408C21.2519 16.3761 20.8846 15.7859 20.1501 14.6054C19.2793 13.206 18.4998 11.0902 18.4998 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {exists && <circle cx="17.5625" cy="5" r="4" fill="#FB3FD9" />}
    </svg>
  );
});
