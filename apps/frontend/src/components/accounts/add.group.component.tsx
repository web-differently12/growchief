import type { FC } from "react";
import { useState } from "react";
import { mutate } from "swr";
import { useToaster } from "@growchief/frontend/utils/use.toaster.tsx";
import { useFetch } from "@growchief/frontend/utils/use.fetch";
import { Input } from "@growchief/frontend/components/ui/input.tsx";
import { Button } from "@growchief/frontend/components/ui/button.tsx";
import { useNavigate } from "react-router";

export const AddGroup: FC<{ close: () => void }> = ({ close }) => {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToaster();
  const fetch = useFetch();
  const push = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.show("Please enter a group name", "warning");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/bots/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) throw new Error("Failed to create group");

      await mutate("accounts-groups");

      toast.show(`Group "${name}" created successfully`, "success");
      const { id } = await response.json();
      push("/accounts/" + id);
      // Reset form and close dialog
      setName("");
      close();
    } catch (error) {
      toast.show("Failed to create group", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="grid gap-4">
        <div className="flex flex-col gap-1">
          <div className="col-span-4">Group Name</div>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name..."
            disabled={isLoading}
            autoFocus
          />
        </div>
      </div>

      <div className="flex gap-[20px] mt-[40px]">
        <Button
          size="lg"
          type="button"
          onClick={handleCreate}
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? <>Creating...</> : "Create Group"}
        </Button>
      </div>
    </div>
  );
};
