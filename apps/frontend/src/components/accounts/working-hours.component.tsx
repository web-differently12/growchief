import { type FC, useCallback, useState } from "react";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { Input } from "@growchief/frontend/components/ui/input.tsx";
import { Select } from "@growchief/frontend/components/ui/select.tsx";
import { useAccountsRequest } from "@growchief/frontend/requests/accounts.request.ts";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import type { Bot } from "@prisma/client";

interface WorkingHoursComponentProps {
  bot: Bot;
  close: () => void;
  mutate: () => Promise<any>;
}

interface DayHours {
  start: number;
  end: number;
  enabled: boolean;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIMEZONES = [
  { value: -12, label: "UTC-12 International Date Line West" },
  { value: -11, label: "UTC-11 Coordinated Universal Time-11" },
  { value: -10, label: "UTC-10 Hawaii" },
  { value: -9, label: "UTC-09 Alaska" },
  { value: -8, label: "UTC-08 Pacific Time (US & Canada)" },
  { value: -7, label: "UTC-07 Mountain Time (US & Canada)" },
  { value: -6, label: "UTC-06 Central Time (US & Canada)" },
  { value: -5, label: "UTC-05 Eastern Time (US & Canada)" },
  { value: -4, label: "UTC-04 Atlantic Time (Canada)" },
  { value: -3, label: "UTC-03 Brasilia" },
  { value: -2, label: "UTC-02 Coordinated Universal Time-02" },
  { value: -1, label: "UTC-01 Azores" },
  { value: 0, label: "UTC+00 London, Dublin, Edinburgh" },
  { value: 1, label: "UTC+01 Berlin, Madrid, Paris" },
  { value: 2, label: "UTC+02 Cairo, Helsinki, Kyiv" },
  { value: 3, label: "UTC+03 Baghdad, Kuwait, Moscow" },
  { value: 4, label: "UTC+04 Abu Dhabi, Muscat" },
  { value: 5, label: "UTC+05 Islamabad, Karachi" },
  { value: 6, label: "UTC+06 Astana, Dhaka" },
  { value: 7, label: "UTC+07 Bangkok, Hanoi, Jakarta" },
  { value: 8, label: "UTC+08 Beijing, Perth, Singapore" },
  { value: 9, label: "UTC+09 Osaka, Sapporo, Tokyo" },
  { value: 10, label: "UTC+10 Canberra, Melbourne, Sydney" },
  { value: 11, label: "UTC+11 Magadan, Solomon Is." },
  { value: 12, label: "UTC+12 Auckland, Wellington" },
];

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const parseWorkingHours = (workingHours: string): DayHours[] => {
  try {
    const parsed = JSON.parse(workingHours);
    return parsed.map((day: number[] | []) => {
      if (day.length === 0) {
        return { start: 540, end: 1020, enabled: false }; // 9:00 to 17:00 but disabled
      }
      return { start: day[0], end: day[1], enabled: true };
    });
  } catch {
    // Default working hours: 9:00 to 17:00, Monday to Friday
    return [
      { start: 540, end: 1020, enabled: true }, // Monday
      { start: 540, end: 1020, enabled: true }, // Tuesday
      { start: 540, end: 1020, enabled: true }, // Wednesday
      { start: 540, end: 1020, enabled: true }, // Thursday
      { start: 540, end: 960, enabled: true }, // Friday (until 16:00)
      { start: 540, end: 1020, enabled: false }, // Saturday
      { start: 540, end: 1020, enabled: false }, // Sunday
    ];
  }
};

const formatWorkingHours = (hours: DayHours[]): string => {
  const formatted = hours.map((day) => {
    if (!day.enabled) return [];
    return [day.start, day.end];
  });
  return JSON.stringify(formatted);
};

export const WorkingHoursComponent: FC<WorkingHoursComponentProps> = ({
  bot,
  close,
  mutate,
}) => {
  const accountsRequest = useAccountsRequest();
  const toaster = useToaster();
  const [isLoading, setIsLoading] = useState(false);
  const [timezone, setTimezone] = useState(bot.timezone || 0);
  const [workingHours, setWorkingHours] = useState<DayHours[]>(
    parseWorkingHours(bot.workingHours || "")
  );

  const handleDayToggle = useCallback((dayIndex: number) => {
    setWorkingHours((prev) =>
      prev.map((day, index) =>
        index === dayIndex ? { ...day, enabled: !day.enabled } : day
      )
    );
  }, []);

  const handleTimeChange = useCallback(
    (dayIndex: number, field: "start" | "end", value: string) => {
      const minutes = timeToMinutes(value);
      setWorkingHours((prev) =>
        prev.map((day, index) =>
          index === dayIndex ? { ...day, [field]: minutes } : day
        )
      );
    },
    []
  );

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await accountsRequest.updateWorkingHours(bot.id, {
        timezone,
        workingHours: formatWorkingHours(workingHours),
      });
      toaster.show("Working hours updated successfully", "success");
      await mutate();
      close();
    } catch (error) {
      console.error("Failed to update working hours:", error);
      toaster.show("Failed to update working hours", "warning");
    } finally {
      setIsLoading(false);
    }
  }, [bot.id, timezone, workingHours, accountsRequest, toaster, mutate, close]);

  return (
    <div>
      <div className="mb-[24px]">
        <h2 className="text-[18px] font-[600] text-primary mb-[8px]">
          Working Hours for {bot.name}
        </h2>
        <p className="text-[14px] text-secondary">
          Configure when this bot should be active and working
        </p>
      </div>

      <div className="mb-[24px]">
        <label className="block text-[14px] font-[500] text-primary mb-[8px]">
          Timezone
        </label>
        <Select
          value={timezone.toString()}
          onChange={(e) => setTimezone(Number(e.target.value))}
          className="w-full"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-[24px]">
        <h3 className="text-[16px] font-[500] text-primary mb-[16px]">
          Working Days & Hours
        </h3>

        <div className="space-y-[12px]">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className="flex items-center gap-[16px] p-[12px] bg-background rounded-[6px]"
            >
              <div className="flex items-center gap-[8px] min-w-[120px]">
                <input
                  type="checkbox"
                  checked={workingHours[index].enabled}
                  onChange={() => handleDayToggle(index)}
                  className="w-[16px] h-[16px] rounded-[3px] border border-input-border bg-innerBackground checked:bg-btn-primary checked:border-btn-primary focus:outline-none focus:ring-1 focus:ring-btn-primary/20"
                />
                <span className="text-[14px] font-[500] text-primary">
                  {day}
                </span>
              </div>

              {workingHours[index].enabled && (
                <div className="flex items-center gap-[12px] flex-1">
                  <div className="flex items-center gap-[8px]">
                    <span className="text-[13px] text-secondary">From</span>
                    <Input
                      type="time"
                      value={minutesToTime(workingHours[index].start)}
                      onChange={(e) =>
                        handleTimeChange(index, "start", e.target.value)
                      }
                      className="w-[100px] h-[32px] text-[13px]"
                    />
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <span className="text-[13px] text-secondary">To</span>
                    <Input
                      type="time"
                      value={minutesToTime(workingHours[index].end)}
                      onChange={(e) =>
                        handleTimeChange(index, "end", e.target.value)
                      }
                      className="w-[100px] h-[32px] text-[13px]"
                    />
                  </div>
                </div>
              )}

              {!workingHours[index].enabled && (
                <span className="text-[13px] text-secondary italic">
                  Disabled
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-[12px] pt-[16px] border-t border-background">
        <Button variant="ghost" onClick={close} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};
