import { highOrderNode } from "@growchief/frontend/components/workflows/nodes/high.order.node.tsx";
import type { FC } from "react";
import { LinkedinMessageDto } from "@growchief/shared-both/dto/platforms/linkedin/linkedin.message.request.dto.ts";
import { TextareaForm } from "@growchief/frontend/components/ui/react-form/textarea.form.tsx";
import { useValues } from "@growchief/frontend/components/workflows/nodes/hooks/use.value.tsx";

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
    <div className="px-[20px] flex flex-col gap-10">
      <TextareaForm label="Message" name="message" />
    </div>
  );
};

export default [
  highOrderNode({
    identifier: "linkedin-send-message",
    dto: LinkedinMessageDto,
    settings: Settings,
    render: MessageRender,
  }),
  highOrderNode({
    identifier: "linkedin-send-followup-message",
    dto: LinkedinMessageDto,
    settings: Settings,
    render: MessageRender,
  }),
];
