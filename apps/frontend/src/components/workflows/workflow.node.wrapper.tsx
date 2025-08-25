import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import clsx from "clsx";
import {
  getConnectedEdges,
  getOutgoers,
  Handle,
  MarkerType,
  Position,
  useInternalNode,
  useNodeId,
  useReactFlow,
} from "@xyflow/react";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import EventEmitter from "events";
import { useMenu } from "@growchief/frontend/components/workflows/workflow.menu.tsx";
import { CloseIcon } from "@growchief/frontend/components/icons/close.icon.tsx";
import { useDecisionModal } from "@growchief/frontend/utils/use.decision.modal.tsx";
import type { NodeBase } from "@xyflow/system";
import { useWorkflowLayout } from "@growchief/frontend/components/workflows/nodes/hooks/use.rearrange.workflow.ts";
import {
  useChildrenLength,
  useGetAccount,
  useGetParentNodes,
} from "@growchief/frontend/components/workflows/nodes/hooks/use.hooks.tsx";
import { WorkflowMenuOption } from "@growchief/frontend/components/workflows/workflow.menu.option.tsx";
import { useCurrentTool } from "@growchief/frontend/components/workflows/nodes/hooks/use.current.tool.tsx";
import {
  EmptyWrapper,
  nodesMapping,
} from "@growchief/frontend/components/workflows/nodes/nodes.mapping.tsx";
import { useHighOrderNode } from "@growchief/frontend/components/workflows/nodes/high.order.node.tsx";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";

export const closeMenuEmitter = new EventEmitter();

export const Menu: FC<{ handleClickOutside: () => void }> = ({
  handleClickOutside,
}) => {
  const id = useNodeId();
  const node = useInternalNode(id!);
  const { rearrange } = useWorkflowLayout();
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
  const getParents = useGetParentNodes(id!);

  const addNode = useCallback((type: string, data?: any) => {
    const edgesList = getEdges().filter((f) => f.source === node?.id);
    const newNodeId = uuidv4();
    const newNode = {
      id: newNodeId,
      type,
      data: {
        ...(data || {}),
      },
      dragHandle: ".nodrag",
      position: {
        x: (node?.position.x || 1) * edgesList.length,
        y: node?.position.y! + 100,
      },
    };

    const nodes = [newNode, ...getNodes()];

    const edges = [
      {
        id: uuidv4(),
        source: node?.id!,
        target: newNodeId,
        type: "default",
        style: { stroke: "#612BD3", strokeWidth: 2 },
        markerEnd: { type: MarkerType.Arrow, color: "#612BD3" },
      },
      ...getEdges(),
    ];

    setNodes(nodes);
    setEdges(edges);
    handleClickOutside();
    setTimeout(() => {
      selectedEmitter.emit("selectNode", newNode.id);
      rearrange(newNode);
    });
  }, []);

  useEffect(() => {
    closeMenuEmitter.on("closeMenu", handleClickOutside);

    return () => {
      closeMenuEmitter.off("closeMenu", handleClickOutside);
    };
  }, []);

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="left-[50%] bg-innerBackground p-[12px] rounded-[12px] top-[100%] absolute shadow-menu min-w-[285px] z-[500] text-left"
    >
      {getParents.length === 0 ? (
        <div
          className="px-[10px] py-[8px] hover:bg-node"
          onClick={() =>
            addNode("default", {
              label: "Add Account",
              identifier: "add-account",
            })
          }
        >
          Add Account
        </div>
      ) : (
        <WorkflowMenuOption addNode={addNode} id={id!} />
      )}
    </div>
  );
};

