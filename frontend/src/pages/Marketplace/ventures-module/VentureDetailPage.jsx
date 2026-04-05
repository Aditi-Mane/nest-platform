import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Heart, Share2, Users, CheckCircle2, Clock,
  TrendingUp, Loader2, ChevronRight, Star,
  Trash2, Pencil, X, Check, AlertCircle, ExternalLink,
  Send, ToggleLeft, ToggleRight, UserPlus, Award, Plus, MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchVentureById, toggleLike, toggleFollow, toggleEndorse, applyToVenture,
  fetchApplications, updateApplication,
  postUpdate, addComment,
  updateVenture, removeTeamMember,
  getApplicationStatus,
} from "@/api/venturesApi";
import { useUser } from "@/context/UserContext";
import api from "../../../api/axios";

// ── Stage config ──────────────────────────────────────────────────────────────
const stageConfig = {
  ideation:         { label: "Ideation",        className: "bg-purple-100 text-purple-700 border-purple-200" },
  building:         { label: "Building",        className: "bg-blue-100 text-blue-700 border-blue-200" },
  "ready-to-pitch": { label: "Ready to Pitch",  className: "bg-green-100 text-green-700 border-green-200" },
  active:           { label: "Active",          className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  recruiting:       { label: "Recruiting",      className: "bg-orange-100 text-orange-700 border-orange-200" },
};

// ── Generic Confirm Modal ─────────────────────────────────────────────────────
function ConfirmModal({ title, description, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <Card className="w-full max-w-sm rounded-2xl shadow-xl border border-border" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white gap-2"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Confirm
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Apply Modal (3-step) ──────────────────────────────────────────────────────
function ApplyModal({ venture, onClose, onSuccess }) {
  const [step, setStep]             = useState(1);
  const [role, setRole]             = useState("");
  const [customRole, setCustomRole] = useState("");
  const [whyJoin, setWhyJoin]       = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedRole = role === "Other" ? customRole : role;

  const handleSubmit = async () => {
    if (!selectedRole.trim()) { toast.error("Please select a role."); return; }
    if (!whyJoin.trim())      { toast.error("Please tell us why you want to join."); return; }
    try {
      setSubmitting(true);
      const { data } = await applyToVenture(venture._id, {
        roleAppliedFor: selectedRole,
        whyJoin,
        portfolioUrl: portfolioUrl || undefined,
        resumeUrl:    resumeUrl    || undefined,
      });
      setStep(3);
      onSuccess(data.application);
      toast.success("Application Sent!")
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to send application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-lg rounded-2xl shadow-xl border border-border" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Join {venture.title}</CardTitle>
              {step < 3 && <p className="text-xs text-muted-foreground mt-0.5">Step {step} of 2</p>}
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onClose}>✕</Button>
          </div>
          {step < 3 && (
            <div className="flex gap-1.5 mt-3">
              {[1, 2].map((s) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Which role are you applying for?</p>
              <div className="space-y-2">
                {venture.openRoles?.map((r) => (
                  <button key={r._id} onClick={() => setRole(r.title)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
                      role === r.title ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-primary/50"
                    }`}>
                    <span className="font-medium">{r.title}</span>
                    <span className="text-muted-foreground ml-2">— {r.skills?.join(", ")}</span>
                  </button>
                ))}
                <button onClick={() => setRole("Other")}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
                    role === "Other" ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-primary/50"
                  }`}>
                  Other (specify)
                </button>
              </div>
              {role === "Other" && (
                <Input placeholder="Describe your role..." value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)} className="rounded-xl" autoFocus />
              )}
              <Button className="w-full rounded-xl gap-2"
                disabled={!role || (role === "Other" && !customRole.trim())}
                onClick={() => setStep(2)}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Why do you want to join? *
                  <span className="text-muted-foreground font-normal ml-1">(max 200 chars)</span>
                </Label>
                <Textarea placeholder="Tell the creator what you'll bring to the team..."
                  value={whyJoin} onChange={(e) => setWhyJoin(e.target.value.slice(0, 200))}
                  rows={4} className="mt-1.5 rounded-xl" />
                <p className="text-xs text-muted-foreground mt-1 text-right">{whyJoin.length}/200</p>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Portfolio / GitHub / LinkedIn
                  <span className="text-muted-foreground font-normal ml-1">(recommended)</span>
                </Label>
                <Input placeholder="https://github.com/yourusername" value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)} className="mt-1.5 rounded-xl" />
              </div>
              <div>
                <Label className="text-sm font-medium">
                  Resume URL <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                </Label>
                <Input placeholder="Link to your resume (Google Drive, Notion, etc.)" value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)} className="mt-1.5 rounded-xl" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1 rounded-xl" disabled={!whyJoin.trim() || submitting} onClick={handleSubmit}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Request"}
                </Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-lg">Request Sent!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your application has been sent to <span className="font-medium">{venture.creator?.name}</span>.
                  You'll get a notification when they respond.
                </p>
              </div>
              <Button className="w-full rounded-xl" onClick={onClose}>Done</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Applications Tab (creator only) ──────────────────────────────────────────
function ApplicationsTab({ ventureId, onVentureUpdate }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionId, setActionId]         = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await fetchApplications(ventureId);
        setApplications(data.applications ?? []);
      } catch {
        toast.error("Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ventureId]);

  const handleAction = async (appId, status) => {
    try {
      setActionId(appId);
      await updateApplication(ventureId, appId, { status });
      setApplications((prev) => prev.map((a) => (a._id === appId ? { ...a, status } : a)));
      toast.success(status === "accepted" ? "Application accepted!" : "Application rejected.");
      if (onVentureUpdate) onVentureUpdate();
    } catch {
      toast.error("Failed to update application.");
    } finally {
      setActionId(null);
    }
  };

  const statusBadge = (s) => ({
    pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
    accepted: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  }[s] ?? "bg-yellow-100 text-yellow-700 border-yellow-200");

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <UserPlus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium">No applications yet</p>
        <p className="text-sm text-muted-foreground mt-1">Applications will appear here once students apply.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Applications ({applications.length})</h3>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{applications.filter((a) => a.status === "pending").length} pending</span>
          <span>·</span>
          <span>{applications.filter((a) => a.status === "accepted").length} accepted</span>
        </div>
      </div>
      {applications.map((app) => (
        <div key={app._id} className="p-4 bg-gray-50 rounded-xl border border-border">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={app.applicant?.avatar} />
              <AvatarFallback>{app.applicant?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">{app.applicant?.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(app.status)}`}>{app.status}</span>
                <Badge variant="outline" className="text-xs">{app.roleAppliedFor}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{app.applicant?.major}</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{app.whyJoin}</p>
              <div className="flex gap-3 mt-2">
                {app.portfolioUrl && (
                  <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="h-3 w-3" /> Portfolio
                  </a>
                )}
                {app.resumeUrl && (
                  <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="h-3 w-3" /> Resume
                  </a>
                )}
              </div>
            </div>
          </div>
          {app.status === "pending" && (
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 gap-1.5"
                disabled={actionId === app._id} onClick={() => handleAction(app._id, "accepted")}>
                {actionId === app._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Accept
              </Button>
              <Button size="sm" variant="outline"
                className="flex-1 rounded-xl text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                disabled={actionId === app._id} onClick={() => handleAction(app._id, "rejected")}>
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Manage Tab (creator only) ─────────────────────────────────────────────────
function ManageTab({ venture, onVentureUpdate, onArchiveClick }) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]     = useState(false);

  const [editData, setEditData] = useState({
    title:           venture.title,
    description:     venture.description,
    fullDescription: venture.fullDescription ?? "",
    stage:           venture.stage,
    teamLimit:       venture.teamLimit ?? 5,
  });

  // Roles
  const [openRoles, setOpenRoles]   = useState(venture.openRoles ?? []);
  const [newRole, setNewRole]       = useState({ title: "", skills: "", spots: 1 });
  const [addingRole, setAddingRole] = useState(false);
  const [roleError, setRoleError]   = useState("");

  // Progress update
  const [updateText, setUpdateText]       = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [updates, setUpdates]             = useState(venture.updates ?? []);

  const set = (field, value) => setEditData((prev) => ({ ...prev, [field]: value }));

  // ── Save venture details ──
  const handleSaveInfo = async () => {
    if (!editData.title.trim()) { toast.error("Title is required."); return; }
    try {
      setSaving(true);
      const { data } = await updateVenture(venture._id, {
        title:           editData.title,
        description:     editData.description,
        fullDescription: editData.fullDescription,
        stage:           editData.stage,
        teamLimit:       Number(editData.teamLimit),
      });
      onVentureUpdate(data.venture);
      setEditMode(false);
      toast.success("Venture updated!");
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle recruiting ──
  const handleToggleRecruiting = async () => {
    try {
      const { data } = await updateVenture(venture._id, { isRecruiting: !venture.isRecruiting });
      onVentureUpdate(data.venture);
      toast.success(data.venture.isRecruiting ? "Recruiting enabled." : "Recruiting paused.");
    } catch {
      toast.error("Failed to update recruiting status.");
    }
  };

  // ── Add role ──
  const handleAddRole = async () => {
    setRoleError("");
    if (!newRole.title.trim()) { setRoleError("Role title is required."); return; }
    if (Number(newRole.spots) < 1) { setRoleError("Openings must be at least 1."); return; }
    try {
      setAddingRole(true);
      const skillsArray = newRole.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const updatedRoles = [
        ...openRoles,
        { title: newRole.title.trim(), skills: skillsArray, spots: Number(newRole.spots) },
      ];
      const { data } = await updateVenture(venture._id, { openRoles: updatedRoles });
      setOpenRoles(data.venture.openRoles);
      onVentureUpdate(data.venture);
      setNewRole({ title: "", skills: "", spots: 1 });
      toast.success("Role added.");
    } catch {
      toast.error("Failed to add role.");
    } finally {
      setAddingRole(false);
    }
  };

  // ── Delete role ──
  const handleDeleteRole = async (roleId) => {
    try {
      const updatedRoles = openRoles.filter((r) => (r._id ?? r.title) !== (roleId ?? r.title));
      const { data } = await updateVenture(venture._id, { openRoles: updatedRoles });
      setOpenRoles(data.venture.openRoles);
      onVentureUpdate(data.venture);
      toast.success("Role removed.");
    } catch {
      toast.error("Failed to remove role.");
    }
  };

  // ── Post progress update ──
  const handlePostUpdate = async () => {
    if (!updateText.trim()) { toast.error("Write something first."); return; }
    try {
      setPostingUpdate(true);
      const { data } = await postUpdate(venture._id, { text: updateText });
      // backend returns { venture } — grab the first update
      const newUpdate = data.update ?? data.venture?.updates?.[0];
      if (newUpdate) setUpdates((prev) => [newUpdate, ...prev]);
      setUpdateText("");
      toast.success("Update posted!");
    } catch {
      toast.error("Failed to post update.");
    } finally {
      setPostingUpdate(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* ── Venture Details ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Venture Details</h3>
          {!editMode
            ? <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => setEditMode(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            : <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setEditMode(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button size="sm" className="rounded-xl gap-1" onClick={handleSaveInfo} disabled={saving}>
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Changes
                </Button>
              </div>
          }
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={editData.title} onChange={(e) => set("title", e.target.value)} className="mt-1.5 rounded-xl" />
            </div>
            <div>
              <Label>Short Description</Label>
              <Textarea
                value={editData.description}
                onChange={(e) => set("description", e.target.value.slice(0, 300))}
                rows={3} className="mt-1.5 rounded-xl"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{editData.description.length}/300</p>
            </div>
            <div>
              <Label>Full Description</Label>
              <Textarea
                value={editData.fullDescription}
                onChange={(e) => set("fullDescription", e.target.value)}
                rows={6} className="mt-1.5 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stage</Label>
                <select
                  className="mt-1.5 w-full text-sm border border-border rounded-xl px-3 py-2 bg-white"
                  value={editData.stage}
                  onChange={(e) => set("stage", e.target.value)}
                >
                  <option value="ideation">Ideation</option>
                  <option value="building">Building</option>
                  <option value="ready-to-pitch">Ready to Pitch</option>
                  <option value="recruiting">Recruiting</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <div>
                <Label>Max Team Size</Label>
                <Input
                  type="number" min={1} max={50}
                  value={editData.teamLimit}
                  onChange={(e) => set("teamLimit", e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl border border-border space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="font-medium text-sm">{venture.title}</p>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${stageConfig[venture.stage]?.className ?? ""}`}>
                {stageConfig[venture.stage]?.label}
              </span>
              <span className="text-xs text-muted-foreground">Team limit: {venture.teamLimit}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{venture.description}</p>
          </div>
        )}
      </div>

      {/* ── Recruiting Toggle + Roles ── */}
      <div>
        <h3 className="font-semibold mb-4">Recruiting</h3>

        <div
          onClick={handleToggleRecruiting}
          className={`p-4 rounded-xl border cursor-pointer transition-colors mb-4 ${
            venture.isRecruiting ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-border hover:border-orange-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Actively Recruiting</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {venture.isRecruiting ? "Students can submit join requests" : "Applications are paused"}
              </p>
            </div>
            {venture.isRecruiting
              ? <ToggleRight className="h-6 w-6 text-orange-600" />
              : <ToggleLeft className="h-6 w-6 text-muted-foreground" />
            }
          </div>
        </div>

        {/* Roles — shown only when recruiting is ON */}
        {venture.isRecruiting && (
          <div className="space-y-4">

            {openRoles.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">No roles added yet. Add one below.</p>
            )}

            {openRoles.map((role) => (
              <div key={role._id ?? role.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-border">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{role.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {role.spots} opening{role.spots !== 1 ? "s" : ""}
                    {role.skills?.length > 0 && ` · ${role.skills.join(", ")}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteRole(role._id)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}

            {/* Add role form */}
            <div className="p-4 border border-dashed border-border rounded-xl space-y-3 bg-gray-50/50">
              <p className="text-sm font-medium">Add a new role</p>
              <div>
                <Label className="text-xs">Role Title *</Label>
                <Input
                  placeholder="e.g. Frontend Developer"
                  value={newRole.title}
                  onChange={(e) => { setNewRole((r) => ({ ...r, title: e.target.value })); setRoleError(""); }}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs">
                  Required Skills{" "}
                  <span className="text-muted-foreground font-normal">(comma-separated)</span>
                </Label>
                <Input
                  placeholder="e.g. React, TypeScript, CSS"
                  value={newRole.skills}
                  onChange={(e) => setNewRole((r) => ({ ...r, skills: e.target.value }))}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs">Number of Openings</Label>
                <Input
                  type="number" min={1} value={newRole.spots}
                  onChange={(e) => setNewRole((r) => ({ ...r, spots: e.target.value }))}
                  className="mt-1 rounded-xl w-28"
                />
              </div>
              {roleError && <p className="text-xs text-red-600">{roleError}</p>}
              <Button
                variant="outline" size="sm" className="rounded-xl gap-1.5"
                onClick={handleAddRole}
                disabled={addingRole || !newRole.title.trim()}
              >
                {addingRole ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add Role
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Post Progress Update ── */}
      <div>
        <h3 className="font-semibold mb-4">Post Progress Update</h3>
        <Textarea
          placeholder="Share a milestone, achievement, or any update with your followers…"
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
          rows={3} className="rounded-xl"
        />
        <Button
          className="mt-2 gap-2 rounded-xl"
          onClick={handlePostUpdate}
          disabled={postingUpdate || !updateText.trim()}
        >
          {postingUpdate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Post Update
        </Button>

        {updates.length > 0 && (
          <div className="mt-4 space-y-3">
            {updates.slice(0, 5).map((u, i) => (
              <div key={u?._id ?? i} className="border-l-2 border-primary pl-4 py-1">
                <p className="text-xs text-muted-foreground mb-1">
                  {new Date(u?.postedAt ?? u?.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm">{u?.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Danger Zone ── */}
      <div className="p-4 rounded-xl border border-red-200 bg-red-50">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="font-medium text-sm text-red-700">Danger Zone</p>
        </div>
        <p className="text-sm text-red-600 mb-3">
          Archiving will permanently hide this venture from all listings and revoke team access.
        </p>
        <Button
          variant="outline" size="sm"
          className="rounded-xl text-red-600 border-red-300 hover:bg-red-100 gap-2"
          onClick={onArchiveClick}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          Archive Venture
        </Button>
      </div>
    </div>
  );
}

// ── Comments Section ──────────────────────────────────────────────────────────
function CommentsTab({ ventureId, initialComments = [] }) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText]         = useState("");
  const [posting, setPosting]   = useState(false);

  const handlePost = async () => {
    if (!text.trim()) return;
    try {
      setPosting(true);
      const { data } = await addComment(ventureId, { text });
      setComments((prev) => [data.comment, ...prev]);
      setText("");
    } catch {
      toast.error("Failed to post comment.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Textarea
          placeholder="Ask a question, give feedback, or show interest…"
          value={text} onChange={(e) => setText(e.target.value)}
          rows={3}  className="rounded-xl border-border focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-border"
        />
        <Button className="mt-2 gap-2 rounded-xl" onClick={handlePost} disabled={posting || !text.trim()}>
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Post Comment
        </Button>
      </div>
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No comments yet. Be the first to start the conversation!
        </p>
      )}
      <div className="space-y-4">
        {comments.map((c, i) => (
          <div key={c._id ?? i} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={c.user?.avatar} />
              <AvatarFallback>{c.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 p-3 bg-gray-50 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium">{c.user?.name ?? "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function VentureDetailPage() {
  const navigate       = useNavigate();
  const { id }         = useParams();
  const [searchParams] = useSearchParams();
  const { user }       = useUser();

  const [venture, setVenture]                 = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);
  const [hasLiked, setHasLiked]               = useState(false);
  const [hasFollowed, setHasFollowed]         = useState(false);
  const [hasEndorsed, setHasEndorsed]         = useState(false);
  const [showApplyModal, setShowApplyModal]   = useState(false);
  const [likeCount, setLikeCount]             = useState(0);
  const [endorseCount, setEndorseCount]       = useState(0);
  const [userApplication, setUserApplication] = useState(null);

  // Remove-member modal
  const [removingMember, setRemovingMember] = useState(null); // member object
  const [removeLoading, setRemoveLoading]   = useState(false);

  // Archive confirm modal
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiveLoading, setArchiveLoading]         = useState(false);

  const defaultTab = searchParams.get("tab") ?? "overview";
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await fetchVentureById(id);
        const v = data.venture;
        setVenture(v);
        setLikeCount(v.likes?.length ?? 0);
        setEndorseCount(v.endorsements?.length ?? 0);
        if (user) {
          setHasLiked(v.likes?.includes(user._id) ?? false);
          setHasFollowed(v.followers?.includes(user._id) ?? false);
          setHasEndorsed(v.endorsements?.includes(user._id) ?? false);
          try {
            const { data: appData } = await getApplicationStatus(id);
            if (appData.status) setUserApplication(appData);
          } catch { /* not applied */ }
        }
      } catch {
        setError("Failed to load venture.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const refetchVenture = async () => {
    try {
      const { data } = await fetchVentureById(id);
      const v = data.venture;
      setVenture(v);
      setLikeCount(v.likes?.length ?? 0);
      setEndorseCount(v.endorsements?.length ?? 0);
      if (user) {
        setHasLiked(v.likes?.includes(user._id) ?? false);
        setHasFollowed(v.followers?.includes(user._id) ?? false);
        setHasEndorsed(v.endorsements?.includes(user._id) ?? false);
      }
    } catch { /* silent */ }
  };

  const isCreator = venture && user &&
    (venture.creator?._id === user._id || venture.creator === user._id);

  const handleLike = async () => {
    try { const { data } = await toggleLike(id); setHasLiked(data.liked); setLikeCount(data.likes); }
    catch { toast.error("Failed to update like."); }
  };

  const handleFollow = async () => {
    try { const { data } = await toggleFollow(id); setHasFollowed(data.following); toast.success(data.following ? "Following!" : "Unfollowed."); }
    catch { toast.error("Failed to update follow."); }
  };

  const handleEndorse = async () => {
    try { const { data } = await toggleEndorse(id); setHasEndorsed(data.endorsed); setEndorseCount(data.endorsements); toast.success(data.endorsed ? "Endorsed!" : "Endorsement removed."); }
    catch { toast.error("Failed to update endorsement."); }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: venture.title, text: venture.description, url }); return; }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      try {
        const ta = document.createElement("textarea"); ta.value = url;
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
        toast.success("Link copied!");
      } catch { toast.error("Failed to share."); }
    }
  };

  // ── Confirm remove team member ──
  const handleConfirmRemove = async () => {
    if (!removingMember) return;
    try {
      setRemoveLoading(true);
      await removeTeamMember(venture._id, removingMember.user._id);
      setVenture((prev) => ({
        ...prev,
        teamMembers: prev.teamMembers.filter((m) => m.user._id !== removingMember.user._id),
      }));
      toast.success(`${removingMember.user.name} removed from the team.`);
    } catch {
      toast.error("Failed to remove member.");
    } finally {
      setRemoveLoading(false);
      setRemovingMember(null);
    }
  };

  // ── Confirm archive ──
  const handleConfirmArchive = async () => {
    try {
      setArchiveLoading(true);
      await api.delete(`/ventures/${venture._id}`);
      toast.success("Venture archived successfully.");
      navigate("/marketplace/buyer/ventures");
    } catch {
      toast.error("Failed to archive venture.");
      setArchiveLoading(false);
      setShowArchiveConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !venture) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error ?? "Venture not found."}</p>
        <Button variant="outline" className="rounded-xl" onClick={() => navigate("/marketplace/buyer/ventures")}>
          Back to Ventures
        </Button>
      </div>
    );
  }

  const stage          = stageConfig[venture.stage] ?? stageConfig.ideation;
  const confirmedCount = venture.teamMembers?.filter((m) => m.confirmed).length ?? 0;
  const spotsLeft      = venture.teamLimit - confirmedCount;

  const tabs = [
    { key: "overview",  label: "Overview"  },
    { key: "team",      label: "Team"      },
    { key: "updates",   label: "Updates"   },
    { key: "comments",  label: "Comments"  },
    ...(isCreator ? [
      { key: "applications", label: "Applications" },
      { key: "manage",       label: "Manage"       },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Always single-column, max-w-4xl */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/marketplace/buyer/ventures")}>
          <ArrowLeft className="h-4 w-4" /> Back to Ventures
        </Button>

        <div className="flex flex-col gap-6">

          {/* ── Hero Card ── */}
          <Card className="rounded-2xl shadow-md border border-border/60 bg-card/50">
            <CardContent className="p-8">

              <div className="flex items-start justify-between mb-5">
                <div className="flex gap-2 flex-wrap items-center">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border flex items-center justify-center ${stage.className}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs font-medium px-3 py-1 rounded-full border bg-card text-gray-700 border-primary/70 flex items-center justify-center">
                    {venture.category}
                  </span>
                  {venture.isRecruiting && (
                    <span className="text-xs font-medium px-3 py-1 rounded-full border bg-orange-100 text-orange-700 border-orange-200 flex items-center gap-1">
                      🚀 Hiring
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon"
                    className={`rounded-xl transition-all hover:scale-105 ${hasLiked ? "text-red-500 border-red-300 bg-red-50" : ""}`}
                    onClick={handleLike}>
                    <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon"
                    className={`rounded-xl transition-all hover:scale-105 ${hasEndorsed ? "text-yellow-500 border-yellow-400 bg-yellow-50" : ""}`}
                    onClick={handleEndorse}>
                    <Award className={`h-4 w-4 ${hasEndorsed ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="outline" size="icon"
                    className={`rounded-xl transition-all hover:scale-105 ${hasFollowed ? "text-primary border-primary/40 bg-primary/10" : ""}`}
                    onClick={handleFollow}>
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-xl hover:scale-105 transition-all" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight tracking-tight">{venture.title}</h1>
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-6 max-w-3xl">{venture.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {venture.tags?.map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium">{confirmedCount}/{venture.teamLimit}</span>
                  <span className="text-muted-foreground text-xs">Members</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-medium">{likeCount}</span>
                  <span className="text-muted-foreground text-xs">Likes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{endorseCount}</span>
                  <span className="text-muted-foreground text-xs">Endorsements</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{new Date(venture.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {/* ── Team Chat shortcut — visible to creator and accepted members ── */}
              {(isCreator || userApplication?.status === "accepted") && (
                <div className="mt-4 pt-4 border-t border-border/60">
                  <Button
                    variant="outline"
                    className="gap-2 rounded-xl w-full sm:w-auto"
                    onClick={() =>
                      navigate("/marketplace/buyer/ventures/chats", {
                        state: { selectedVentureId: venture._id },
                      })
                    }
                  >
                    <MessageCircle className="h-4 w-4" />
                    Go to Team Chat
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>

          {/* ── Tabs ── */}
          <Card className="rounded-2xl shadow-sm border border-border">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex w-full bg-muted/50 p-1 rounded-xl mb-6 backdrop-blur-sm overflow-x-auto">
                  {tabs.map(({ key, label }) => (
                    <TabsTrigger key={key} value={key}
                      className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm
                        text-muted-foreground hover:text-foreground whitespace-nowrap">
                      {label}
                      {key === "applications" && (
                        <span className="ml-1.5 text-xs bg-primary/20 text-primary rounded-full px-1.5 py-0.5">•</span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Full Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">{venture.fullDescription}</p>
                  </div>
                  {venture.openRoles?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">We're Looking For</h3>
                      <div className="space-y-3">
                        {venture.openRoles.map((role) => (
                          <div key={role._id} className="p-4 bg-gray-50 rounded-xl border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-sm">{role.title}</p>
                              <Badge variant="secondary" className="rounded-lg !text-white">
                                {role.spots} spot{role.spots > 1 ? "s" : ""}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {role.skills?.map((s) => (
                                <Badge key={s} variant="outline" className="text-xs rounded-full">{s}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Team */}
                <TabsContent value="team" className="space-y-4">
                  <h3 className="font-semibold">Team Members ({venture.teamMembers?.length ?? 0})</h3>
                  {venture.teamMembers?.map((member, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-border">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.user?.avatar} />
                        <AvatarFallback>{member.user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-sm text-primary">{member.user?.name}</p>
                          {!member.confirmed && <Badge variant="outline" className="text-xs">Pending</Badge>}
                        </div>
                        <p className="text-[12px] text-muted-foreground">{member.role}</p>
                        <p className="text-[11px] text-muted-foreground/70">{member.user?.collegeName}</p>
                      </div>
                      {/* Remove button — creator only, not for self */}
                      {isCreator && member.user?._id !== user?._id && (
                        <Button variant="ghost" size="icon"
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          title="Remove member"
                          onClick={() => setRemovingMember(member)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {(!venture.teamMembers || venture.teamMembers.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">No team members yet.</p>
                  )}
                </TabsContent>

                {/* Updates */}
                <TabsContent value="updates" className="space-y-4">
                  <h3 className="font-semibold">Progress Updates</h3>
                  {venture.updates?.length > 0 ? (
                    venture.updates.map((u) => (
                      <div key={u._id} className="border-l-2 border-primary pl-4 py-1">
                        <p className="text-xs text-muted-foreground mb-1">
                          {new Date(u.postedAt ?? u.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm">{u.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No updates posted yet.</p>
                  )}
                </TabsContent>

                {/* Comments */}
                <TabsContent value="comments">
                  <CommentsTab ventureId={venture._id} initialComments={venture.comments ?? []} />
                </TabsContent>

                {/* Applications — creator only */}
                {isCreator && (
                  <TabsContent value="applications">
                    <ApplicationsTab ventureId={venture._id} onVentureUpdate={refetchVenture} />
                  </TabsContent>
                )}

                {/* Manage — creator only */}
                {isCreator && (
                  <TabsContent value="manage">
                    <ManageTab
                      venture={venture}
                      onVentureUpdate={(updated) => setVenture(updated)}
                      onArchiveClick={() => setShowArchiveConfirm(true)}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>

          {/* ── Non-creator: application status / join CTA ── */}
          {!isCreator && (
            <>
              {userApplication?.status === "pending" && (
                <Card className="rounded-2xl shadow-sm border border-yellow-300 bg-yellow-50">
                  <CardContent className="p-6 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-700">Application Pending</p>
                      <p className="text-sm text-muted-foreground">Your application has been sent. The creator will review it soon.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {userApplication?.status === "accepted" && (
                <Card className="rounded-2xl shadow-sm border border-green-300 bg-green-50">
                  <CardContent className="p-6 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-700">Welcome to the Team!</p>
                      <p className="text-sm text-muted-foreground mb-3">Congratulations! Your application has been accepted.</p>
                      <Button className="rounded-xl" variant="outline" onClick={() => setActiveTab("team")}>View Team</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              {userApplication?.status === "rejected" && (
                <Card className="rounded-2xl shadow-sm border border-red-300 bg-red-50">
                  <CardContent className="p-6 flex items-start gap-3">
                    <X className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-700">Application Not Accepted</p>
                      <p className="text-sm text-muted-foreground mb-3">Unfortunately, your application was not accepted at this time.</p>
                      {userApplication.creatorNote && (
                        <div className="p-3 bg-white rounded-lg border">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Creator's Note:</p>
                          <p className="text-sm">{userApplication.creatorNote}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {!userApplication && spotsLeft > 0 && venture.isRecruiting && (
                <Card className="rounded-2xl shadow-sm border border-primary/20 bg-blue-50">
                  <CardContent className="p-6 flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Join This Team</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {spotsLeft} spot{spotsLeft > 1 ? "s" : ""} remaining. Collaborate and bring this idea to life!
                      </p>
                      <Button className="rounded-xl" onClick={() => setShowApplyModal(true)}>Request to Join</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              {!venture.isRecruiting && !userApplication && (
                <Card className="rounded-2xl shadow-sm border border-border bg-gray-50">
                  <CardContent className="p-6 flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Not currently recruiting</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Follow this venture to get notified when they open applications.
                      </p>
                      <Button variant="outline"
                        className={`rounded-xl ${hasFollowed ? "border-primary text-primary" : ""}`}
                        onClick={handleFollow}>
                        {hasFollowed ? "Following ✓" : "Follow Venture"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

        </div>
      </div>

      {/* Apply modal */}
      {showApplyModal && (
        <ApplyModal
          venture={venture}
          onClose={() => setShowApplyModal(false)}
          onSuccess={(application) => setUserApplication(application)}
        />
      )}

      {/* Remove member confirmation */}
      {removingMember && (
        <ConfirmModal
          title={`Remove ${removingMember.user?.name}?`}
          description="This will remove them from the team and revoke their access to the team chat. This cannot be undone."
          loading={removeLoading}
          onConfirm={handleConfirmRemove}
          onCancel={() => setRemovingMember(null)}
        />
      )}

      {/* Archive confirmation */}
      {showArchiveConfirm && (
        <ConfirmModal
          title="Archive this venture?"
          description="This will permanently hide the venture from all listings and cannot be reversed."
          loading={archiveLoading}
          onConfirm={handleConfirmArchive}
          onCancel={() => setShowArchiveConfirm(false)}
        />
      )}
    </div>
  );
}