import { useEffect } from "react";
import useLocalStorage from "use-local-storage";

export const ModeIcon = () => {
  const [mode, setMode] = useLocalStorage("mode", "dark");

  useEffect(() => {
    if (mode === "dark") {
      document.querySelector("body")?.classList?.remove("light");
      return;
    }

    document.querySelector("body")?.classList?.add("light");

    return () => {
      document.querySelector("body")?.classList?.remove("light");
    };
  }, [mode]);

  if (mode == "light") {
    return (
      <svg
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="cursor-pointer"
        onClick={() => setMode("dark")}
      >
        <path
          d="M22.1253 12.9011C20.7971 15.231 18.2902 16.8019 15.4164 16.8019C11.1543 16.8019 7.6992 13.3468 7.6992 9.08473C7.6992 6.21071 9.27029 3.70363 11.6005 2.37549C6.70537 2.83962 2.87598 6.96182 2.87598 11.9784C2.87598 17.306 7.19484 21.6248 12.5224 21.6248C17.5388 21.6248 21.6608 17.7959 22.1253 12.9011Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      className="cursor-pointer"
      onClick={() => setMode("light")}
    >
      <path
        d="M12.5 2V4M12.5 20V22M4.5 12H2.5M6.81412 6.31412L5.3999 4.8999M18.1859 6.31412L19.6001 4.8999M6.81412 17.69L5.3999 19.1042M18.1859 17.69L19.6001 19.1042M22.5 12H20.5M17.5 12C17.5 14.7614 15.2614 17 12.5 17C9.73858 17 7.5 14.7614 7.5 12C7.5 9.23858 9.73858 7 12.5 7C15.2614 7 17.5 9.23858 17.5 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
