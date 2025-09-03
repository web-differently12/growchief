import { type FC, useCallback } from "react";
import React from "react";
import {
  useWorkflows,
  useWorkflowsRequest,
  useRunningWorkflows,
} from "@growchief/frontend/requests/workflows.request.ts";
import type { Workflows } from "@prisma/client";
import clsx from "clsx";
import { PlusIcon } from "@growchief/frontend/components/icons/plus.icon.tsx";
import { DeleteIcon } from "@growchief/frontend/components/icons/delete.icon.tsx";
import { CodeIcon } from "@growchief/frontend/components/icons/code.icon.tsx";
import { ImportIcon } from "@growchief/frontend/components/icons/import.icon.tsx";
import { CloseIcon } from "@growchief/frontend/components/icons/close.icon.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { useNavigate } from "react-router";
import { useDecisionModal } from "@growchief/frontend/utils/use.decision.modal.tsx";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import { createToolTip } from "@growchief/frontend/utils/create.tool.tip.tsx";
import { useModals } from "@growchief/frontend/utils/store.ts";
import { GetCodeComponent } from "@growchief/frontend/components/workflows/get.code.component.tsx";
import { ImportURLListComponent } from "@growchief/frontend/components/workflows/import.url.list.component.tsx";

const StatusBadge: FC<{ active: boolean }> = ({ active }) => {
  return (
    <div
      className={clsx(
        "px-[8px] py-[2px] rounded-full text-[11px] font-[600] inline-flex items-center",
        active ? "bg-menu text-text-menu" : "bg-red-600/20 text-red-400"
      )}
    >
      <div
        className={clsx(
          "w-[6px] h-[6px] rounded-full mr-[6px]",
          active ? "bg-text-menu" : "bg-red-400"
        )}
      />
      {active ? "Active" : "Inactive"}
    </div>
  );
};

