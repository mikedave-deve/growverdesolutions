import React, { useState } from "react";
import { FileText, Download, Eye, Inbox } from "lucide-react";
import { SectionHeading, StatusPill, Button } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { documentService } from "../../services/documentService.js";
import { formatDate } from "../../utils/formatters.js";
import { DOCUMENT_CATEGORIES } from "../../constants/statuses.js";

const CATEGORIES = ["All", ...DOCUMENT_CATEGORIES];

export function Documents() {
  const { data, status, error, retry } = useAsync(() => documentService.getDocuments(), []);
  const [category, setCategory] = useState("All");

  const rows = (data || []).filter((d) => category === "All" || d.category === category);

  const columns = [
    { key: "name", header: "Document", render: (r) => (
      <div className="flex items-center gap-2.5"><FileText size={16} className="text-ink-700/40 shrink-0" /><span className="font-medium">{r.name}</span></div>
    ) },
    { key: "category", header: "Category" },
    { key: "date", header: "Date", render: (r) => formatDate(r.date) },
    { key: "version", header: "Version" },
    { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
    { key: "actions", header: "", render: (r) => (
      <div className="flex gap-1 justify-end md:justify-start">
        <Button as="a" href={documentService.downloadUrl(r.id)} target="_blank" rel="noreferrer" variant="ghost" size="sm" aria-label={`View ${r.name}`}>
          <Eye size={14} />
        </Button>
        <Button as="a" href={documentService.downloadUrl(r.id)} download={r.fileName || r.name} variant="ghost" size="sm" aria-label={`Download ${r.name}`}>
          <Download size={14} />
        </Button>
      </div>
    ) },
  ];

  return (
    <div>
      <SectionHeading eyebrow="Document Center" title="My documents" description="Offer letters, contracts, and policies uploaded by your administrator." />

      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              category === c ? "bg-ink-900 text-white border-ink-900" : "bg-white text-ink-700 border-sand-300 hover:border-forest-400"
            }`}>
            {c}
          </button>
        ))}
      </div>

      <AsyncBoundary
        status={status} error={error} retry={retry}
        empty={rows.length === 0 && status === "success" ? (
          <EmptyState icon={Inbox} title="No documents in this category" description="Documents uploaded by HR for this category will appear here." />
        ) : null}
      >
        <div className="bg-white border border-sand-200 rounded-2xl p-5">
          <DataTable columns={columns} rows={rows} />
        </div>
      </AsyncBoundary>
    </div>
  );
}
