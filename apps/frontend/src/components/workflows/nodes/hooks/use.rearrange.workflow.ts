// useWorkflowLayout.ts
import { useCallback, useEffect } from "react";
import { useReactFlow, type Node, type Edge, Position } from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import type { NodeBase } from "@xyflow/system";

let GLOBAL_LAYOUT_TRIGGER: null | ((node: NodeBase) => void) = null;
const afterPaint = (cb: () => void) =>
  requestAnimationFrame(() => requestAnimationFrame(cb));

function layoutTB(
  nodes: Node[],
  edges: Edge[],
  opts?: {
    ranksep?: number;
    nodesep?: number;
    defaultSize?: { width: number; height: number };
  },
) {
  const ranksep = opts?.ranksep ?? 90;
  const nodesep = opts?.nodesep ?? 60;
  const defaultSize = opts?.defaultSize ?? { width: 172, height: 36 };

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "TB",
    ranksep,
    nodesep,
    marginx: 20,
    marginy: 20,
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((n) => {
    const w =
      (n as any).measured?.width ??
      n.width ??
      (n.style as any)?.width ??
      defaultSize.width;
    const h =
      (n as any).measured?.height ??
      n.height ??
      (n.style as any)?.height ??
      defaultSize.height;
    g.setNode(n.id, { width: w, height: h });
  });

  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  return nodes.map((n) => {
    const p = g.node(n.id);
    const w =
      (n as any).measured?.width ??
      n.width ??
      (n.style as any)?.width ??
      defaultSize.width;
    const h =
      (n as any).measured?.height ??
      n.height ??
      (n.style as any)?.height ??
      defaultSize.height;
    return {
      ...n,
      position: { x: p.x - w / 2, y: p.y - h / 2 },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });
}

export function useWorkflowLayout(opts?: { autoFit?: boolean }) {
  const { getNodes, getEdges, setNodes, fitView } = useReactFlow();
  const autoFit = opts?.autoFit ?? true;

  const rearrange = useCallback(
    (node?: NodeBase) => {
      const laidOut = layoutTB(getNodes() as Node[], getEdges() as Edge[]);
      setNodes(laidOut);

      if (autoFit) {
        afterPaint(() => {
          fitView({
            padding: 0.2,
            duration: 1000,
            ...(node ? { nodes: [node] } : {}),
          });
        });
      }
    },
    [getNodes, getEdges, setNodes, fitView, autoFit],
  );

  useEffect(() => {
    GLOBAL_LAYOUT_TRIGGER = rearrange;
    return () => {
      if (GLOBAL_LAYOUT_TRIGGER === rearrange) GLOBAL_LAYOUT_TRIGGER = null;
    };
  }, [rearrange]);

  return { rearrange };
}
