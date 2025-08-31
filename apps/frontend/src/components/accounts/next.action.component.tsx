import type { FC } from "react";
import { useStatus } from "@growchief/frontend/requests/accounts.request.ts";

export const NextActionComponent: FC<{ id: string }> = ({ id }) => {
  const status = useStatus(id);
  return <div>Action</div>;
};
