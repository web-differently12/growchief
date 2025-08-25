import { createContext, useContext } from "react";
import type { BotGroup } from "@prisma/client";

// @ts-ignore
export const GroupContext = createContext({ group: null as BotGroup });
export const useGroupContext = () => useContext(GroupContext);
