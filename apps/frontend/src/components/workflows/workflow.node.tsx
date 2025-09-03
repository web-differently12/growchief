import { type NodeProps, type Node, useReactFlow } from "@xyflow/react";
import { type FC, memo, useState, useCallback } from "react";
import { WorkflowNodeWrapper } from "@growchief/frontend/components/workflows/workflow.node.wrapper.tsx";
import {
  useGetAccount,
  useGetAllAccounts,
  useGetParentNodes,
  useIsChildren,
} from "@growchief/frontend/components/workflows/nodes/hooks/use.hooks.tsx";
import { usePlatformsGroupsAndOptions } from "@growchief/frontend/components/workflows/platforms.groups.and.options.tsx";
import { Select } from "@growchief/frontend/components/ui/select.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { useDecisionModal } from "@growchief/frontend/utils/use.decision.modal.tsx";
import { useAccountsRequest, useGroupsAndBots } from "@growchief/frontend/requests/accounts.request.ts";
import { useModals } from "@growchief/frontend/utils/store.ts";
import { AddAccountComponent } from "@growchief/frontend/components/accounts/add.account.component.tsx";
import { GroupContext } from "@growchief/frontend/context/group.context.tsx";
import { PlusIcon } from "@growchief/frontend/components/icons/plus.icon.tsx";

interface SideMenuProps {
  nodeId: string;
}

const Account: FC<SideMenuProps> = ({ nodeId }) => {
  const { updateNode } = useReactFlow();
  const { groups } = usePlatformsGroupsAndOptions();
  const nodes = useGetParentNodes(nodeId);
  const children = useIsChildren(nodeId);
  const account = useGetAccount(nodeId);
  const decisionModal = useDecisionModal();
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const accounts = useGetAllAccounts();
  const accountsRequest = useAccountsRequest();
  const modals = useModals();
  const { mutate } = useGroupsAndBots();

  // Handle both single group object and array of groups
  const availableGroups = groups!;

  // Get available profiles based on selected group
  const selectedGroup = availableGroups.find(
    (group) => group.id === selectedGroupId,
  );
  const availableProfiles = (selectedGroup?.bots || []).filter(
    (f) => !accounts.map((p) => p.id).includes(f.id),
  );

  const handleGroupChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const groupId = event.target.value;
      setSelectedGroupId(groupId);
      setSelectedProfileId(""); // Reset profile selection when group changes
    },
    [],
  );

  const handleProfileChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const profileId = event.target.value;
      setSelectedProfileId(profileId);

      const selectedProfile = availableProfiles.find(
        (bot) => bot.id === profileId,
      );

      if (selectedProfile) {
        // Update the node with the selected profile data
        updateNode(nodeId, (node) => ({
          data: {
            ...(node.data || {}),
            label: "Current Account",
            account: selectedProfile,
          },
        }));
        setSelectedGroupId("");
        setSelectedProfileId("");
      }
    },
    [nodeId, updateNode, selectedGroupId, availableProfiles],
  );

  const handleAddAccount = useCallback(async (group: any) => {
    try {
      await accountsRequest.canAddAccount();
      modals.show({
        label: `Add Account to group: ${group.name}`,
        component: (close) => (
          <GroupContext.Provider value={{ group }}>
            <AddAccountComponent
              close={close}
              mutate={async () => {
                await mutate();
                // Reset selections after adding account
                setSelectedGroupId("");
              }}
            />
          </GroupContext.Provider>
        ),
      });
    } catch (error) {
      console.error("Failed to add account:", error);
    }
  }, []);

  if (nodes.length > 1) {
    return <style>{`.render-settings {display: none}`}</style>;
  }

  if (children && account) {
    return (
      <div className="flex flex-col gap-[16px] px-[20px] min-w-[300px]">
        <div className="text-[18px] font-[600] text-primary">
          Configure Account
        </div>
        <div className="flex items-center gap-[10px]">
          <div className="relative">
            <img
              src={account.profilePicture}
              className="w-[30px] h-[30px] rounded-full"
            />
            <img
              src={`/socials/${account.platform}.png`}
              className="w-[15px] h-[15px] -right-[5px] -bottom-[5px] rounded-full absolute"
            />
          </div>
          <div>
            {account.name} ({account.platform})
          </div>
        </div>
        <div>
          You can't remove the current account as it is being used by other
          nodes.
        </div>
      </div>
    );
  }

  if (account) {
    return (
      <div className="flex flex-col gap-[16px] px-[20px] min-w-[300px]">
        <div className="text-[18px] font-[600] text-primary">
          Configure Account
        </div>
        <div className="flex items-center gap-[10px]">
          <div className="relative">
            <img
              src={account.profilePicture}
              className="w-[30px] h-[30px] rounded-full"
            />
            <img
              src={`/socials/${account.platform}.png`}
              className="w-[15px] h-[15px] -right-[5px] -bottom-[5px] rounded-full absolute"
            />
          </div>
          <div>
            {account.name} ({account.platform})
          </div>
        </div>
        <div
          onClick={async () => {
            if (
              await decisionModal.open({
                label: "Are you sure you sure?",
                description: (
                  <>
                    Are you sure you want to disconnect this account?
                    <br />
                    This action cannot be undone.
                  </>
                ),
              })
            ) {
              setSelectedGroupId("");
              setSelectedProfileId("");
              // Update the node to remove the account
              updateNode(nodeId, (node) => ({
                data: {
                  ...(node?.data || {}),
                  label: "Add Account",
                  account: null,
                },
              }));
            }
          }}
        >
          <Button className="w-full">Disconnect account</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[16px] px-[20px] min-w-[300px]">
      <div className="text-[18px] font-[600] text-primary">
        Configure Account
      </div>

      {/* Group Selection */}
      <div className="flex flex-col gap-[8px]">
        <label className="text-[14px] font-[500] text-secondary">
          Select Group
        </label>
        <Select value={selectedGroupId} onChange={handleGroupChange}>
          <option value="">Choose a group...</option>
          {availableGroups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Profile Selection */}
      <div className="flex flex-col gap-[8px]">
        <label className="text-[14px] font-[500] text-secondary">
          Select Profile
        </label>
        <Select
          value={selectedProfileId}
          onChange={handleProfileChange}
          disabled={!selectedGroupId}
        >
          <option value="">Choose a profile...</option>
          {availableProfiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name} ({profile.platform})
            </option>
          ))}
        </Select>

        {/* Show Add Account button when no available profiles after filtering and a group is selected */}
        {selectedGroupId && availableProfiles.length === 0 && (
          <div className="mt-[8px]">
            <div className="text-[12px] text-secondary mb-[8px]">
              {(selectedGroup?.bots?.length || 0) > 0
                ? "All accounts in this group are already being used"
                : "No accounts available in this group"}
            </div>
            <Button
              onClick={() => handleAddAccount(selectedGroup)}
              className="w-full flex items-center gap-[8px] justify-center"
              size="sm"
            >
              <PlusIcon />
              Add Account to Group
            </Button>
          </div>
        )}
      </div>

      {selectedProfileId && (
        <div className="mt-[12px] p-[12px] bg-innerBackground rounded-[8px] border border-input-border">
          <div className="text-[12px] text-secondary">Selected Profile:</div>
          <div className="text-[14px] font-[500] text-primary">
            {availableProfiles.find((p) => p.id === selectedProfileId)?.name}
          </div>
          <div className="text-[12px] text-secondary">
            Platform:{" "}
            {
              availableProfiles.find((p) => p.id === selectedProfileId)
                ?.platform
            }
          </div>
        </div>
      )}
    </div>
  );
};

