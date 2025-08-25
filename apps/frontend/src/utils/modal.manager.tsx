import {
  type FC,
  memo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  useBearStore,
  type ModalManagerInterface,
} from "@growchief/frontend/utils/store.ts";
import { useShallow } from "zustand/react/shallow";
import { CloseIcon } from "@growchief/frontend/components/icons/close.icon.tsx";
import { useHotkeys } from "react-hotkeys-hook";
import { useDecisionModal } from "@growchief/frontend/utils/use.decision.modal.tsx";
import clsx from "clsx";
import EventEmitter from "events";

export const Component: FC<{
  closeModal: (id: string) => void;
  zIndex: number;
  isLast: boolean;
  modal: { id: string } & ModalManagerInterface;
}> = memo(({ isLast, modal, closeModal, zIndex }) => {
  const decision = useDecisionModal();
  const closeModalFunction = useCallback(async () => {
    if (modal.askClose) {
      const open = await decision.open();
      if (!open) {
        return;
      }
    }
    modal?.beforeClose?.();
    closeModal(modal.id);
  }, [modal.id, closeModal]);

  const RenderComponent = useMemo(() => {
    return modal.component(closeModalFunction);
  }, [modal, closeModalFunction]);

  useHotkeys(
    "Escape",
    () => {
      if (isLast) {
        closeModalFunction();
      }
    },
    [isLast, closeModalFunction],
  );

  return (
    <div
      onClick={closeModalFunction}
      style={{ zIndex }}
      className="fixed flex left-0 top-0 min-w-full min-h-full bg-popup transition-all animate-fadeIn overflow-y-auto pb-[50px]"
    >
      <div className="relative flex-1">
        <div className="absolute top-0 left-0 min-w-full min-h-full pt-[100px] pb-[100px]">
          <div
            className={clsx(
              "gap-[40px] p-[32px] bg-innerBackground mx-auto flex flex-col w-fit left-[50%] rounded-[24px]",
              modal.width ? "" : "min-w-[600px]",
            )}
            {...(modal.width && { style: { width: modal.width } })}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center">
              <div className="text-[24px] font-[600] flex-1">{modal.label}</div>
              <div onClick={closeModalFunction} className="cursor-pointer">
                <CloseIcon />
              </div>
            </div>
            <div className="whitespace-pre-line">{RenderComponent}</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const ModalManagerInner: FC = () => {
  const { closeModal, modalManager } = useBearStore(
    useShallow((state) => ({
      closeModal: state.closeModal,
      modalManager: state.modalManager,
    })),
  );

  useEffect(() => {
    if (modalManager.length > 0) {
      document.querySelector("body")?.classList.add("overflow-hidden");
      Array.from(document.querySelectorAll(".blurMe") || []).map((p) =>
        p.classList.add("blur-xs", "pointer-events-none"),
      );
    } else {
      document.querySelector("body")?.classList.remove("overflow-hidden");
      Array.from(document.querySelectorAll(".blurMe") || []).map((p) =>
        p.classList.remove("blur-xs", "pointer-events-none"),
      );
    }
  }, [modalManager]);

  if (modalManager.length === 0) {
    return null;
  }

  return (
    <>
      {modalManager.map((modal, index) => (
        <Component
          isLast={modalManager.length - 1 === index}
          key={modal.id}
          modal={modal}
          zIndex={200 + index}
          closeModal={closeModal}
        />
      ))}
    </>
  );
};
export const ModalManager: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <ModalManagerEmitter />
      <ModalManagerInner />
      <div className="transition-all flex flex-1 blurMe">{children}</div>
    </>
  );
};

const emitter = new EventEmitter();
export const showModalEmitter = (params: ModalManagerInterface) => {
  emitter.emit("show", params);
};

export const ModalManagerEmitter: FC = () => {
  const { showModal } = useBearStore(
    useShallow((state) => ({
      showModal: state.showModal,
    })),
  );

  useEffect(() => {
    emitter.on("show", (params: ModalManagerInterface) => {
      showModal(params);
    });

    return () => {
      emitter.removeAllListeners("show");
    };
  }, []);
  return null;
};
