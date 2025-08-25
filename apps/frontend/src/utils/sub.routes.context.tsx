import { createContext, useContext } from "react";
import type { RoutesType } from "@growchief/frontend/routes.tsx";

export const SubRoutesContext = createContext<{ routes?: RoutesType }>({});
export const useSubRoutes = () => useContext(SubRoutesContext);