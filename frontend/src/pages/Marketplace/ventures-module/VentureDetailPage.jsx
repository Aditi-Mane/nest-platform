import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Heart, Share2, Users, CheckCircle2, Clock,
  TrendingUp, MessageSquare, Loader2, ChevronRight, Star,
  Plus, Trash2, Pencil, X, Check, AlertCircle, ExternalLink,
  Send, Settings, ToggleLeft, ToggleRight, UserPlus, Award,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchVentureById, toggleLike, toggleFollow, toggleEndorse, applyToVenture,
  fetchApplications, updateApplication,
  addMilestone, updateMilestone, deleteMilestone,
  postUpdate, addComment,
  updateVenture, removeTeamMember,
} from "@/api/venturesApi";
import { useUser } from "@/context/UserContext";



// ── Stage config ──────────────────────────────────────────────────────────────
const stageConfig = {
  ideation:         { label: "Ideation",        className: "bg-purple-100 text-purple-700 border-purple-200" },
  building:         { label: "Building",        className: "bg-blue-100 text-blue-700 border-blue-200" },
  "ready-to-pitch": { label: "Ready to Pitch",  className: "bg-green-100 text-green-700 border-green-200" },
  active:           { label: "Active",          className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  recruiting:       { label: "Recruiting",      className: "bg-orange-100 text-orange-700 border-orange-200" },
};

// ── Apply Modal (3-step) ──────────────────────────────────────────────────────
function ApplyModal({ venture, onClose, onSuccess }) {
  const [step, setStep]             = useState(1);
  const [role, setRole]             = useState("");
  const [customRole, setCustomRole] = useState("");
  const [whyJoin, setWhyJoin]       = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl]   = useState("");
  const [submitting, setSubmitting] = useState(false);
 s
  const selectedRole = role === "Other" ? customRole : role;

  const handleSubmit = async () => {
    if (!selectedRole.trim()) { toast.error("Please select a role."); return; }
    if (!whyJoin.trim())      { toast.error("Please tell us why you want to join."); return; }
    try {
      setSubmitting(true);
      await applyToVenture(venture._id, {
        roleAppliedFor: selectedRole,
        whyJoin,
        portfolioUrl: portfolioUrl || undefined,
        resumeUrl:    resumeUrl    || undefined,
      });
      setStep(3);
      onSuccess();
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
                  <button
                    key={r._id}
                    onClick={() => setRole(r.title)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
                      role === r.title ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="font-medium">{r.title}</span>
                    <span className="text-muted-foreground ml-2">— {r.skills?.join(", ")}</span>
                  </button>
                ))}
                <button
                  onClick={() => setRole("Other")}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${
                    role === "Other" ? "border-primary bg-primary/5 text-primary font-medium" : "border-border hover:border-primary/50"
                  }`}
                >
                  Other (specify)
                </button>
              </div>
              {role === "Other" && (
                <Input placeholder="Describe your role..." value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)} className="rounded-xl" autoFocus />
              )}
              <Button
                className="w-full rounded-xl gap-2"
                disabled={!role || (role === "Other" && !customRole.trim())}
                onClick={() => setStep(2)}
              >
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
                <Textarea
                  placeholder="Tell the creator what you'll bring to the team..."
                  value={whyJoin}
                  onChange={(e) => setWhyJoin(e.target.value.slice(0, 200))}
                  rows={4} className="mt-1.5 rounded-xl"
                />
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
                <p className="text-xs text-muted-foreground mt-1">A portfolio link carries more weight for most student roles.</p>
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
function ApplicationsTab({ ventureId }) {
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
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status } : a))
      );
      toast.success(status === "accepted" ? "Application accepted!" : "Application rejected.");
    } catch {
      toast.error("Failed to update application.");
    } finally {
      setActionId(null);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
      accepted: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return map[status] ?? map.pending;
  };

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
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(app.status)}`}>
                  {app.status}
                </span>
                <Badge variant="outline" className="text-xs">{app.roleAppliedFor}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{app.applicant?.major}</p>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{app.whyJoin}</p>
              <div className="flex gap-3 mt-2">
                {app.portfolioUrl && (
                  <a
                    href={app.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" /> Portfolio
                  </a>
                )}
                {app.resumeUrl && (
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" /> Resume
                  </a>
                )}
              </div>
            </div>
          </div>

          {app.status === "pending" && (
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 gap-1.5"
                disabled={actionId === app._id}
                onClick={() => handleAction(app._id, "accepted")}
              >
                {actionId === app._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 rounded-xl text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                disabled={actionId === app._id}
                onClick={() => handleAction(app._id, "rejected")}
              >
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
function ManageTab({ venture, onVentureUpdate }) {
  const [editMode, setEditMode]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [editData, setEditData]         = useState({
    title:        venture.title,
    description:  venture.description,
    fullDescription: venture.fullDescription ?? "",
    category:     venture.category,
    stage:        venture.stage,
    isRecruiting: venture.isRecruiting,
  });

  // Milestones
  const [milestones, setMilestones]     = useState(venture.milestones ?? []);
  const [newMilestone, setNewMilestone] = useState({ title: "", targetDate: "" });
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [milestoneLoading, setMilestoneLoading] = useState(null);

  // Update feed
  const [updateText, setUpdateText]     = useState("");
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [updates, setUpdates]           = useState(venture.updates ?? []);

  const set = (field, value) => setEditData((prev) => ({ ...prev, [field]: value }));

  const handleSaveInfo = async () => {
    try {
      setSaving(true);
      const { data } = await updateVenture(venture._id, editData);
      onVentureUpdate(data.venture);
      setEditMode(false);
      toast.success("Venture updated!");
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRecruiting = async () => {
    try {
      const { data } = await updateVenture(venture._id, { isRecruiting: !venture.isRecruiting });
      onVentureUpdate(data.venture);
      toast.success(data.venture.isRecruiting ? "Recruiting enabled." : "Recruiting paused.");
    } catch {
      toast.error("Failed to update recruiting status.");
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title.trim()) { toast.error("Enter a milestone title."); return; }
    try {
      setAddingMilestone(true);
      const { data } = await addMilestone(venture._id, newMilestone);
      setMilestones((prev) => [...prev, data.milestone]);
      setNewMilestone({ title: "", targetDate: "" });
      toast.success("Milestone added.");
    } catch {
      toast.error("Failed to add milestone.");
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleToggleMilestone = async (mid, completed) => {
    try {
      setMilestoneLoading(mid);
      const { data } = await updateMilestone(venture._id, mid, { completed: !completed });
      setMilestones((prev) => prev.map((m) => (m._id === mid ? data.milestone : m)));
    } catch {
      toast.error("Failed to update milestone.");
    } finally {
      setMilestoneLoading(null);
    }
  };

  const handleDeleteMilestone = async (mid) => {
    try {
      setMilestoneLoading(mid);
      await deleteMilestone(venture._id, mid);
      setMilestones((prev) => prev.filter((m) => m._id !== mid));
      toast.success("Milestone removed.");
    } catch {
      toast.error("Failed to delete milestone.");
    } finally {
      setMilestoneLoading(null);
    }
  };

  const handlePostUpdate = async () => {
    if (!updateText.trim()) { toast.error("Write something first."); return; }
    try {
      setPostingUpdate(true);
      const { data } = await postUpdate(venture._id, { text: updateText });
      setUpdates((prev) => [data.update, ...prev]);
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

      {/* ── Quick Controls ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={handleToggleRecruiting}
          className={`p-4 rounded-xl border cursor-pointer transition-colors ${
            venture.isRecruiting
              ? "bg-orange-50 border-orange-200"
              : "bg-gray-50 border-border hover:border-orange-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Actively Recruiting</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {venture.isRecruiting ? "Students can submit join requests" : "Applications paused"}
              </p>
            </div>
            {venture.isRecruiting
              ? <ToggleRight className="h-6 w-6 text-orange-600" />
              : <ToggleLeft className="h-6 w-6 text-muted-foreground" />
            }
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-gray-50 border-border">
          <p className="font-medium text-sm">Stage</p>
          <p className="text-xs text-muted-foreground mt-0.5">Current: {stageConfig[venture.stage]?.label}</p>
          <select
            className="mt-2 w-full text-sm border border-border rounded-lg px-2 py-1.5 bg-white"
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
      </div>

      {/* ── Edit Venture Info ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Venture Details</h3>
          {!editMode
            ? <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => setEditMode(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            : <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setEditMode(false)} disabled={saving}>Cancel</Button>
                <Button size="sm" className="rounded-xl" onClick={handleSaveInfo} disabled={saving}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Save
                </Button>
              </div>
          }
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={editData.title} onChange={(e) => set("title", e.target.value)} className="mt-1.5 rounded-xl" />
            </div>
            <div>
              <Label>Short Description</Label>
              <Textarea value={editData.description} onChange={(e) => set("description", e.target.value.slice(0, 300))}
                rows={3} className="mt-1.5 rounded-xl" />
              <p className="text-xs text-muted-foreground mt-1">{editData.description.length}/300</p>
            </div>
            <div>
              <Label>Full Description</Label>
              <Textarea value={editData.fullDescription} onChange={(e) => set("fullDescription", e.target.value)}
                rows={6} className="mt-1.5 rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl border border-border">
            <p className="font-medium text-sm mb-1">{venture.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-3">{venture.description}</p>
          </div>
        )}
      </div>

      {/* ── Milestones ── */}
      <div>
        <h3 className="font-semibold mb-4">Milestones</h3>

        {/* Add milestone */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Milestone title..."
            value={newMilestone.title}
            onChange={(e) => setNewMilestone((m) => ({ ...m, title: e.target.value }))}
            className="rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && handleAddMilestone()}
          />
          <Input
            type="date"
            value={newMilestone.targetDate}
            onChange={(e) => setNewMilestone((m) => ({ ...m, targetDate: e.target.value }))}
            className="rounded-xl w-44"
          />
          <Button
            variant="outline"
            className="rounded-xl px-3 shrink-0"
            onClick={handleAddMilestone}
            disabled={addingMilestone || !newMilestone.title.trim()}
          >
            {addingMilestone ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>

        {milestones.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No milestones yet.</p>
        )}

        <div className="space-y-2">
          {milestones.map((m) => (
            <div
              key={m._id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                m.completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-border"
              }`}
            >
              <button
                onClick={() => handleToggleMilestone(m._id, m.completed)}
                disabled={milestoneLoading === m._id}
                className="shrink-0"
              >
                {milestoneLoading === m._id
                  ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  : m.completed
                    ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                    : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40 hover:border-primary transition-colors" />
                }
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${m.completed ? "line-through text-muted-foreground" : ""}`}>
                  {m.title}
                </p>
                {m.targetDate && (
                  <p className="text-xs text-muted-foreground">
                    {m.completed ? "Completed" : "Due"}: {new Date(m.targetDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDeleteMilestone(m._id)}
                disabled={milestoneLoading === m._id}
                className="shrink-0 p-1 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Post Update ── */}
      <div>
        <h3 className="font-semibold mb-4">Post Progress Update</h3>
        <div className="flex gap-2">
          <Textarea
            placeholder="Share a milestone, achievement, or any update with your followers…"
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            rows={3}
            className="rounded-xl flex-1"
          />
        </div>
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
            {updates.slice(0, 5).map((u) => (
              <div key={u._id} className="border-l-2 border-primary pl-4 py-1">
                <p className="text-xs text-muted-foreground mb-1">{new Date(u.postedAt ?? u.createdAt).toLocaleDateString()}</p>
                <p className="text-sm">{u.text}</p>
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
        <p className="text-sm text-red-600 mb-3">Archiving will hide this venture from all listings.</p>
        <Button variant="outline" size="sm" className="rounded-xl text-red-600 border-red-300 hover:bg-red-100">
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
      {/* Comment box */}
      <div>
        <Textarea
          placeholder="Ask a question, give feedback, or show interest…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="rounded-xl"
        />
        <Button
          className="mt-2 gap-2 rounded-xl"
          onClick={handlePost}
          disabled={posting || !text.trim()}
        >
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Post Comment
        </Button>
      </div>

      {/* Comments list */}
      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No comments yet. Be the first to start the conversation!
        </p>
      )}

      <div className="space-y-4">
        {comments.map((c, i) => (
          <div key={c._id ?? i} className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={c.author?.avatar} />
              <AvatarFallback>{c.author?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 p-3 bg-gray-50 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium">{c.author?.name ?? "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
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
  const navigate          = useNavigate();
  const { id }            = useParams();
  const [searchParams]    = useSearchParams();
  const { user }          = useUser(); // { _id, name, ... }

  const [venture, setVenture]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [hasLiked, setHasLiked]           = useState(false);
  const [hasFollowed, setHasFollowed]     = useState(false);
  const [hasEndorsed, setHasEndorsed]     = useState(false);
  const [hasApplied, setHasApplied]       = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [likeCount, setLikeCount]         = useState(0);
  const [endorseCount, setEndorseCount]   = useState(0);

  const defaultTab = searchParams.get("tab") ?? "overview";
  const [activeTab, setActiveTab]         = useState(defaultTab);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await fetchVentureById(id);
        const v = data.venture;
        setVenture(v);
        setLikeCount(v.likes?.length ?? 0);
        setEndorseCount(v.endorsements?.length ?? 0);
        // Seed UI state from server if user data is embedded
        if (user) {
          setHasLiked(v.likes?.includes(user._id) ?? false);
          setHasFollowed(v.followers?.includes(user._id) ?? false);
          setHasEndorsed(v.endorsements?.includes(user._id) ?? false);
        }
      } catch {
        setError("Failed to load venture.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user]);

  const isCreator = venture && user && (venture.creator?._id === user._id || venture.creator === user._id);

  const handleLike = async () => {
    try {
      const { data } = await toggleLike(id);
      setHasLiked(data.liked);
      setLikeCount(data.likes);
    } catch { toast.error("Failed to update like."); }
  };

  const handleFollow = async () => {
    try {
      const { data } = await toggleFollow(id);
      setHasFollowed(data.following);
      toast.success(data.following ? "Following this venture!" : "Unfollowed.");
    } catch { toast.error("Failed to update follow."); }
  };

  const handleEndorse = async () => {
    try {
      const { data } = await toggleEndorse(id);
      setHasEndorsed(data.endorsed);
      setEndorseCount(data.endorsements);
      toast.success(data.endorsed ? "Endorsed!" : "Endorsement removed.");
    } catch { toast.error("Failed to update endorsement."); }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
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
  const progress       = venture.milestones?.length
    ? Math.round((venture.milestones.filter((m) => m.completed).length / venture.milestones.length) * 100)
    : 0;

  // Tabs: always show overview, team, progress, updates, comments
  // Creator also sees: manage, applications
  const tabs = [
    { key: "overview",      label: "Overview"      },
    { key: "team",          label: "Team"          },
    { key: "progress",      label: "Progress"      },
    { key: "updates",       label: "Updates"       },
    { key: "comments",      label: "Discussion"    },
    ...(isCreator ? [
      { key: "applications", label: "Applications" },
      { key: "manage",       label: "Manage"       },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/marketplace/buyer/ventures")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Ventures
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ════ MAIN ════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header Card */}
            <Card className="rounded-2xl shadow-sm border border-border">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${stage.className}`}>
                      {stage.label}
                    </span>
                    <Badge variant="outline">{venture.category}</Badge>
                    {venture.isRecruiting && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 rounded-full text-xs border">
                        Actively Recruiting
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`rounded-xl ${hasLiked ? "text-red-500 border-red-300" : ""}`}
                      onClick={handleLike}
                      title="Like"
                    >
                      <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`rounded-xl ${hasEndorsed ? "text-yellow-500 border-yellow-400" : ""}`}
                      onClick={handleEndorse}
                      title="Endorse"
                    >
                      <Award className={`h-4 w-4 ${hasEndorsed ? "fill-current" : ""}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className={`rounded-xl ${hasFollowed ? "text-primary border-primary/40" : ""}`}
                      onClick={handleFollow}
                      title={hasFollowed ? "Unfollow" : "Follow for updates"}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={handleShare} title="Share">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-3">{venture.title}</h1>
                <p className="text-muted-foreground leading-relaxed mb-6">{venture.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {venture.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full">{tag}</Badge>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-6 border-t border-border">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {confirmedCount}/{venture.teamLimit} members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4" />
                    {likeCount} likes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="h-4 w-4" />
                    {endorseCount} endorsements
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Started {new Date(venture.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="rounded-2xl shadow-sm border border-border">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="flex w-full bg-muted/50 p-1 rounded-xl mb-6 backdrop-blur-sm overflow-x-auto">
                    {tabs.map(({ key, label }) => (
                      <TabsTrigger
                        key={key}
                        value={key}
                        className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm
                          text-muted-foreground hover:text-foreground whitespace-nowrap"
                      >
                        {label}
                        {key === "applications" && (
                          <span className="ml-1.5 text-xs bg-primary/20 text-primary rounded-full px-1.5 py-0.5">
                            •
                          </span>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Overview */}
                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Full Description</h3>
                      <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
                        {venture.fullDescription}
                      </p>
                    </div>
                    {venture.openRoles?.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">We're Looking For</h3>
                        <div className="space-y-3">
                          {venture.openRoles.map((role) => (
                            <div key={role._id} className="p-4 bg-gray-50 rounded-xl border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-sm">{role.title}</p>
                                <Badge variant="secondary" className="rounded-full">
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
                    <h3 className="font-semibold">Current Team ({confirmedCount})</h3>
                    {venture.teamMembers?.filter((m) => m.confirmed).map((member, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-border">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.user?.avatar} />
                          <AvatarFallback>{member.user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{member.user?.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                          <p className="text-xs text-muted-foreground">{member.user?.major}</p>
                        </div>
                        {isCreator && member.user?._id !== user?._id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            title="Remove member"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {confirmedCount === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No confirmed team members yet.</p>
                    )}
                  </TabsContent>

                  {/* Progress */}
                  <TabsContent value="progress" className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Overall Progress</h3>
                        <span className="text-sm font-semibold">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    {venture.milestones?.length > 0 ? (
                      <div>
                        <h3 className="font-semibold mb-4">Milestones</h3>
                        <div className="space-y-3">
                          {venture.milestones.map((m) => (
                            <div
                              key={m._id}
                              className={`flex items-start gap-3 p-4 rounded-xl border ${
                                m.completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-border"
                              }`}
                            >
                              {m.completed
                                ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                                : <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                              }
                              <div>
                                <p className="font-medium text-sm">{m.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {m.completed ? "Completed" : "Target"}:{" "}
                                  {m.targetDate ? new Date(m.targetDate).toLocaleDateString() : "No date set"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No milestones added yet.</p>
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
                    <CommentsTab
                      ventureId={venture._id}
                      initialComments={venture.comments ?? []}
                    />
                  </TabsContent>

                  {/* Applications (creator only) */}
                  {isCreator && (
                    <TabsContent value="applications">
                      <ApplicationsTab ventureId={venture._id} />
                    </TabsContent>
                  )}

                  {/* Manage (creator only) */}
                  {isCreator && (
                    <TabsContent value="manage">
                      <ManageTab
                        venture={venture}
                        onVentureUpdate={(updated) => setVenture(updated)}
                      />
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* ════ SIDEBAR ════ */}
          <div className="space-y-6">

            {/* Creator */}
            <Card className="rounded-2xl shadow-sm border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Project Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={venture.creator?.avatar} />
                    <AvatarFallback>{venture.creator?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{venture.creator?.name}</p>
                    <p className="text-sm text-muted-foreground">{venture.creator?.major}</p>
                    <p className="text-xs text-muted-foreground">{venture.creator?.year}</p>
                  </div>
                </div>
                {!isCreator && (
                  <Button
                    variant="outline"
                    className="w-full gap-2 rounded-xl"
                    onClick={() => navigate("/marketplace/buyer/messages")}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contact Creator
                  </Button>
                )}
                {isCreator && (
                  <Button
                    variant="outline"
                    className="w-full gap-2 rounded-xl"
                    onClick={() => setActiveTab("manage")}
                  >
                    <Settings className="h-4 w-4" />
                    Manage Venture
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Join Team (non-creator, spots available, recruiting) */}
            {!isCreator && !hasApplied && spotsLeft > 0 && venture.isRecruiting && (
              <Card className="rounded-2xl shadow-sm border border-primary/20 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <p className="font-semibold">Join This Team</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {spotsLeft} spot{spotsLeft > 1 ? "s" : ""} remaining. Collaborate and bring this idea to life!
                  </p>
                  <Button className="w-full rounded-xl" onClick={() => setShowApplyModal(true)}>
                    Request to Join
                  </Button>
                </CardContent>
              </Card>
            )}

            {!isCreator && hasApplied && (
              <Card className="rounded-2xl shadow-sm border border-green-300 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-green-700">Application Sent!</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The creator will review your request and get back to you soon.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Follow (non-creator, not recruiting) */}
            {!isCreator && !venture.isRecruiting && (
              <Card className="rounded-2xl shadow-sm border border-border bg-gray-50">
                <CardContent className="p-6">
                  <p className="text-sm font-medium mb-1">Not currently recruiting</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Follow this venture to get notified when they open applications.
                  </p>
                  <Button
                    variant="outline"
                    className={`w-full mt-1 rounded-xl ${hasFollowed ? "border-primary text-primary" : ""}`}
                    onClick={handleFollow}
                  >
                    {hasFollowed ? "Following ✓" : "Follow Venture"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Endorsement social proof */}
            <Card className="rounded-2xl shadow-sm border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <p className="font-semibold">Endorse This Venture</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {endorseCount} endorsement{endorseCount !== 1 ? "s" : ""} — help this idea get discovered by investors.
                </p>
                <Button
                  variant="outline"
                  className={`w-full rounded-xl gap-2 ${hasEndorsed ? "border-yellow-400 text-yellow-600" : ""}`}
                  onClick={handleEndorse}
                >
                  <Star className={`h-4 w-4 ${hasEndorsed ? "fill-current" : ""}`} />
                  {hasEndorsed ? "Endorsed ✓" : "Endorse"}
                </Button>
              </CardContent>
            </Card>

            {/* Investor Ready (creator only, pitch-ready stage) */}
            {isCreator && venture.stage === "ready-to-pitch" && (
              <Card className="rounded-2xl shadow-sm border border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    <p className="font-semibold">Ready to Pitch?</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect with investors who fund student ventures.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => navigate("/marketplace/buyer/ventures/investors")}
                  >
                    View Investors
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Share */}
            <Card className="rounded-2xl shadow-sm border border-border">
              <CardContent className="p-6">
                <p className="font-semibold mb-2">Help Us Grow</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Share this idea with students who might be interested!
                </p>
                <Button variant="outline" className="w-full rounded-xl gap-2" onClick={handleShare}>
                  <Share2 className="h-4 w-4" /> Copy Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <ApplyModal
          venture={venture}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => setHasApplied(true)}
        />
      )}
    </div>
  );
}