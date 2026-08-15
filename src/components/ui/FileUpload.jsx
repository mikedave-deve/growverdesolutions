import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, File, X, RotateCw, CheckCircle2, AlertCircle } from "lucide-react";

const DEFAULT_ACCEPT = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_SIZE_MB = 10;

export function FileUpload({ label, hint, accept = DEFAULT_ACCEPT, onUploaded }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [state, setState] = useState("idle"); // idle | uploading | success | error
  const [error, setError] = useState("");

  const validate = (f) => {
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!accept.includes(ext)) return `Unsupported file type. Use ${accept.join(", ")}.`;
    if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    return null;
  };

  const upload = useCallback((f) => {
    const err = validate(f);
    if (err) {
      setFile(f);
      setError(err);
      setState("error");
      return;
    }
    setFile(f);
    setState("uploading");
    setError("");
    // Simulated upload — a real implementation streams to a signed URL.
    setTimeout(() => {
      const ok = Math.random() > 0.08;
      setState(ok ? "success" : "error");
      if (!ok) setError("Upload failed. Check your connection and retry.");
      else onUploaded?.(f);
    }, 1100);
  }, [onUploaded]);

  const reset = () => {
    setFile(null);
    setState("idle");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {label && <p className="text-sm font-medium text-ink-800 mb-1.5">{label}</p>}
      {!file ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files[0]) upload(e.dataTransfer.files[0]);
          }}
          className={`flex flex-col items-center justify-center text-center gap-2 border-2 border-dashed rounded-xl px-6 py-8 cursor-pointer transition-colors ${
            dragOver ? "border-forest-500 bg-forest-50" : "border-sand-300 hover:border-forest-400"
          }`}
        >
          <UploadCloud size={22} className="text-forest-600" />
          <p className="text-sm text-ink-800">
            <span className="font-medium text-forest-700">Choose a file</span> or drag it here
          </p>
          <p className="text-xs text-ink-700/50">{accept.join(", ")} · up to {MAX_SIZE_MB}MB</p>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={accept.join(",")}
            onChange={(e) => e.target.files[0] && upload(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="border border-sand-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <File size={18} className="text-ink-700/50 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-ink-700/50">
              {state === "uploading" && "Uploading…"}
              {state === "success" && "Uploaded"}
              {state === "error" && error}
            </p>
          </div>
          {state === "uploading" && <RotateCw size={16} className="animate-spin text-ink-700/50 shrink-0" />}
          {state === "success" && <CheckCircle2 size={18} className="text-signal-success shrink-0" />}
          {state === "error" && <AlertCircle size={18} className="text-signal-error shrink-0" />}
          {state === "error" ? (
            <button onClick={() => upload(file)} className="text-xs font-medium text-forest-700 hover:underline shrink-0">Retry</button>
          ) : (
            <button onClick={reset} aria-label="Remove file" className="text-ink-700/40 hover:text-ink-900 shrink-0"><X size={16} /></button>
          )}
        </div>
      )}
      {hint && <p className="text-xs text-ink-700/50 mt-1.5">{hint}</p>}
    </div>
  );
}