interface WorkflowNodeWrapperInterface {
  title: string;
  noOpen?: boolean;
  children: ReactNode;
  sideMenu?: ReactNode;
  disableDelete?: boolean;
  id: string;
  canAddStep: boolean;
}
export const selectedEmitter = new EventEmitter();
export const WorkflowNodeWrapper: FC<WorkflowNodeWrapperInterface> = (
  props,
) => {
  const data = useInternalNode(props.id);
  const account = useGetAccount(props.id);

  const Render =
    !account || !data?.data?.identifier
      ? EmptyWrapper.Component
      : // @ts-ignore
        nodesMapping?.[account.platform]?.find(
          (p: any) => p.identifier === data?.data?.identifier,
        )?.Component || EmptyWrapper.Component;

  return (
    <Render id={props.id}>
      <WorkflowNodeWrapperInner {...props} />
    </Render>
  );
};
export const WorkflowNodeWrapperInner: FC<WorkflowNodeWrapperInterface> = ({
  title,
  children,
  sideMenu,
  disableDelete,
  id,
  canAddStep,
  noOpen,
}) => {
  const [select, setSelect] = useState(false);
  const { setNodes, setEdges, getNodes, getNode, getEdges } = useReactFlow();
  const menu = useMenu();
  const data = useInternalNode(id);
  const tool = useCurrentTool(id!);
  const childrenLength = useChildrenLength(id);
  const { settings: Settings, render: Render, form } = useHighOrderNode();
  const { rearrange } = useWorkflowLayout();

  const setSelected = useCallback((newId: string) => {
    if (noOpen) {
      return;
    }
    if (id === newId) {
      menu.show(true);
    }
    setSelect(id === newId);
  }, []);

  useEffect(() => {
    if (noOpen) {
      return;
    }

    selectedEmitter.on("selectNode", setSelected);
    return () => {
      selectedEmitter.off("selectNode", setSelected);
    };
  }, []);

  const [show, setShow] = useState(false);
  const decisionModal = useDecisionModal();

  const loadAllNodesUnderId = useCallback(
    (currentNode: NodeBase, loadedNodes: NodeBase[]): NodeBase[] => {
      const nodes = loadedNodes.filter((f) => f.id !== currentNode.id);
      const list = getOutgoers(currentNode!, nodes, getEdges());
      return [
        ...list,
        ...list.flatMap((node) => loadAllNodesUnderId(node, nodes)),
      ];
    },
    [],
  );

  const deleteNode = useCallback(async (e: any) => {
    e.stopPropagation();
    e.preventDefault();
    if (
      !(await decisionModal.open({
        label: "Delete Node",
        description: (
          <>
            Are you sure you want to delete this node?
            <br />
            It will remove all connections and steps associated with it.
          </>
        ),
        approveLabel: "Delete",
      }))
    ) {
      return;
    }

    const currentNode = getNode(id);
    const nodesList = getNodes();
    const nodesToDelete = [
      currentNode!,
      ...loadAllNodesUnderId(currentNode!, nodesList),
    ];
    const edgesToDelete = getConnectedEdges(nodesToDelete, getEdges());

    setNodes((nodes) => {
      return nodes.filter(
        (node) => !nodesToDelete.some((n) => n.id === node.id),
      );
    });

    setEdges((edges) => {
      return edges.filter(
        (edge) => !edgesToDelete.some((e) => e.id === edge.id),
      );
    });

    closeMenuEmitter.emit("closeMenu");
    menu.close();
    selectedEmitter.emit("selectNode", null);
    setTimeout(() => {
      rearrange();
    });
  }, []);

  return (
    <div
      className={clsx("group", !noOpen ? "cursor-pointer" : "cursor-default")}
    >
      <div
        onClick={() => {
          if (noOpen) {
            return;
          }
          closeMenuEmitter.emit("closeMenu");
          menu.show(true);
          selectedEmitter.emit("selectNode", id);
        }}
        className={clsx(
          "bg-node rounded-[8px] flex flex-col box-border relative min-w-[300px] border-[1px] group-hover:bg-innerBackgroundHover transition-colors",
          select ? "border-node-selected" : "border-transparent",
          Object.keys(form.formState.errors).length > 0 && "!border-rose-500",
        )}
      >
        <div className="absolute top-[0] left-[50%] -translate-x-[50%] opacity-0">
          <Handle id="in" type="target" position={Position.Top} />
        </div>
        <div className="absolute bottom-[0] left-[50%] -translate-x-[50%] opacity-0">
          <Handle id="out" type="source" position={Position.Bottom} />
        </div>
        <div className="dragHandle bg-node-top gap-[10px] flex py-[5px] items-center px-[10px] rounded-t-[8px] text-[16px] text-left font-[500] text-white">
          <div className="flex-1">{(data?.data?.label as string) || title}</div>
          {!disableDelete && (
            <div className="cursor-pointer" onClick={deleteNode}>
              <CloseIcon />
            </div>
          )}
        </div>
        <div className="py-[6px] flex flex-col px-[8px] text-[14px] min-h-[100px]">
          <div className="flex-1 flex flex-col">
            {children}
            <div className="text-left">
              {!!Render && <div className="pt-[10px] px-[10px]">{Render}</div>}
            </div>
          </div>
          {canAddStep &&
            (!tool?.maxChildren || tool.maxChildren > childrenLength) && (
              <div className="relative">
                <Button
                  className="w-full mt-[10px]"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenuEmitter.emit("closeMenu");
                    setShow(!show);
                  }}
                >
                  Add Step
                </Button>
                {show && <Menu handleClickOutside={() => setShow(false)} />}
              </div>
            )}
        </div>
        {select &&
          createPortal(
            Settings ? (
              <div className="animate-fadeIn">{Settings}</div>
            ) : sideMenu ? (
              <div className="animate-fadeIn">{sideMenu}</div>
            ) : (
              <div>asd</div>
            ),
            document.querySelector(".render-settings")!,
          )}
      </div>
    </div>
  );
};
