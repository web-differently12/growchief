import { useSearchParams } from "react-router";
import { useModals } from "@growchief/frontend/utils/store.ts";
import { type FC, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { PlusIcon } from "@growchief/frontend/components/icons/plus.icon.tsx";
import { AddAccountComponent } from "@growchief/frontend/components/accounts/add.account.component.tsx";
import { GroupContext } from "@growchief/frontend/context/group.context.tsx";
import { useAccountsRequest } from "@growchief/frontend/requests/accounts.request.ts";
import { useWorkflowsRequest } from "@growchief/frontend/requests/workflows.request.ts";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";

export const OnboardingComponent = () => {
  const [query] = useSearchParams();
  const onboarding = query.get("onboarding");

  if (onboarding === "true") {
    return <OnboardingComponentInner />;
  }

  return null;
};

export const OnboardingComponentInner = () => {
  const [_, setQuery] = useSearchParams();
  const { show, closeAll } = useModals();
  useEffect(() => {
    show({
      label: "Welcome to GrowChief 🚀",
      askClose: true,
      beforeClose: () =>
        setQuery((p) => {
          p.delete("onboarding");
          return p;
        }),
      component: (close) => (
        <OnboardingRenderComponent
          close={() => {
            setQuery((p) => {
              p.delete("onboarding");
              return p;
            });
            close();
          }}
        />
      ),
    });
    return () => {
      closeAll();
    };
  }, []);
  return null;
};

const OnboardingRenderComponent: FC<{ close: () => void }> = ({ close }) => {
  const [step, setStep] = useState<
    "welcome" | "add-account" | "create-workflow"
  >("welcome");
  const [hasCreatedAccount, setHasCreatedAccount] = useState(false);
  const navigate = useNavigate();
  const accountsRequest = useAccountsRequest();
  const workflowsRequest = useWorkflowsRequest();
  const toaster = useToaster();

  // Get the first available group for account creation
  const { data: groups } = accountsRequest.groups();
  const defaultGroup = groups?.[0];

  const handleAccountCreated = useCallback(() => {
    setHasCreatedAccount(true);
    setStep("create-workflow");
    toaster.show(
      "Account created successfully! Now let's create your first workflow.",
      "success",
    );
  }, [toaster]);

  const handleCreateWorkflow = useCallback(async () => {
    try {
      const newWorkflow =
        await workflowsRequest.createWorkflow("My First Workflow");
      close(); // Close the onboarding modal
      navigate(`/workflows/${newWorkflow.id}`);
      toaster.show(
        "Workflow created! You can now start building your automation.",
        "success",
      );
    } catch (error) {
      console.error("Failed to create workflow:", error);
      toaster.show("Failed to create workflow. Please try again.", "warning");
    }
  }, [workflowsRequest, navigate, close, toaster]);

  const handleFinishOnboarding = useCallback(() => {
    close();
    toaster.show(
      "Welcome to GrowChief! You're all set to start automating.",
      "success",
    );
  }, [close, toaster]);

  if (step === "welcome") {
    return (
      <div className="flex flex-1 flex-col">
        <div className="text-center mb-[32px]">
          <p className="text-[16px] text-secondary leading-[1.5]">
            Let's get you set up with your first account and workflow to start
            automating your social media growth.
          </p>
        </div>

        <div className="space-y-[16px] mb-[32px]">
          <div className="flex items-center gap-[12px] p-[16px] bg-innerBackground rounded-[8px]">
            <div className="w-[24px] h-[24px] bg-btn-primary text-white rounded-full flex items-center justify-center text-[12px] font-[600]">
              1
            </div>
            <div>
              <h3 className="text-[14px] font-[600] text-primary">
                Add Your First Account
              </h3>
              <p className="text-[13px] text-secondary">
                Connect your social media account to start automating
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[12px] p-[16px] bg-innerBackground rounded-[8px]">
            <div className="w-[24px] h-[24px] bg-btn-primary text-white rounded-full flex items-center justify-center text-[12px] font-[600]">
              2
            </div>
            <div>
              <h3 className="text-[14px] font-[600] text-primary">
                Create Your First Workflow
              </h3>
              <p className="text-[13px] text-secondary">
                Build automated sequences to grow your audience
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-[12px]">
          <Button onClick={() => setStep("add-account")} className="flex-1">
            <PlusIcon />
            Get Started
          </Button>
          <Button
            onClick={handleFinishOnboarding}
            variant="outline"
            className="flex-1"
          >
            Skip for Now
          </Button>
        </div>
      </div>
    );
  }

  if (step === "add-account") {
    if (!defaultGroup) {
      return (
        <div className="p-[24px] max-w-[480px] text-center">
          <h2 className="text-[18px] font-[600] text-primary mb-[16px]">
            Loading...
          </h2>
          <p className="text-[14px] text-secondary">
            Setting up your workspace...
          </p>
        </div>
      );
    }

    return (
      <div className="max-w-[600px]">
        <div>
          <GroupContext.Provider value={{ group: defaultGroup }}>
            <AddAccountComponent
              close={() => {}}
              mutate={handleAccountCreated}
            />
          </GroupContext.Provider>
        </div>
      </div>
    );
  }

  if (step === "create-workflow") {
    return (
      <div className="p-[24px]">
        <div className="text-center mb-[32px]">
          <h2 className="text-[20px] font-[700] text-primary mb-[12px]">
            {hasCreatedAccount
              ? "Great! Account Added ✅"
              : "Create Your First Workflow"}
          </h2>
          <p className="text-[16px] text-secondary leading-[1.5]">
            {hasCreatedAccount
              ? "Now let's create your first workflow to start automating your social media activities."
              : "Create a workflow to automate your social media activities and grow your audience."}
          </p>
        </div>

        <div className="bg-innerBackground rounded-[8px] p-[20px] mb-[24px]">
          <h3 className="text-[14px] font-[600] text-primary mb-[8px]">
            What you can do with workflows:
          </h3>
          <ul className="space-y-[6px] text-[13px] text-secondary">
            <li>• Send connection requests automatically</li>
            <li>• Send personalized messages to new connections</li>
            <li>• Schedule posts and content</li>
            <li>• Track engagement and analytics</li>
          </ul>
        </div>

        <div className="flex gap-[12px]">
          <Button onClick={handleCreateWorkflow} className="flex-1">
            Create Workflow
          </Button>
          <Button
            onClick={handleFinishOnboarding}
            variant="outline"
            className="flex-1"
          >
            {hasCreatedAccount ? "Finish Setup" : "Skip for Now"}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
