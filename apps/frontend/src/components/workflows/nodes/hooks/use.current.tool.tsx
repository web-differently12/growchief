import { usePlatformsGroupsAndOptions } from "@growchief/frontend/components/workflows/platforms.groups.and.options.tsx";
import { useInternalNode } from "@xyflow/react";
import { useGetAccount } from "@growchief/frontend/components/workflows/nodes/hooks/use.hooks.tsx";

export const useCurrentTool = (id: string) => {
  const { tools } = usePlatformsGroupsAndOptions();
  const node = useInternalNode(id);
  const account = useGetAccount(id);

  if (!account || !node || !node.data.identifier) {
    return undefined;
  }

  if (node?.data?.identifier === "add-account") {
    return { maxChildren: 1 };
  }

  return (
    tools
      .find((p) => p.identifier === account.platform)
      ?.tools?.find((a) => a.identifier === node?.data?.identifier) || undefined
  );
};
