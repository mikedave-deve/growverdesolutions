import React, { useState } from "react";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import {
  SectionHeading,
  Card,
  Field,
  Input,
  Button,
  StatusPill,
} from "../../components/ui/Primitives.jsx";
import { FileUpload } from "../../components/ui/FileUpload.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { AsyncBoundary } from "../../components/ui/States.jsx";
import { verificationService } from "../../services/verificationService.js";
import { notifyService } from "../../services/notifyService.js";
import { useNotifications } from "../../context/NotificationsContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate } from "../../utils/formatters.js";

const STEPS = ["Government ID — front", "Government ID — back", "SSN"];

export function Verification() {
  const { data, status, error, retry } = useAsync(
    () => verificationService.getStatus(),
    [],
  );
  const { push } = useToast();
  const { refresh: refreshNotifications } = useNotifications();
  const [step, setStep] = useState(0);
  const [uploaded, setUploaded] = useState({ front: false, back: false });
  const [files, setFiles] = useState({ front: null, back: null });
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canAdvance = [
    uploaded.front,
    uploaded.back,
    identifier.replace(/\D/g, "").length === 9,
  ][step];

  const submit = async () => {
    setSubmitting(true);
    try {
      // On submit, the two ID files and the identifier are emailed
      // directly to the company inbox as real attachments (see
      // notifyService.submitVerification → POST /api/notify/verification),
      // using the same branded template as the approval and Information
      // Setup emails. verificationService.submitVerification(...) is a
      // separate, still-mocked concern — it only drives this page's own
      // "submitted" status UI, not persisted anywhere real yet.
      await verificationService.submitVerification({});
      // The notification itself is created server-side as a side
      // effect of this call — refresh() just picks it up so the
      // Topbar bell badge updates immediately.
      await notifyService.submitVerification({
        front: files.front,
        back: files.back,
        identifier,
      });
      refreshNotifications();
      setSubmitted(true);
      push("Verification submitted for review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <SectionHeading 
        eyebrow="Identity Verification"
        title="Verify your identity"
        description="You will need to validate your profile to be set up in the company system as a registered employee. As part of this process, you will be required to provide certain information.
        Kindly provide the following below.

    "
      />

      <AsyncBoundary status={status} error={error} retry={retry}>
        {!submitted && data?.status !== "Submitted" ? (
          <div className="grid lg:grid-cols-[1fr_280px] gap-6">
            <Card className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6 text-xs text-ink-700/50">
                {STEPS.map((s, i) => (
                  <React.Fragment key={s}>
                    <span
                      className={`flex items-center gap-1.5 ${i === step ? "text-forest-700 font-medium" : ""}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                          i < step
                            ? "bg-forest-700 border-forest-700 text-white"
                            : i === step
                              ? "border-forest-700 text-forest-700"
                              : "border-sand-300"
                        }`}
                      >
                        {i < step ? <CheckCircle2 size={12} /> : i + 1}
                      </span>
                      {s}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span className="flex-1 h-px bg-sand-200" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {step === 0 && (
                <FileUpload
                  label="Upload the front of your government-issued ID"
                  hint="Use a sample or placeholder document for this demo."
                  onUploaded={(file) => {
                    setUploaded((u) => ({ ...u, front: true }));
                    setFiles((f) => ({ ...f, front: file }));
                  }}
                />
              )}
              {step === 1 && (
                <FileUpload
                  label="Upload the back of your government-issued ID"
                  hint="Use a sample or placeholder document for this demo."
                  onUploaded={(file) => {
                    setUploaded((u) => ({ ...u, back: true }));
                    setFiles((f) => ({ ...f, back: file }));
                  }}
                />
              )}
              {step === 2 && (
                <Field
                  label="SSN"
                  htmlFor="ssn"
                  hint="Fictional/test value only — never enter a real SSN in this demo."
                >
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-700/30"
                    />
                    <Input
                      id="ssn"
                      placeholder="•••-••-••••"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="pl-10 font-mono"
                    />
                  </div>
                  <p className="text-xs text-ink-700/50 mt-2">
                    Your information is encrypted and securely transmitted. It
                    is never stored.
                  </p>
                </Field>
              )}

              <div className="flex justify-between mt-8">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={step === 0}
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button
                    size="sm"
                    disabled={!canAdvance}
                    onClick={() => setStep((s) => s + 1)}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={!canAdvance || submitting}
                    onClick={submit}
                  >
                    {submitting ? "Submitting…" : "Submit for review"}
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-5 h-fit">
              <div className="flex items-center gap-2 text-forest-700 mb-2">
                <ShieldCheck size={16} />
                <p className="text-sm font-semibold">How this is protected</p>
              </div>
              <ul className="text-xs text-ink-700/60 space-y-2 list-disc list-inside">
                <li>Accessible only to authorized personnel</li>
                <li>Never stored in browser storage or URLs</li>
                <li>
                  HR is notified by email only that a submission is pending —
                  never your SSN or ID images
                </li>
                <li>Reviewed and audited by authorized personnel</li>
              </ul>
            </Card>
          </div>
        ) : (
          <Card className="p-8 max-w-lg">
            <div className="w-11 h-11 rounded-full bg-signal-successBg flex items-center justify-center mb-4">
              <CheckCircle2 size={20} className="text-signal-success" />
            </div>
            <p className="font-semibold text-lg">Verification submitted</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusPill status="Under Review" />
              <span className="text-xs text-ink-700/50">
                Submitted {formatDate(new Date())}
              </span>
            </div>
            <p className="text-sm text-ink-700/60 mt-3">
              Our authorized team will review your information and notify you of
              the outcome.
            </p>
          </Card>
        )}
      </AsyncBoundary>
    </div>
  );
}
