import React from "react";
import { ClipboardList } from "lucide-react";
import { SectionHeading, StatusPill, Card, Badge } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { missionService } from "../../services/missionService.js";
import { formatDate } from "../../utils/formatters.js";

const PRIORITY_TONE = { High: "error", Medium: "warning", Low: "neutral" };

export function Missions() {
  const { data, status, error, retry } = useAsync(() => missionService.getMissions(), []);

  return (
    <div>
      <SectionHeading eyebrow="Missions & Instructions" title="Your assignments" description="Tasks and notices sent to you by administrators and HR." />
      <AsyncBoundary
        status={status} error={error} retry={retry}
        empty={data?.length === 0 ? <EmptyState icon={ClipboardList} title="No missions right now" description="New assignments from HR will appear here." /> : null}
      >
        <div className="flex flex-col gap-4">
          {data?.map((m) => (
            <Card key={m.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <Badge tone={PRIORITY_TONE[m.priority]}>{m.priority} priority</Badge>
                    <StatusPill status={m.status} />
                  </div>
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-sm text-ink-700/60 mt-1 max-w-xl">{m.description}</p>
                </div>
                <div className="text-right text-xs text-ink-700/50 shrink-0">
                  <p>From {m.sender}</p>
                  <p className="mt-1">Due {formatDate(m.deadline)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AsyncBoundary>
    </div>
  );
}
