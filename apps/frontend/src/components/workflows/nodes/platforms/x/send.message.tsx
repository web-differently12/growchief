import { highOrderNode } from "@growchief/frontend/components/workflows/nodes/high.order.node.tsx";
import type { FC } from "react";
import { TextareaForm } from "@growchief/frontend/components/ui/react-form/textarea.form.tsx";
import { useValues } from "@growchief/frontend/components/workflows/nodes/hooks/use.value.tsx";
import { XMessageDto } from "@growchief/shared-both/dto/platforms/x/x.message.request.dto.ts";

export const MessageRender: FC = () => {
  const list = useValues("message");
  return (
    <div className="relative">
      {!!list.message && (
        <>
          <div>&nbsp;</div>
          <div className="text-ellipsis overflow-hidden whitespace-nowrap absolute left-0 top-0 w-full">
            Message: {list.message}
          </div>
        </>
      )}
    </div>
  );
};

export const Settings: FC = () => {
  return (
    <div className="px-[20px] flex flex-col gap-2">
      <TextareaForm label="Message" name="message" />
    </div>
  );
};

export default [
  highOrderNode({
    identifier: "x-send-followup-message",
    dto: XMessageDto,
    settings: Settings,
    render: MessageRender,
  }),
  highOrderNode({
    identifier: "x-send-message",
    dto: XMessageDto,
    settings: Settings,
    render: MessageRender,
  }),
];
