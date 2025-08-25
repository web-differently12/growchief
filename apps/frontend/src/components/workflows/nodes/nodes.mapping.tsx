import { highOrderNode } from "@growchief/frontend/components/workflows/nodes/high.order.node";
import LinkedinConnectionRequest from "@growchief/frontend/components/workflows/nodes/platforms/linkedin/connection.request";
import XSendMessage from "@growchief/frontend/components/workflows/nodes/platforms/x/send.message";
import LinkedinSendMessage from "@growchief/frontend/components/workflows/nodes/platforms/linkedin/send.message.tsx";
import DelayNode from "@growchief/frontend/components/workflows/nodes/platforms/global/delay.tsx";

export const EmptyWrapper = highOrderNode({ identifier: "empty" });
export const nodesMapping = {
  linkedin: [LinkedinConnectionRequest, ...LinkedinSendMessage, DelayNode],
  x: [...XSendMessage, DelayNode],
};
