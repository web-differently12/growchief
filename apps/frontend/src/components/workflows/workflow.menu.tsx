import { useBearStore } from "@growchief/frontend/utils/store.ts";
import { useShallow } from "zustand/react/shallow";
import { useCallback, useEffect } from "react";
import { CloseIcon } from "@growchief/frontend/components/icons/close.icon.tsx";
import { useReactFlow } from "@xyflow/react";
import { selectedEmitter } from "@growchief/frontend/components/workflows/workflow.node.wrapper.tsx";
import clsx from "clsx";

export const useMenu = () => {
  const { setMenu, menu } = useBearStore(
    useShallow((state) => ({ menu: state.menu, setMenu: state.setMenu })),
  );

  const { setNodes } = useReactFlow();

  const show = useCallback((state: boolean) => {
    setMenu(state);
  }, []);

  const close = useCallback(() => {
    setMenu(false);
    selectedEmitter.emit("selectNode", null);
    setNodes((nodes) => nodes.map((node) => ({ ...node, selected: false })));
  }, []);

  const toggle = useCallback(() => {
    if (menu) {
      return close();
    }
    show(true);
  }, [menu]);

  return { show, close, toggle };
};

export const WorkflowMenu = () => {
  const menu = useBearStore((state) => state.menu);
  const { close } = useMenu();

  useEffect(() => {
    return () => {
      close();
    }
  }, []);

  return (
    <div
      className={clsx(
        "select-none render-settings absolute right-0 top-0 h-full w-[300px] z-[100] bg-innerBackground border-l border-l-background overflow-hidden",
        !menu ? "animate-to-right pointer-events-none" : "animate-from-right",
      )}
    >
      <div
        className="flex justify-end pt-[10px] pr-[10px] cursor-pointer"
        onClick={close}
      >
        <CloseIcon />
      </div>
      <div id="menu-options" />
    </div>
  );
};
