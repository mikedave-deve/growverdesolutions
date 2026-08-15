import React from "react";
import { History } from "lucide-react";
import { SectionHeading, StatusPill } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { activityService } from "../../services/activityService.js";
import { formatDate } from "../../utils/formatters.js";

export function Activity() {
  const { data, status, error, retry } = useAsync(() => activityService.getActivity(), []);

  const columns = [
    { key: "activity", header: "Activity" },
    { key: "date", header: "Date", render: (r) => formatDate(r.date) },
    { key: "time", header: "Time" },
    { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
  ];

  return (
    <div>
      <SectionHeading eyebrow="Activity" title="Activity history" description="A chronological record of actions taken on your account." />
      <AsyncBoundary
        status={status} error={error} retry={retry}
        empty={data?.length === 0 ? <EmptyState icon={History} title="No activity yet" /> : null}
      >
        <div className="bg-white border border-sand-200 rounded-2xl p-5">
          <DataTable columns={columns} rows={data || []} />
        </div>
      </AsyncBoundary>
    </div>
  );
}
