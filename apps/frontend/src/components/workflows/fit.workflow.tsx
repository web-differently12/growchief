import { type FC, type RefObject, useCallback, useEffect } from "react";
import { getNodesBounds, useReactFlow } from "@xyflow/react";

export const FitWorkflow: FC<{
  wrapperRef: RefObject<any>;
  setLoaded: () => void;
}> = ({ wrapperRef, setLoaded }) => {
  const rf = useReactFlow();

  const fitViewXOnly = useCallback(
    async ({ padding = 0, minZoom = 1, maxZoom = 1 } = {}) => {
      const nodes = rf.getNodes();
      if (!nodes.length || !wrapperRef.current) return;

      // Bounds in flow coords
      const b = getNodesBounds(nodes); // { x, y, width, height }

      const containerWidth = wrapperRef.current.clientWidth;

      // padding is a fraction of container width
      const padPx = padding * containerWidth;
      const contentWidth = Math.max(1, b.width); // avoid division by zero
      let zoom = (containerWidth - 2 * padPx) / contentWidth;

      // clamp zoom
      zoom = Math.max(minZoom, Math.min(maxZoom, zoom));

      // center horizontally: translate so left edge maps to screen, then add centering offset
      const scaledContentWidth = contentWidth * zoom;
      const x = -(b.x * zoom) + (containerWidth - scaledContentWidth) / 2;

      await rf.setViewport({ x, y: 50, zoom: 1 });
      setLoaded();
    },
    [],
  );
  useEffect(() => {
    fitViewXOnly();
  }, []);
  return null;
};
