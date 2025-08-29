import { type FC } from "react";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import clsx from "clsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import useSWR from "swr";
import { useFetch } from "@growchief/frontend/utils/use.fetch.tsx";
import { chunk } from "lodash";
import dayjs from "dayjs";

type ViewType = "week" | "month";

interface DateRange {
  start: Date;
  end: Date;
}

interface ChartDataPoint {
  day: string;
  value: number;
  formattedDate: string;
}

// Helper functions to calculate date ranges
const getCurrentWeekRange = (): DateRange => {
  const today = new Date();
  const todayDayOfWeek = today.getDay();
  const daysFromMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;

  const start = new Date(today);
  start.setDate(today.getDate() - daysFromMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start, end };
};

const getCurrentMonthRange = (): DateRange => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return { start, end };
};

const getWeekRange = (fromCurrentWeek: Date): DateRange => {
  const start = new Date(fromCurrentWeek);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start, end };
};

const getMonthRange = (fromCurrentMonth: Date): DateRange => {
  const start = new Date(
    fromCurrentMonth.getFullYear(),
    fromCurrentMonth.getMonth(),
    1
  );
  const end = new Date(
    fromCurrentMonth.getFullYear(),
    fromCurrentMonth.getMonth() + 1,
    0
  );

  return { start, end };
};

interface MetricCardProps {
  title: string;
  value: number;
  data: Array<ChartDataPoint>;
  color: string;
  icon: string;
  animationDelay?: number;
  isMiddle?: boolean;
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataPoint;
  }>;
  color: string;
}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, color }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-innerBackground border border-input-border rounded-[8px] p-[12px] shadow-menu">
        <p className="text-secondary text-[12px] font-[500] mb-[4px]">
          {data.formattedDate}
        </p>
        <div className="flex items-center gap-[8px]">
          <div
            className="w-[8px] h-[8px] rounded-full"
            style={{ backgroundColor: color }}
          />
          <p className="text-primary text-[14px] font-[600]">
            {payload[0].value}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface CustomTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string;
  };
  animationDelay: number;
}

const CustomTick: FC<CustomTickProps> = ({
  x = 0,
  y = 0,
  payload,
  animationDelay,
}) => {
  const delay = animationDelay + 300; // Start 300ms after line animation

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="middle"
        fill="#a3a3a3"
        fontSize="12"
        className="opacity-0"
        style={{
          animation: `fadeIn 600ms ease-out ${delay}ms forwards`,
        }}
      >
        {payload?.value}
      </text>
    </g>
  );
};

interface CustomDotProps {
  cx?: number;
  cy?: number;
  fill?: string;
  index?: number;
  animationDelay: number;
}

const CustomDot: FC<CustomDotProps> = ({ cx = 0, cy = 0, fill, index = 0 }) => {
  const delay = index * 100; // Stagger dots and start after line begins

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill={fill}
      strokeWidth={2}
      stroke={fill}
      className="opacity-0"
      style={{
        animation: `fadeIn 400ms ease-out ${delay}ms forwards`,
      }}
    />
  );
};

const MetricCard: FC<MetricCardProps> = ({
  title,
  value,
  data,
  color,
  icon,
  animationDelay = 0,
  isMiddle = false,
  isLoading = false,
}) => {
  if (isLoading) {
    return null;
  }
  return (
    <div
      className={clsx(
        "animate-fadeIn border-background border-b p-[20px] flex flex-col gap-[16px]",
        isMiddle && "border-r border-l"
      )}
    >
      <div className="flex items-center gap-[8px]">
        <span className="text-[20px]">{icon}</span>
        <span className="text-secondary text-[14px] font-[500]">{title}</span>
      </div>

      <div className="text-[32px] font-[600] text-primary">{value}</div>

      <div className="h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={<CustomTick animationDelay={animationDelay} />}
              tickMargin={8}
              interval={0}
              domain={["dataMin", "dataMax"]}
            />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip color={color} />}
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={<CustomDot fill={color} animationDelay={animationDelay} />}
              activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: "#fff" }}
              animationBegin={animationDelay}
              animationDuration={700}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface AnalyticsFiltersProps {
  viewType: ViewType;
  onViewChange: (view: ViewType) => void;
  onPrevious: () => void;
  onNext: () => void;
  currentPeriod: string;
}

const AnalyticsFilters: FC<AnalyticsFiltersProps> = ({
  viewType,
  onViewChange,
  onPrevious,
  onNext,
  currentPeriod,
}) => {
  return (
    <div className="bg-innerBackground rounded-t-[8px] p-[20px] border-b border-background">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-[12px]">
          <div className="flex items-center bg-innerBackground border border-background p-[8px] rounded-[8px]">
            <button
              className={clsx(
                "px-[16px] py-[8px] rounded-[8px] text-[14px] font-[600] transition-all",
                viewType === "week"
                  ? "bg-btn-primary text-white"
                  : "text-secondary hover:text-primary hover:bg-background"
              )}
              onClick={() => onViewChange("week")}
            >
              Weekly
            </button>
            <button
              className={clsx(
                "px-[16px] py-[8px] rounded-[8px] text-[14px] font-[600] transition-all",
                viewType === "month"
                  ? "bg-btn-primary text-white"
                  : "text-secondary hover:text-primary hover:bg-background"
              )}
              onClick={() => onViewChange("month")}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="flex items-center gap-[12px]">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevious}
            className="px-[12px]"
          >
            ←
          </Button>
          <span className="text-secondary text-[14px] font-[600] min-w-[120px] text-center">
            {currentPeriod}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onNext}
            className="px-[12px]"
          >
            →
          </Button>
        </div>
      </div>
    </div>
  );
};

