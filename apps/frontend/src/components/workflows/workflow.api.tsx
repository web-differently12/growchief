import { type NodeProps, type Node } from "@xyflow/react";
import { type FC } from "react";
import { WorkflowNodeWrapper } from "@growchief/frontend/components/workflows/workflow.node.wrapper.tsx";
import { useHighOrderNode } from "@growchief/frontend/components/workflows/nodes/high.order.node.tsx";

export const WorkflowApi: FC<NodeProps<Node<{ text: string }, "default">>> = ({
  id,
}) => {
  const { settings: Settings } = useHighOrderNode();

  return (
    <WorkflowNodeWrapper
      canAddStep={true}
      noOpen={true}
      id={id}
      title="API"
      disableDelete={true}
      sideMenu={Settings}
    >
      <div>
        This is your initial step
        <br />
        From here you can add accounts,
        <br />
        and create workflow steps
      </div>
    </WorkflowNodeWrapper>
  );
};
