import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, X, Lightbulb, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  "EdTech",
  "Social Impact",
  "Marketplace",
  "E-commerce",
  "Health & Wellness",
  "Sustainability",
  "Fintech",
  "Entertainment",
  "Other",
];

export default function CreateVenturePage({ onNavigate }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stage, setStage] = useState("ideation");
  const [teamLimit, setTeamLimit] = useState("5");
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [openRoles, setOpenRoles] = useState([]);
  const [currentRole, setCurrentRole] = useState({ title: "", skills: "" });

  const addTag = () => {
    if (currentTag.trim() && tags.length < 5) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (i) => setTags(tags.filter((_, idx) => idx !== i));

  const addRole = () => {
    if (currentRole.title.trim() && currentRole.skills.trim()) {
      const skills = currentRole.skills.split(",").map((s) => s.trim()).filter(Boolean);
      setOpenRoles([...openRoles, { title: currentRole.title.trim(), skills }]);
      setCurrentRole({ title: "", skills: "" });
    }
  };

  const removeRole = (i) => setOpenRoles(openRoles.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category || !fullDescription.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    toast.success("Your idea has been posted! Redirecting…");
    setTimeout(() => onNavigate("ventures"), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Back ── */}
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/marketplace/buyer/ventures")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Ventures
        </Button>

        {/* ── Page header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Post Your Idea</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Share your entrepreneurial vision and find talented students to collaborate with.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Basic Info ── */}
          <Card className="rounded-2xl shadow-sm border border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">

              <div>
                <Label htmlFor="title">Idea Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., EcoNote – Sustainable Study Materials"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 rounded-xl"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  placeholder="A brief overview of your idea (2–3 sentences)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1.5 rounded-xl"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{description.length}/200 characters</p>
              </div>

              <div>
                <Label htmlFor="fullDescription">Full Description *</Label>
                <Textarea
                  id="fullDescription"
                  placeholder="Describe your idea in detail. What problem are you solving? What's your vision? What makes it unique?"
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  rows={8}
                  className="mt-1.5 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="mt-1.5 rounded-xl">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-muted">
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Current Stage *</Label>
                  <Select value={stage} onValueChange={setStage}>
                    <SelectTrigger className="mt-1.5 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-muted">
                      <SelectItem value="ideation">Ideation – Just an idea</SelectItem>
                      <SelectItem value="building">Building – Actively developing</SelectItem>
                      <SelectItem value="ready-to-pitch">Ready to Pitch – Looking for investors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Tags ── */}
          <Card className="rounded-2xl shadow-sm border border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label>Add relevant tags (max 5)</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    placeholder="e.g., AI, Sustainability, Education"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="rounded-xl"
                    disabled={tags.length >= 5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl px-3"
                    onClick={addTag}
                    disabled={tags.length >= 5 || !currentTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="rounded-full gap-1 pl-3">
                      {tag}
                      <button type="button" onClick={() => removeTag(i)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Team & Roles ── */}
          <Card className="rounded-2xl shadow-sm border border-border">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Team & Roles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">

              <div>
                <Label htmlFor="teamLimit">Maximum Team Size *</Label>
                <Input
                  id="teamLimit"
                  type="number"
                  min="2"
                  max="20"
                  value={teamLimit}
                  onChange={(e) => setTeamLimit(e.target.value)}
                  className="mt-1.5 rounded-xl max-w-xs"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Including yourself</p>
              </div>

              <div>
                <Label>Open Roles (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Specify what kind of team members you're looking for.
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="Role title (e.g., UI/UX Designer)"
                    value={currentRole.title}
                    onChange={(e) => setCurrentRole({ ...currentRole, title: e.target.value })}
                    className="rounded-xl"
                  />
                  <Input
                    placeholder="Required skills (comma-separated, e.g., Figma, Design Systems)"
                    value={currentRole.skills}
                    onChange={(e) => setCurrentRole({ ...currentRole, skills: e.target.value })}
                    className="rounded-xl"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 rounded-xl"
                    onClick={addRole}
                    disabled={!currentRole.title.trim() || !currentRole.skills.trim()}
                  >
                    <Plus className="h-4 w-4" />
                    Add Role
                  </Button>
                </div>
              </div>

              {openRoles.length > 0 && (
                <div className="space-y-3">
                  <Label>Added Roles</Label>
                  {openRoles.map((role, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm">{role.title}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-lg"
                          onClick={() => removeRole(i)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {role.skills.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs rounded-full">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Tips ── */}
          <Card className="rounded-2xl border border-secondary/20 bg-green-50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold mb-2">Tips for Success</p>
                  <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li>Be clear and specific about your vision and goals</li>
                    <li>Highlight what makes your idea unique</li>
                    <li>Be transparent about your current progress</li>
                    <li>Specify exactly what skills you need on your team</li>
                    <li>Engage with students who show interest</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Submit ── */}
          <div className="flex gap-4 pb-8">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => onNavigate("ventures")}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl">
              Post Idea
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