const RunningWorkflowsCount: FC<{
  workflowId: string;
  workflowName: string;
  onRunningCountChange?: (count: number) => void;
  onCancelJobs?: (e: React.MouseEvent) => Promise<void>;
}> = ({ workflowId, workflowName, onRunningCountChange, onCancelJobs }) => {
  const { data: runningData, isLoading } = useRunningWorkflows(workflowId);
  const runningCount = runningData?.total ?? 0;

  // Notify parent component of running count changes
  React.useEffect(() => {
    if (onRunningCountChange) {
      onRunningCountChange(runningCount);
    }
  }, [runningCount, onRunningCountChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-[16px] h-[16px] border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[8px]">
      <div className="text-[13px] text-secondary">{runningCount}</div>
      {runningCount > 0 && onCancelJobs && (
        <button
          {...createToolTip("Cancel running jobs")}
          onClick={onCancelJobs}
          className="flex items-center justify-center w-[20px] h-[20px] rounded-[4px] hover:bg-orange-600/20 transition-all duration-200 text-orange-400 hover:text-orange-300"
          title={`Cancel ${runningCount} running jobs for ${workflowName}`}
        >
          <div className="w-[12px] h-[12px] flex items-center justify-center">
            <CloseIcon />
          </div>
        </button>
      )}
    </div>
  );
};

const WorkflowRow: FC<{
  workflow: Workflows;
  onDelete: (workflowId: string) => Promise<void>;
  onToggleActive: (workflowId: string, active: boolean) => Promise<void>;
  onCancelJobs: (workflowId: string) => Promise<void>;
}> = ({ workflow, onDelete, onToggleActive, onCancelJobs }) => {
  const navigate = useNavigate();
  const decisionModal = useDecisionModal();
  const modals = useModals();
  const [_, setRunningCount] = React.useState(0);

  const handleClick = useCallback(() => {
    navigate(`/workflows/${workflow.id}`);
  }, [workflow.id, navigate]);

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      const confirmed = await decisionModal.open({
        label: "Delete Workflow",
        description: `Are you sure you want to delete "${workflow.name}"? This action cannot be undone.`,
        approveLabel: "Delete",
        cancelLabel: "Cancel",
      });

      if (confirmed) {
        await onDelete(workflow.id);
      }
    },
    [workflow.id, workflow.name, decisionModal, onDelete]
  );

  const handleToggleActive = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await onToggleActive(workflow.id, !workflow.active);
    },
    [workflow.id, workflow.active, onToggleActive]
  );

  const handleGetCode = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      modals.show({
        label: "Workflow Code",
        component: (close) => (
          <GetCodeComponent id={workflow.id} close={close} />
        ),
      });
    },
    [workflow.id, modals]
  );

  const handleImportURLList = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      modals.show({
        label: "Import Leads",
        component: (close) => (
          <ImportURLListComponent id={workflow.id} close={close} />
        ),
      });
    },
    [workflow.id, modals]
  );

  const handleCancelJobs = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      const confirmed = await decisionModal.open({
        label: "Cancel Jobs",
        description: `Are you sure you want to cancel all running jobs for "${workflow.name}"? This action cannot be undone.`,
        approveLabel: "Cancel Jobs",
        cancelLabel: "Keep Running",
      });

      if (confirmed) {
        await onCancelJobs(workflow.id);
      }
    },
    [workflow.id, workflow.name, decisionModal, onCancelJobs]
  );

  return (
    <tr
      className="hover:bg-boxHover transition-all duration-200 border-b border-background cursor-pointer"
      onClick={handleClick}
    >
      <td className="px-[20px] py-[16px]">
        <div className="flex items-center gap-[12px]">
          <button
            {...createToolTip(
              workflow.active ? "Stop workflow" : "Start workflow"
            )}
            onClick={handleToggleActive}
            className={clsx(
              "relative w-[36px] h-[36px] rounded-full border flex-shrink-0 flex items-center justify-center transition-all duration-200",
              workflow.active
                ? "bg-red-600/20 border-red-600/30 hover:bg-red-600/30 text-red-400"
                : "bg-green-600/20 border-green-600/30 hover:bg-green-600/30 text-green-400"
            )}
            title={workflow.active ? "Stop workflow" : "Start workflow"}
          >
            {workflow.active ? (
              // Stop icon (square)
              <div className="w-[14px] h-[14px] bg-current rounded-[2px]" />
            ) : (
              // Play icon (triangle)
              <div className="w-0 h-0 border-l-[10px] border-l-current border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-[2px]" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-[600] text-primary leading-[1.2] truncate">
              {workflow.name}
            </h3>
          </div>
        </div>
      </td>
      <td className="px-[20px] py-[16px]">
        <StatusBadge active={workflow.active} />
      </td>
      <td className="px-[20px] py-[16px]">
        <RunningWorkflowsCount
          workflowId={workflow.id}
          workflowName={workflow.name}
          onRunningCountChange={setRunningCount}
          onCancelJobs={handleCancelJobs}
        />
      </td>
      <td className="px-[20px] py-[16px]">
        <div className="text-[13px] text-secondary">
          {new Date(workflow.createdAt).toLocaleDateString()}
        </div>
      </td>
      <td className="px-[20px] py-[16px]">
        <div className="flex items-center gap-[8px]">
          <button
            {...createToolTip("Import URL list")}
            onClick={handleImportURLList}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] hover:bg-btn-primary/20 transition-all duration-200"
            title={`Import URL list for ${workflow.name}`}
          >
            <ImportIcon className="w-[16px] h-[16px]" />
          </button>
          <button
            {...createToolTip("Get workflow code")}
            onClick={handleGetCode}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] hover:bg-btn-primary/20 transition-all duration-200"
            title={`Get code for ${workflow.name}`}
          >
            <CodeIcon className="w-[16px] h-[16px]" />
          </button>
          <button
            {...createToolTip("Delete workflow")}
            onClick={handleDelete}
            className="flex items-center justify-center w-[32px] h-[32px] rounded-[6px] hover:bg-red-600/20 transition-all duration-200 text-red-400 hover:text-red-300"
            title={`Delete ${workflow.name}`}
          >
            <DeleteIcon className="w-[16px] h-[16px]" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export const WorkflowsComponent: FC = () => {
  const navigate = useNavigate();
  const workflowsRequest = useWorkflowsRequest();
  const toaster = useToaster();
  const { data: workflows, isLoading, mutate } = useWorkflows();

  const addWorkflow = useCallback(async () => {
    try {
      const newWorkflow = await workflowsRequest.createWorkflow("New Workflow");
      mutate();
      // Navigate to edit the newly created workflow
      navigate(`/workflows/${newWorkflow.id}`);
    } catch (error) {
      console.error("Failed to create workflow:", error);
    }
  }, [workflowsRequest, mutate, navigate]);

  const deleteWorkflow = useCallback(
    async (workflowId: string) => {
      try {
        await workflowsRequest.deleteWorkflow(workflowId);
        await mutate(); // Refresh the list
        toaster.show("Workflow deleted successfully", "success");
      } catch (error) {
        console.error("Failed to delete workflow:", error);
        toaster.show("Failed to delete workflow", "warning");
      }
    },
    [workflowsRequest, mutate, toaster]
  );

  const toggleWorkflowActive = useCallback(
    async (workflowId: string, active: boolean) => {
      try {
        await workflowsRequest.changeWorkflowActivity(workflowId, active);
        await mutate(); // Refresh the list
        toaster.show(
          `Workflow ${active ? "started" : "stopped"} successfully`,
          "success"
        );
      } catch (error) {
        console.error("Failed to toggle workflow:", error);
        toaster.show("Failed to update workflow", "warning");
      }
    },
    [workflowsRequest, mutate, toaster]
  );

  const cancelJobs = useCallback(
    async (workflowId: string) => {
      try {
        await workflowsRequest.cancelJobs(workflowId);
        await mutate(); // Refresh the list to update running counts
        toaster.show("Jobs cancelled successfully", "success");
      } catch (error) {
        console.error("Failed to cancel jobs:", error);
        toaster.show("Failed to cancel jobs", "warning");
      }
    },
    [workflowsRequest, mutate, toaster]
  );

  if (isLoading) {
    return null;
  }

  return (
    <div className="bg-innerBackground rounded-[8px] overflow-hidden">
      {workflows && workflows.length > 0 && (
        <div className="border-b border-background px-[20px] pt-[20px]">
          <div className="flex items-center justify-end mb-[20px]">
            <Button
              onClick={addWorkflow}
              className="flex items-center gap-[8px] px-[12px] py-[8px] bg-background hover:bg-boxHover rounded-[6px] transition-all duration-200 text-[13px] font-[500] text-primary"
            >
              <PlusIcon />
              Add Workflow
            </Button>
          </div>
        </div>
      )}

      {workflows && workflows.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="border-b border-background">
              <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                Workflow
              </th>
              <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                Status
              </th>
              <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                Running
              </th>
              <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                Created
              </th>
              <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((workflow: Workflows) => (
              <WorkflowRow
                key={workflow.id}
                workflow={workflow}
                onDelete={deleteWorkflow}
                onToggleActive={toggleWorkflowActive}
                onCancelJobs={cancelJobs}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="px-[20px] py-[40px] text-center">
          <div className="text-[14px] text-secondary mb-[16px]">
            No workflows created yet
          </div>
          <Button
            onClick={addWorkflow}
            className="flex items-center gap-[8px] mx-auto px-[16px] py-[10px] bg-background hover:bg-boxHover rounded-[6px] transition-all duration-200 text-[13px] font-[500] text-primary"
          >
            <PlusIcon />
            Create your first workflow
          </Button>
        </div>
      )}
    </div>
  );
};
