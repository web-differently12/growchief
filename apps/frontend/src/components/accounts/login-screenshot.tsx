"use client";

import { useEffect } from "react";
import type { FC, MouseEvent } from "react";
import { clsx } from "clsx";
import { timer } from "@growchief/shared-both/utils/timer.ts";

interface BotLoginScreenshotProps {
  imageData: string;
  identifier: string;
  source: string;
  emit: (data: any) => void;
  onClose: () => void;
}

const NoScroll: FC = () => {
  useEffect(() => {
    document.body.classList.add("no-scroll");
    document.documentElement.classList.add("no-scroll");
    document?.querySelector?.(".popup-dialog")?.classList?.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
      document.documentElement.classList.remove("no-scroll");
    };
  }, []);

  return null;
};

const Keyboard: FC<{
  keyboardPress: (key: string) => void;
}> = (props) => {
  useEffect(() => {
    const func = async (e: any) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        try {
          // Read clipboard content
          const clipboardText = await navigator.clipboard.readText();

          // Iterate through each character and send individual keypress events
          for (let i = 0; i < clipboardText.length; i++) {
            const char = clipboardText[i];
            // Simulate typing each character
            props.keyboardPress(char);

            // Add a small delay between characters to avoid overwhelming the system
            await timer(10);
          }
        } catch (error) {
          console.error("Failed to read clipboard:", error);
        }
        return;
      }

      props.keyboardPress(
        `${e.code}-${e.shiftKey ? "shift" : e.altKey ? "alt" : e.ctrlKey ? "ctrl" : e.metaKey ? "ctrl" : ""}`
      );
      e.preventDefault();
    };

    document.addEventListener("keydown", func);

    return () => {
      document.removeEventListener("keydown", func);
    };
  }, []);

  return null;
};

const BotLoginScreenshot: FC<BotLoginScreenshotProps> = ({
  imageData,
  identifier,
  emit,
}) => {
  const sendEvent = (
    type: "click" | "move" | "scroll" | "type",
    id: string
  ) => {
    return (e: MouseEvent<HTMLImageElement> | string) => {
      if (!id) {
        return;
      }

      const todo = {
        get body() {
          switch (type) {
            case "click":
              if (typeof e === "string") {
                return;
              }
              // @ts-ignore
              const rect = e.target.getBoundingClientRect();
              // @ts-ignore
              const x = e.clientX - rect.left; // X position relative to the image
              const y = e.clientY - rect.top; // Y position relative to the image

              return JSON.stringify({
                type,
                x,
                y,
                width: rect.width,
                height: rect.height,
              });
            case "scroll":
              return JSON.stringify({
                type,
                // @ts-ignore
                deltaY: e.deltaY,
              });
            case "type": {
              return JSON.stringify({
                type,
                // @ts-ignore
                key: e,
              });
            }
          }
        },
        method: "POST",
      };

      emit(todo.body);
    };
  };

  return (
    <>
      <div className="h-full max-h-full relative">
        <div className="text-lg font-semibold text-center">
          {identifier && (
            <Keyboard keyboardPress={sendEvent("type", identifier)} />
          )}
          <NoScroll />
        </div>
        <div className="w-full flex items-center justify-center flex-col select-none">
          <div className="overflow-hidden h-full flex items-center justify-center flex-col w-full">
            {!imageData ? (
              <div className="py-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <img
                onClick={sendEvent("click", identifier)}
                onWheel={sendEvent("scroll", identifier)}
                src={`data:image/jpeg;base64,${imageData}`}
                alt="Login Screenshot"
                className={clsx(
                  "w-full select-none border-t border-background",
                  !identifier ? "cursor-wait" : "cursor-pointer"
                )}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BotLoginScreenshot;
