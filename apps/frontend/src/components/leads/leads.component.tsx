import { type FC, useMemo } from "react";
import {
  useLeadsRequest,
  type LeadWithWorkflows,
} from "@growchief/frontend/requests/leads.request.ts";
import { useSearchParams, useNavigate } from "react-router";
import clsx from "clsx";

const LeadRow: FC<{ lead: LeadWithWorkflows }> = ({ lead }) => {
  const platformSrc = `/socials/${lead.lead.platform.toLowerCase()}.png`;
  const fullName =
    [lead.lead.firstName, lead.lead.lastName].filter(Boolean).join(" ") ||
    "Unknown";

  return (
    <tr className="hover:bg-boxHover transition-all duration-200 border-t border-background">
      <td className="px-[20px] py-[16px]">
        <div className="flex items-center gap-[12px]">
          <div className="relative">
            {lead.lead.picture ? (
              <img
                src={lead.lead.picture}
                alt={`${fullName} avatar`}
                className="w-[35px] h-[35px] object-cover rounded-full"
              />
            ) : (
              <div className="w-[35px] h-[35px] bg-background rounded-full flex items-center justify-center text-[12px] font-[600] text-secondary">
                {fullName.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <div className="absolute -bottom-[2px] -right-[2px] w-[16px] h-[16px] rounded-full bg-innerBackground border border-background overflow-hidden flex items-center justify-center">
              <img
                src={platformSrc}
                alt={lead.lead.platform}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-[600] text-primary leading-[1.2] truncate">
              {fullName}
            </h3>
            {lead.lead.email && (
              <p className="text-[12px] text-secondary truncate mt-[2px]">
                {lead.lead.email}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-[20px] py-[16px]">
        <div className="text-[13px] text-secondary capitalize">
          {lead.lead.platform.toLowerCase()}
        </div>
      </td>
      <td className="px-[20px] py-[16px]">
        <div className="flex flex-wrap gap-[4px]">
          {lead.workflows.map((workflow) => (
            <span
              key={workflow.id}
              className="text-[11px] text-secondary bg-background px-[6px] py-[2px] rounded-[4px] font-[500]"
            >
              {workflow.name}
            </span>
          ))}
        </div>
      </td>
      <td className="px-[20px] py-[16px]">
        {lead.lead.url && (
          <a
            href={lead.lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] transition-colors duration-200 underline truncate block max-w-[200px]"
          >
            View Profile
          </a>
        )}
      </td>
    </tr>
  );
};

const Pagination: FC<{
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalCount, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  const pages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between py-[16px] border-t border-background px-[20px]">
      <div className="text-[13px] text-secondary">
        Showing {(currentPage - 1) * pageSize + 1} to{" "}
        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} leads
      </div>

      <div className="flex items-center gap-[8px]">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            "px-[12px] py-[6px] rounded-[4px] text-[13px] font-[500] transition-all duration-200",
            currentPage === 1
              ? "text-secondary cursor-not-allowed"
              : "text-primary hover:bg-background",
          )}
        >
          Previous
        </button>

        <div className="flex items-center gap-[4px]">
          {pages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
              className={clsx(
                "w-[32px] h-[32px] rounded-[4px] text-[13px] font-[500] transition-all duration-200",
                page === currentPage
                  ? "bg-menu text-text-menu"
                  : page === "..."
                    ? "text-secondary cursor-default"
                    : "text-primary hover:bg-background",
              )}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            "px-[12px] py-[6px] rounded-[4px] text-[13px] font-[500] transition-all duration-200",
            currentPage === totalPages
              ? "text-secondary cursor-not-allowed"
              : "text-primary hover:bg-background",
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export const LeadsComponent: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const leadsRequest = useLeadsRequest();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = 10; // This matches the backend pageSize

  const { data, isLoading, error } = leadsRequest.getLeads(currentPage);

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (page === 1) {
      newSearchParams.delete("page");
    } else {
      newSearchParams.set("page", page.toString());
    }

    const newSearch = newSearchParams.toString();
    navigate(`/leads${newSearch ? `?${newSearch}` : ""}`, { replace: true });
  };

  if (isLoading) {
    return (
      <div className="bg-innerBackground rounded-[8px] overflow-hidden">
        <div className="px-[20px] py-[40px] text-center">
          <div className="text-[14px] text-secondary">Loading leads...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-innerBackground rounded-[8px] overflow-hidden">
        <div className="px-[20px] py-[40px] text-center">
          <div className="text-[14px] text-red-400">Failed to load leads</div>
        </div>
      </div>
    );
  }

  const leads = data?.leads || [];
  const totalCount = data?.count || 0;

  return (
    <div className="bg-innerBackground rounded-[8px] overflow-hidden">
      {leads.length > 0 ? (
        <>
          <table className="w-full">
            <thead>
              <tr className="border-b border-background">
                <th className="py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide px-[20px]">
                  Lead
                </th>
                <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                  Platform
                </th>
                <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                  Workflows
                </th>
                <th className="px-[20px] py-[12px] text-left text-[12px] font-[600] text-secondary uppercase tracking-wide">
                  Profile
                </th>
              </tr>
            </thead>
            <tbody>
              {leads.map((leadWithWorkflows) => (
                <LeadRow
                  key={leadWithWorkflows.lead.id}
                  lead={leadWithWorkflows}
                />
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="px-[20px] py-[40px] text-center">
          <div className="text-[14px] text-secondary mb-[16px]">
            No leads found yet
          </div>
          <div className="text-[13px] text-secondary">
            Leads will appear here when your workflows generate them
          </div>
        </div>
      )}
    </div>
  );
};