const SideMenu: FC<SideMenuProps> = (props) => {
  return <Account {...props} />;
};

export const WorkflowNode: FC<NodeProps<Node<{ text: string }, "default">>> =
  memo(({ id }) => {
    const account = useGetAccount(id);
    // const workflow = useWorkflowsRequest();
    // const { data: d1 } = workflow.tools();
    return (
      <WorkflowNodeWrapper
        canAddStep={!!account}
        id={id}
        sideMenu={<SideMenu nodeId={id} />}
        title="Node"
      >
        <>
          {!!account && (
            <div className="flex pt-[5px] items-center gap-[10px]">
              <div className="relative">
                <img
                  src={account.profilePicture}
                  className="w-[30px] h-[30px] rounded-full"
                />
                <img
                  src={`/socials/${account.platform}.png`}
                  className="w-[15px] h-[15px] -right-[5px] -bottom-[5px] rounded-full absolute"
                />
              </div>
              <div>{account.name}</div>
            </div>
          )}
          {!account && (
            <div className="flex flex-1 flex-col justify-center items-center">
              <div className="flex-1 flex justify-center items-center">
                Add an account to continue
              </div>
              <div className="w-full">
                <Button className="w-full mt-[10px]" size="sm">
                  Add Account
                </Button>
              </div>
            </div>
          )}
        </>
      </WorkflowNodeWrapper>
    );
  });
