import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Inbox, Pencil, UploadCloud, Download } from "lucide-react";
import { SectionHeading, Card, Button, Field, Input, StatusPill } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { adminService } from "../../services/adminService.js";
import { documentService } from "../../services/documentService.js";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate } from "../../utils/formatters.js";
import { ROUTES } from "../../constants/routes.js";
import { DOCUMENT_CATEGORIES, DOCUMENT_STATUS } from "../../constants/statuses.js";

const SELECT_CLASS = "w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm bg-white";
const FILE_INPUT_CLASS = "w-full text-sm text-ink-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-sand-100 file:text-ink-800 file:text-sm file:font-medium hover:file:bg-sand-200";

export function EmployeeDocuments() {
  const { id } = useParams();
  const { push } = useToast();
  const employees = useAsync(() => adminService.getEmployees(), []);
  const docs = useAsync(() => adminService.getEmployeeDocuments(id), [id]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: "", category: DOCUMENT_CATEGORIES[0], status: "Available", version: "1.0", file: null });
  const [uploading, setUploading] = useState(false);

  const [editingDoc, setEditingDoc] = useState(null);
  const [editForm, setEditForm] = useState({ status: "Available", file: null });
  const [saving, setSaving] = useState(false);

  const employee = employees.data?.users?.find((u) => u.id === id);
  const rows = docs.data || [];

  const openUpload = () => {
    setUploadForm({ name: "", category: DOCUMENT_CATEGORIES[0], status: "Available", version: "1.0", file: null });
    setUploadOpen(true);
  };

  const submitUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      push("Choose a file to upload.", "error");
      return;
    }
    setUploading(true);
    try {
      await adminService.uploadEmployeeDocument(id, uploadForm);
      push(`${uploadForm.name} was uploaded for ${employee ? `${employee.firstName} ${employee.lastName}` : "this employee"}.`, "success", "Document uploaded");
      setUploadOpen(false);
      docs.retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (doc) => {
    setEditingDoc(doc);
    setEditForm({ status: doc.status, file: null });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateDocument(editingDoc.id, editForm);
      push(`${editingDoc.name} was updated.`, "success", "Document updated");
      setEditingDoc(null);
      docs.retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name", header: "Document", render: (r) => (
      <div className="flex items-center gap-2.5"><FileText size={16} className="text-ink-700/40 shrink-0" /><span className="font-medium">{r.name}</span></div>
    ) },
    { key: "category", header: "Category" },
    { key: "date", header: "Date", render: (r) => formatDate(r.date) },
    { key: "version", header: "Version" },
    { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
    { key: "actions", header: "", render: (r) => (
      <div className="flex gap-2 justify-end md:justify-start">
        <Button as="a" href={documentService.downloadUrl(r.id)} target="_blank" rel="noreferrer" variant="ghost" size="sm" aria-label={`Download ${r.name}`}>
          <Download size={14} />
        </Button>
        <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>
          <Pencil size={14} /> Edit
        </Button>
      </div>
    ) },
  ];

  return (
    <div>
      <Link to={ROUTES.ADMIN_EMPLOYEES} className="inline-flex items-center gap-1.5 text-sm text-ink-700/60 hover:text-ink-900 mb-4">
        <ArrowLeft size={14} /> Back to Employees
      </Link>

      <SectionHeading
        eyebrow="Admin"
        title={employee ? `${employee.firstName} ${employee.lastName}'s documents` : "Employee documents"}
        description="Offer letter, contract, handbook, policies, and any other files for this employee — visible for them to download from their own portal."
        action={<Button size="sm" onClick={openUpload}><UploadCloud size={14} /> Upload document</Button>}
      />

      <AsyncBoundary
        status={docs.status} error={docs.error} retry={docs.retry}
        empty={rows.length === 0 && docs.status === "success" ? (
          <EmptyState icon={Inbox} title="No documents yet" description="Upload the first document for this employee." />
        ) : null}
      >
        <Card className="p-5">
          <DataTable columns={columns} rows={rows} keyField="id" />
        </Card>
      </AsyncBoundary>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload document"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button size="sm" form="doc-upload-form" type="submit" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </>
        }
      >
        <form id="doc-upload-form" onSubmit={submitUpload} className="space-y-4">
          <Field label="Document name" htmlFor="docName">
            <Input id="docName" value={uploadForm.name} onChange={(e) => setUploadForm((f) => ({ ...f, name: e.target.value }))} required />
          </Field>
          <Field label="Category" htmlFor="docCategory">
            <select id="docCategory" className={SELECT_CLASS} value={uploadForm.category} onChange={(e) => setUploadForm((f) => ({ ...f, category: e.target.value }))}>
              {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status" htmlFor="docStatus">
            <select id="docStatus" className={SELECT_CLASS} value={uploadForm.status} onChange={(e) => setUploadForm((f) => ({ ...f, status: e.target.value }))}>
              {DOCUMENT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Version" htmlFor="docVersion">
            <Input id="docVersion" value={uploadForm.version} onChange={(e) => setUploadForm((f) => ({ ...f, version: e.target.value }))} />
          </Field>
          <Field label="File" htmlFor="docFile" hint="Any file type, up to 8MB.">
            <input
              id="docFile"
              type="file"
              className={FILE_INPUT_CLASS}
              onChange={(e) => setUploadForm((f) => ({ ...f, file: e.target.files[0] || null }))}
              required
            />
          </Field>
        </form>
      </Modal>

      <Modal
        open={!!editingDoc}
        onClose={() => setEditingDoc(null)}
        title={editingDoc ? `Edit ${editingDoc.name}` : ""}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditingDoc(null)}>Cancel</Button>
            <Button size="sm" form="doc-edit-form" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        <form id="doc-edit-form" onSubmit={submitEdit} className="space-y-4">
          <Field label="Status" htmlFor="docEditStatus">
            <select id="docEditStatus" className={SELECT_CLASS} value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
              {DOCUMENT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Replace file" htmlFor="docEditFile" hint="Optional — leave empty to keep the current file.">
            <input
              id="docEditFile"
              type="file"
              className={FILE_INPUT_CLASS}
              onChange={(e) => setEditForm((f) => ({ ...f, file: e.target.files[0] || null }))}
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
