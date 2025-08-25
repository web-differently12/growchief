import { type FC, useMemo } from "react";
import {
  useGetAccount,
  useGetParentNodes,
} from "@growchief/frontend/components/workflows/nodes/hooks/use.hooks.tsx";
import { usePlatformsGroupsAndOptions } from "@growchief/frontend/components/workflows/platforms.groups.and.options.tsx";
import { useInternalNode } from "@xyflow/react";
import type { ToolParams } from "@growchief/shared-both/utils/tool.decorator.ts";

export const WorkflowMenuOption: FC<{
  id: string;
  addNode: (type: string, data: any) => void;
}> = ({ id, addNode }) => {
  const account = useGetAccount(id);
  const parentNodes = useGetParentNodes(id);
  const node = useInternalNode(id);
  const { tools } = usePlatformsGroupsAndOptions();
  const list = useMemo(() => {
    const latestIdentifier = (node?.data?.identifier as string) || "";
    const toolsList = tools
      .filter((f) => {
        return f.identifier === account?.platform;
      })
      .flatMap((p) => p.tools);

    // Get all parent node identifiers for filtering
    const parentIdentifiers = parentNodes
      .map((parent) => parent.data?.identifier as string)
      .filter(Boolean);

    // Apply filters according to ToolParams
    return toolsList.filter((tool) => {
      // Filter: allowedBeforeIdentifiers
      if (
        tool.allowedBeforeIdentifiers &&
        tool.allowedBeforeIdentifiers.length > 0
      ) {
        const hasAllowedParent = tool.allowedBeforeIdentifiers.some(
          (allowedId) => parentIdentifiers.includes(allowedId),
        );
        if (!hasAllowedParent) {
          return false;
        }
      }

      // Filter: notAllowedBeforeIdentifiers
      if (
        tool.notAllowedBeforeIdentifiers &&
        tool.notAllowedBeforeIdentifiers.length > 0
      ) {
        const hasNotAllowedParent = tool.notAllowedBeforeIdentifiers.some(
          (notAllowedId) => parentIdentifiers.includes(notAllowedId),
        );
        if (hasNotAllowedParent) {
          return false;
        }
      }

      // Filter: notAllowedBeforeIdentifier (check against latest/current identifier)
      if (
        tool.notAllowedBeforeIdentifier &&
        tool.notAllowedBeforeIdentifier.length > 0
      ) {
        if (tool.notAllowedBeforeIdentifier.includes(latestIdentifier)) {
          return false;
        }
      }

      return true;
    });
  }, [account, tools, parentNodes, node]);

  return (
    <div>
      {(list as ToolParams[]).map((p) => (
        <div
          key={p.title}
          className="px-[10px] py-[8px] hover:bg-node"
          onClick={() =>
            addNode("default", {
              label: p.title,
              identifier: p.identifier,
            })
          }
        >
          {p.title}
        </div>
      ))}
    </div>
  );
};
