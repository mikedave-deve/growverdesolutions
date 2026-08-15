import React, { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Camera, RotateCw } from "lucide-react";
import { Card, Field, Input, Button, SectionHeading } from "../../components/ui/Primitives.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { employeeService } from "../../services/employeeService.js";
import { formatDate } from "../../utils/formatters.js";

const PHOTO_ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_MAX_MB = 3;

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-sand-100 last:border-0 text-sm">
      <span className="text-ink-700/50">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}

export function Profile() {
  const { user } = useOutletContext();
  const { push } = useToast();
  const { setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);
  const [contact, setContact] = useState({ email: user.email, phone: user.phone });

  const choosePhoto = () => photoInputRef.current?.click();

  const onPhotoSelected = async (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!PHOTO_ACCEPT.includes(file.type)) {
      push("Unsupported image type. Use JPG, PNG, or WEBP.", "error");
      return;
    }
    if (file.size > PHOTO_MAX_MB * 1024 * 1024) {
      push(`Image is too large. Maximum size is ${PHOTO_MAX_MB}MB.`, "error");
      return;
    }

    setUploadingPhoto(true);
    try {
      const { user: updated } = await employeeService.uploadProfilePhoto(file);
      setUser(updated);
      push("Profile photo updated.");
    } catch (err) {
      push(err.message || "Couldn't upload that photo. Please try again.", "error");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const saveContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await employeeService.updateProfile(contact);
      setUser(updated);
      push("Contact information updated.");
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeading eyebrow="Profile" title="Employee profile" />

      <Card className="p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-forest-100 text-forest-700 text-2xl font-semibold flex items-center justify-center">
                {user.avatarInitials}
              </div>
            )}
            <button
              onClick={choosePhoto}
              disabled={uploadingPhoto}
              aria-label="Change profile picture"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-ink-900 text-white flex items-center justify-center border-2 border-white hover:bg-ink-800 disabled:opacity-60"
            >
              {uploadingPhoto ? <RotateCw size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept={PHOTO_ACCEPT.join(",")}
              onChange={onPhotoSelected}
              className="sr-only"
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold">{user.firstName} {user.lastName}</h3>
            <p className="text-ink-700/70">{user.jobTitle}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2 text-xs text-ink-700/50 font-mono">
              <span>Employee ID: {user.employeeId}</span>
              <span>·</span>
              <span>{user.department}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <p className="font-semibold mb-1">Employment information</p>
          <p className="text-sm text-ink-700/50 mb-3">Managed by HR — contact your administrator to request changes.</p>
          <InfoRow label="Employment status" value={user.employmentStatus} />
          <InfoRow label="Department" value={user.department} />
          <InfoRow label="Manager" value={user.manager} />
          <InfoRow label="Location" value={user.location} />
          <InfoRow label="Start date" value={formatDate(user.startDate)} />
        </Card>

        <Card className="p-6">
          <p className="font-semibold mb-4">Contact information</p>
          <form onSubmit={saveContact} className="space-y-4">
            <Field label="Email" htmlFor="pemail">
              <Input id="pemail" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            </Field>
            <Field label="Phone" htmlFor="pphone">
              <Input id="pphone" type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
            </Field>
            <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
