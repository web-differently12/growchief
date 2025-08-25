import EventEmitter from "events";
import { type FC, useEffect } from "react";
import useLocalStorage from "use-local-storage";
import { useNavigate } from "react-router";
import { showModalEmitter } from "@growchief/frontend/utils/modal.manager.tsx";
import { BillingModal } from "@growchief/frontend/components/billing/billing.modal.tsx";

export const emitter = new EventEmitter();

const fetchStatic = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const load = await fetch(
    (import.meta.env.VITE_BACKEND_URL || "/api") + input,
    {
      ...init,
      credentials: "include",
      headers: {
        ...init?.headers,
        "Content-Type": "application/json",
      },
    },
  );

  if (load.status === 401) {
    emitter.emit("event", { name: "logout" });
  }

  if (load.headers.get("logged")) {
    emitter.emit("event", { name: "login" });
  }

  if (load.status === 402) {
    const value = await load.json();
    showModalEmitter({
      label: "Payment required",
      component: (close) => (
        <BillingModal close={close} message={value.message} />
      ),
    });
    // @ts-ignore
    throw new Error("Payment required");
  }

  return load;
};

export const FetchComponent: FC = () => {
  const [_, setLogged] = useLocalStorage("logged", "false");
  const push = useNavigate();

  useEffect(() => {
    emitter.on("event", (eventName: { name: string; params?: any }) => {
      if (eventName.name === "logout") {
        setLogged("false");
        return;
      }

      if (eventName.name === "login") {
        setLogged("true");
        push("/");
        return;
      }
    });

    return () => {
      emitter.removeAllListeners();
    };
  }, []);

  return null;
};

export const useFetch = () => {
  return fetchStatic;
};
