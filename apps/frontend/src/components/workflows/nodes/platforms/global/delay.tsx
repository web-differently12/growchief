import { highOrderNode } from "@growchief/frontend/components/workflows/nodes/high.order.node.tsx";
import { type FC } from "react";
import { useFormContext } from "react-hook-form";
import { Delay } from "@growchief/shared-both/dto/platforms/global/delay.ts";
import { Select } from "@growchief/frontend/components/ui/select.tsx";
import { useValues } from "@growchief/frontend/components/workflows/nodes/hooks/use.value.tsx";

const options = [
  { label: "1 hour", value: 1 },
  { label: "2 hours", value: 2 },
  { label: "4 hours", value: 4 },
  { label: "8 hours", value: 8 },
  { label: "12 hours", value: 12 },
  { label: "24 hours", value: 24 },
  { label: "48 hours", value: 48 },
];
export const DelaySettings: FC = () => {
  const form = useFormContext();
  return (
    <div className="px-[20px] flex flex-col gap-2">
      <div className="text-[14px]">Delay Duration</div>
      <Select
        {...form.register("hours", { value: 24, setValueAs: (v) => Number(v) })}
        className="w-full p-2 border rounded"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
};

export const DelayRender: FC = () => {
  const list = useValues("hours");
  return <div>{list.hours && <>Delay: {list.hours}</>}</div>;
};

export default highOrderNode({
  identifier: "delay",
  dto: Delay,
  settings: DelaySettings,
  render: DelayRender,
});
