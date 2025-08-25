import type { FC } from "react";
import { WorkflowsComponent } from "@growchief/frontend/components/workflows/workflows.component.tsx";
import { WorkflowDetailPage } from "@growchief/frontend/pages/workflow-detail.page.tsx";
import { Routes, Route } from "react-router";

export const WorkflowPage: FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex-1 bg-innerBackground rounded-b-[8px]">
            <WorkflowsComponent />
          </div>
        }
      />
      <Route path="/:id" element={<WorkflowDetailPage />} />
    </Routes>
  );
};
