import { type Edge, useEdges, useNodes } from "@xyflow/react";
import { useMemo } from "react";
import type { NodeBase } from "@xyflow/system";

export const useGetParentNodes = (nodeId: string) => {
  const nodes = useNodes();
  const edges = useEdges();
  return useMemo(() => {
    return loadAllParentNodes(nodes, edges, nodeId);
  }, [nodes, nodeId, edges]);
};

interface Account {
  id: string;
  name: string;
  profilePicture: string;
  platform: string;
}
export const useGetAllAccounts = () => {
  const nodes = useNodes();
  return useMemo(
    () =>
      nodes
        .filter((p) => p.data?.account)
        .flatMap((p) => p?.data?.account) as NodeBase[],
    [nodes],
  );
};
export const useGetAccount = (nodeId: string): Account | undefined => {
  const nodes = useNodes();
  const currentNode = nodes.find((p) => p.id === nodeId!)!;
  const getParentNodes = useGetParentNodes(nodeId);
  return useMemo(() => {
    return [...getParentNodes, currentNode].find((p) => p?.data?.account)?.data
      ?.account as Account | undefined;
  }, [getParentNodes, currentNode]);
};

export const useParent = (nodeId: string) => {
  const edges = useEdges();
  const nodes = useNodes();
  return nodes.find(
    (p) => p.id === edges.find((p) => p.target === nodeId)?.source,
  );
};

export const useIsChildren = (nodeId: string) => {
  const edges = useEdges();
  return !!edges.find((p) => p.source === nodeId);
};

export const useChildrenLength = (nodeId: string) => {
  const edges = useEdges();
  return edges.filter((p) => p.source === nodeId)?.length || 0;
};

const loadAllParentNodes = (
  nodes: NodeBase[],
  edges: Edge[],
  id: string,
): NodeBase[] => {
  const parents = edges.find((p) => p.target === id);
  if (!parents) return [];
  return [
    ...nodes.filter((n) => n.id === parents.source),
    ...loadAllParentNodes(nodes, edges, parents.source),
  ];
};