export const AnalyticsComponent: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const fetch = useFetch();

  // Get initial values from URL or defaults
  const initialView = (searchParams.get("view") as ViewType) || "week";
  const initialFromDate = searchParams.get("fromDate");
  const initialToDate = searchParams.get("toDate");

  const [viewType, setViewType] = useState<ViewType>(initialView);

  // Calculate default date range based on view type
  const getDefaultDateRange = (view: ViewType) => {
    return view === "week" ? getCurrentWeekRange() : getCurrentMonthRange();
  };

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    try {
      if (initialFromDate && initialToDate) {
        const startDate = new Date(initialFromDate);
        const endDate = new Date(initialToDate);

        // Validate dates from URL
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          return {
            start: startDate,
            end: endDate,
          };
        }
      }
    } catch (error) {
      console.warn("Error parsing dates from URL:", error);
    }

    // Always ensure we return a valid date range
    const defaultRange = getDefaultDateRange(initialView);
    return defaultRange;
  });

  // Update URL when state changes
  useEffect(() => {
    if (!dateRange?.start || !dateRange?.end) return;

    const params = new URLSearchParams(searchParams);
    params.set("view", viewType);
    params.set("fromDate", dateRange.start.toISOString().split("T")[0]);
    params.set("toDate", dateRange.end.toISOString().split("T")[0]);
    setSearchParams(params);
  }, [viewType, dateRange, setSearchParams]);

  // Generate analytics data using SWR
  const swrKey = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end) return null;
    return `analytics-${viewType}-${dateRange.start.toISOString().split("T")[0]}-${dateRange.end.toISOString().split("T")[0]}`;
  }, [viewType, dateRange]);

  const { data: chartData, isLoading } = useSWR(
    swrKey,
    async () => {
      return (
        await fetch(
          `/analytics?type=${viewType}&startDate=${dateRange.start.toISOString().split("T")[0]}&endDate=${dateRange.end.toISOString().split("T")[0]}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
      ).json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Generate current period display string
  const currentPeriod = useMemo(() => {
    if (!dateRange?.start || !dateRange?.end) {
      return "Loading...";
    }

    if (viewType === "week") {
      return `${dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    } else {
      return dateRange.start.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  }, [viewType, dateRange]);

  const handleViewChange = (view: ViewType) => {
    setViewType(view);
    setDateRange(getDefaultDateRange(view)); // Reset to current period when changing view
  };

  const handlePrevious = () => {
    if (!dateRange?.start) return;

    if (viewType === "week") {
      const newFromDate = new Date(dateRange.start);
      newFromDate.setDate(newFromDate.getDate() - 7);
      setDateRange(getWeekRange(newFromDate));
    } else {
      const newFromDate = new Date(dateRange.start);
      newFromDate.setMonth(newFromDate.getMonth() - 1);
      setDateRange(getMonthRange(newFromDate));
    }
  };

  const handleNext = () => {
    if (!dateRange?.start) return;

    if (viewType === "week") {
      const newFromDate = new Date(dateRange.start);
      newFromDate.setDate(newFromDate.getDate() + 7);
      setDateRange(getWeekRange(newFromDate));
    } else {
      const newFromDate = new Date(dateRange.start);
      newFromDate.setMonth(newFromDate.getMonth() + 1);
      setDateRange(getMonthRange(newFromDate));
    }
  };

  const values: any = useMemo(() => {
    if (!chartData) {
      return {};
    }
    return Object.entries(chartData).reduce(
      (all, [key, value]: [key: string, value: any]) => {
        const chunkIt = chunk<any>(value, Math.ceil(value.length / 7));
        const items = chunkIt.map((currentChunk) => ({
          day: dayjs(currentChunk[0].date).format("D"),
          formattedDate: dayjs(currentChunk[0].date).format("DD/MM/YYYY"),
          value: currentChunk.reduce((sum, item) => sum + item.total, 0),
        }));

        return {
          ...all,
          [key]: {
            // @ts-ignore
            total: value.reduce((sum, item) => sum + item.total, 0),
            items,
          },
        };
      },
      {}
    );
  }, [chartData]);

  return (
    <div>
      <AnalyticsFilters
        viewType={viewType}
        onViewChange={handleViewChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        currentPeriod={currentPeriod}
      />

      <div className="grid grid-cols-3 bg-innerBackground w-full">
        <MetricCard
          title="Connection Request Sent"
          value={values?.connectionRequest?.total || 0}
          data={values?.connectionRequest?.items || []}
          color="#8B5CF6"
          icon="🤝"
          animationDelay={0}
          isLoading={isLoading}
        />

        <MetricCard
          title="Follow Ups"
          value={values?.sendMessage?.total || 0}
          data={values?.sendMessage?.items || []}
          color="#8B5CF6"
          icon="💬"
          animationDelay={200}
          isMiddle={true}
          isLoading={isLoading}
        />

        <MetricCard
          title="Completed Workflows"
          value={values?.completed?.total || 0}
          data={values?.completed?.items || []}
          color="#8B5CF6"
          icon="📧"
          animationDelay={400}
          isLoading={isLoading}
        />

        <MetricCard
          title="Total Trigged Workflows With Leads"
          value={values?.workflows?.total || 0}
          data={values?.workflows?.items || []}
          color="#8B5CF6"
          icon="🏃"
          animationDelay={400}
          isLoading={isLoading}
        />
        <div className="border-l border-background" />
      </div>
    </div>
  );
};
