import { useFormContext } from "react-hook-form";

export function useValues<T extends string>(...list: T[]): Record<T, any> {
  const { watch } = useFormContext();
  const all = watch(list);
  return list.reduce(
    (acc, key, index) => {
      acc[key] = all[index];
      return acc;
    },
    {} as Record<string, any>,
  );
};
