import { highOrderNode } from "@growchief/frontend/components/workflows/nodes/high.order.node.tsx";
import { LinkedinConnectionRequestDto } from "@growchief/shared-both/dto/platforms/linkedin/linkedin.connection.request.dto.ts";
import { type FC } from "react";
import { TextareaForm } from "@growchief/frontend/components/ui/react-form/textarea.form.tsx";
import { useFormContext } from "react-hook-form";
import { useValues } from "@growchief/frontend/components/workflows/nodes/hooks/use.value.tsx";

export const ConnectionRender: FC = () => {
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
  const form = useFormContext();
  return (
    <div className="px-[20px] flex flex-col gap-2">
      <TextareaForm label="Connection Message" {...form.register("message")} />
    </div>
  );
};

export default highOrderNode({
  identifier: "linkedin-send-connection-request",
  dto: LinkedinConnectionRequestDto,
  settings: Settings,
  render: ConnectionRender,
});
