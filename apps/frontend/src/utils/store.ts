import { create } from "zustand";
import type { ReactNode } from "react";
import { makeId } from "@growchief/shared-both/utils/make.id.ts";

export interface User {
  id: string;
  email: string;
  roles: any;
  selfhosted: boolean;
  isSuperAdmin: boolean;
  viewas: string;
  org: {
    id: string;
    subscription: any;
    apiKey: string;
    users: [{ role: "USER" | "ADMIN" | "SUPERADMIN" }];
  };
  mutate: () => void;
}

export interface ModalManagerInterface {
  label: string;
  askClose?: boolean;
  width?: string | number;
  beforeClose?: () => Promise<any> | any;
  component: (close: () => void) => ReactNode;
}

interface State {
  menu: boolean;
  setMenu: (menu: boolean) => void;
  modalManager: Array<{ id: string } & ModalManagerInterface>;
  user?: User;
  setUser: (user?: User) => void;
  showModal: (params: ModalManagerInterface) => void;
  closeModal: (id: string) => void;
}

export const useBearStore = create<State>((set) => ({
  menu: false,
  modalManager: [],
  user: undefined,
  setUser: (user) => set({ user }),
  showModal: (params) =>
    set((state) => ({
      modalManager: [...state.modalManager, { id: makeId(20), ...params }],
    })),
  closeModal: (id) =>
    set((state) => ({
      modalManager: state.modalManager.filter((modal) => modal.id !== id),
    })),
  setMenu: (menu) => set({ menu: menu }),
}));

export const useModals = () => {
  return { show: useBearStore((state) => state.showModal) };
};

export const useUser = () => useBearStore((state) => state.user);
