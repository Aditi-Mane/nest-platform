import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, X, Lightbulb, Users, TrendingUp, Loader2, AlertTriangle,Tag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCheck, Search } from "lucide-react";
import { toast } from "sonner";
import { createVenture } from "@/api/venturesApi";
import api from "../../../api/axios";
import { useUser } from "../../../context/UserContext";
const CATEGORIES = [
  "EdTech", "Social Impact", "Marketplace", "E-commerce",
  "Health & Wellness", "Sustainability", "Fintech", "Entertainment", "Other",
];

export default function CreateVenturePage() {
  const navigate = useNavigate();

  const [title,           setTitle]           = useState("");
  const [description,     setDescription]     = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [category,        setCategory]        = useState("");
  const [stage,           setStage]           = useState("draft");
  const [teamLimit,       setTeamLimit]       = useState("5");
  const [isRecruiting,    setIsRecruiting]    = useState(false);
  const [tags,            setTags]            = useState([]);
  const [currentTag,      setCurrentTag]      = useState("");
  const [openRoles,       setOpenRoles]       = useState([]);
  const [currentRole,     setCurrentRole]     = useState({ title: "", skills: "", spots: 1,  });
  const [submitting,      setSubmitting]      = useState(false);

  const [similarVentures,    setSimilarVentures]    = useState([]);
  const [showSimilarWarning, setShowSimilarWarning] = useState(false);


  const [memberEmail,     setMemberEmail]     = useState("");
const [memberRole,      setMemberRole]      = useState("");
const [foundUser,       setFoundUser]       = useState(null);   // { _id, name, email, avatar, collegeName }
const [searchingUser,   setSearchingUser]   = useState(false);
const [userSearchErr,   setUserSearchErr]   = useState("");
const [teamMembers,     setTeamMembers]     = useState([]);

const { user } = useUser();
const handleEmailSearch = async () => {
  if (!memberEmail.trim()) return;
  setSearchingUser(true);
  setFoundUser(null);
  setUserSearchErr("");
  try {
    const { data } = await api.get('/users/search', { params: { email: memberEmail.trim() } });
    // Don't allow adding yourself or duplicates
   if (data.user._id === user?._id){
      setUserSearchErr("You're already the founder.");
    } else if (teamMembers.some((m) => m._id === data.user._id)) {
      setUserSearchErr("This person is already added.");
    } else {
      setFoundUser(data.user);
    }
  } catch (err) {
    setUserSearchErr(err?.response?.data?.message ?? "User not found.");
  } finally {
    setSearchingUser(false);
  }
};

const addMember = () => {
  if (!foundUser || !memberRole.trim()) return;
  setTeamMembers([...teamMembers, { ...foundUser, role: memberRole.trim() }]);
  setFoundUser(null);
  setMemberEmail("");
  setMemberRole("");
  setUserSearchErr("");
};

const removeMember = (id) => setTeamMembers(teamMembers.filter((m) => m._id !== id));

  const addTag = () => {
    if (currentTag.trim() && tags.length < 5) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };
  const removeTag = (i) => setTags(tags.filter((_, idx) => idx !== i));

  const addRole = () => {
  if (currentRole.title.trim() && currentRole.skills.trim()) {
    const skills = currentRole.skills.split(",").map((s) => s.trim());

    setOpenRoles([
      ...openRoles,
      {
        title: currentRole.title.trim(),
        skills,
        spots: Number(currentRole.spots),
      },
    ]);

    setCurrentRole({ title: "", skills: "", spots: 1 });
  }
};
  const removeRole = (i) => setOpenRoles(openRoles.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category || !fullDescription.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      setSubmitting(true);
     const { data } = await createVenture({
  title, description, fullDescription, category,
  stage, teamLimit: Number(teamLimit),
  openRoles, tags, isRecruiting, milestones: [], 
  teamMembers: (teamMembers || []).map((m) => ({   
    email: m.email,
    role: m.role,
    collegeName: m.collegeName,
  })),
});

      if (data.similarVentures?.length > 0) {
        setSimilarVentures(data.similarVentures);
        setShowSimilarWarning(true);
        setTimeout(() => navigate("/marketplace/buyer/ventures"), 4000);
      } else {
        toast.success("🎉 Your idea has been posted!");
        navigate("/marketplace/buyer/ventures");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to post idea. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const completedSteps = [
  title,
  description,
  fullDescription,
  category,
  stage,
  teamLimit,
].filter(Boolean).length;


const progress = Math.round((completedSteps / 6) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/marketplace/buyer/ventures")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Ventures
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Post Your Idea</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Share your entrepreneurial vision and find talented students to collaborate with.
          </p>
        </div>

        {/* Similar ventures warning */}
        {showSimilarWarning && (
          <Card className="rounded-2xl border border-yellow-300 bg-yellow-50 mb-6 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800 mb-2">
                    {similarVentures.length} similar venture{similarVentures.length > 1 ? "s" : ""} already exist
                  </p>
                  <p className="text-sm text-yellow-700 mb-3">
                    Your idea was posted! Consider collaborating with existing teams instead:
                  </p>
                  <div className="space-y-1.5">
                    {similarVentures.map((v) => (
                      <button
                        key={v._id}
                        className="text-sm text-yellow-800 underline block hover:text-yellow-900"
                        onClick={() => navigate(`/marketplace/buyer/ventures/${v._id}`)}
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-yellow-600 mt-3">Redirecting to ventures in a moment…</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-background rounded-full overflow-hidden border-border">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Basic Info ── */}
          <Card className="rounded-2xl shadow-sm border border-border">
            <CardHeader className="border-b border-border pb-4">
                          <div className="flex items-center gap-3 group">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-600 
                              group-hover:rotate-6 transition">
                <Lightbulb className="h-5 w-5" />
              </div>

              <CardTitle className="text-lg font-semibold 
                                    group-hover:text-orange-600 transition">
                Basic Information
              </CardTitle>
            </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <Label htmlFor="title">Idea Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., EcoNote – Sustainable Study Materials"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 rounded-xl bg-muted/40 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  placeholder="A brief overview of your idea (2–3 sentences)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 300))}
                  rows={3}
                  className="mt-2 rounded-xl bg-muted/40 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">{description.length}/300 characters</p>
              </div>

              <div>
                <Label htmlFor="fullDescription">Full Description *</Label>
                <Textarea
                  id="fullDescription"
                  placeholder="Describe your idea in detail. What problem are you solving? What's your vision? What makes it unique?"
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  rows={8}
                  className="mt-2 rounded-xl bg-muted/40 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div>
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="mt-2 rounded-xl">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Current Stage *</Label>
                  <Select value={stage} onValueChange={setStage}>
                    <SelectTrigger className="mt-2 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="draft">Ideation – Just an idea</SelectItem>
                      <SelectItem value="building">Building – Actively developing</SelectItem>
                      <SelectItem value="ready-to-pitch">Ready to Pitch – Looking for investors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-border">
                <input
                  type="checkbox"
                  id="isRecruiting"
                  checked={isRecruiting}
                  onChange={(e) => setIsRecruiting(e.target.checked)}
                  className="h-5 w-5 accent-primary"
                />
                <div>
                  <Label htmlFor="isRecruiting" className="cursor-pointer font-medium">
                    Actively Recruiting
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enable this so students can submit join requests right away.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Tags ── */}
          <Card className="rounded-2xl shadow-sm border border-border">
            <CardHeader className="border-b border-border ">
                            <div className="flex items-center gap-3 group">
                <div className="p-2 rounded-xl bg-yellow-100 text-yellow-600 
                                group-hover:scale-110 transition">
                  <Tag className="h-5 w-5" />
                </div>

                <CardTitle className="text-lg font-semibold 
                                      group-hover:text-yellow-600 transition">
                  Tags
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label>Add relevant tags (max 5)</Label>
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="e.g., AI, Sustainability, Education"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="rounded-xl bg-muted/40 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            <CardHeader className="border-b border-border pb-2">
                          <div className="flex items-center gap-3 group">
              <div className="p-2 rounded-xl bg-blue-100 text-blue-600 
                              group-hover:scale-110 transition">
                <Users className="h-5 w-5" />
              </div>

              <CardTitle className="text-lg font-semibold 
                                    group-hover:text-blue-600 transition">
                Team & Roles
              </CardTitle>
            </div>
            </CardHeader>
            <CardContent className="p-4 space-y-5 space-x-4">
              <div>
                <Label htmlFor="teamLimit">Maximum Team Size *</Label>
                <Input
                  id="teamLimit"
                  type="number"
                  min="2"
                  max="20"
                  value={teamLimit}
                  onChange={(e) => setTeamLimit(e.target.value)}
                  className="mt-2 rounded-xl max-w-xs bg-muted/40 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Including yourself</p>
              </div> 
                        {/* ── Existing Team Members Card ── */}
<Card className="rounded-2xl shadow-sm border border-border">
  <CardHeader className="border-b border-border pb-2">
    <div className="flex items-center gap-3 group">
      <div className="p-2 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition">
        <UserCheck className="h-5 w-5" />
      </div>
      <CardTitle className="text-lg font-semibold group-hover:text-purple-600 transition">
        Existing Team Members
      </CardTitle>
    </div>
  </CardHeader>

  <CardContent className="p-4 space-y-4">

    {/* Email search row */}
    <div>
      <Label>Search by Email</Label>
      <div className="flex gap-2 mt-2">
        <Input
          placeholder="teammate@example.com"
          value={memberEmail}
          onChange={(e) => {
            setMemberEmail(e.target.value);
            setFoundUser(null);        // clear preview on edit
            setUserSearchErr("");
          }}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleEmailSearch())}
          className="rounded-xl bg-muted/40 border-transparent focus:ring-2 focus:ring-primary/20"
        />
        <Button
          type="button"
          variant="outline"
          className="rounded-xl px-3 shrink-0"
          onClick={handleEmailSearch}
          disabled={searchingUser || !memberEmail.trim()}
        >
          {searchingUser
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Search className="h-4 w-4" />}
        </Button>
      </div>
      {userSearchErr && (
        <p className="text-xs text-destructive mt-1.5">{userSearchErr}</p>
      )}
    </div>

    {/* User preview card */}
    {foundUser && (
      <div className="p-4 bg-muted-50 rounded-xl border border-muted-200 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-purple-200">
            <AvatarImage src={foundUser.avatar} alt={foundUser.name} />
            <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold">
              {foundUser.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{foundUser.name}</p>
            <p className="text-xs text-muted-foreground">{foundUser.email}</p>
            {foundUser.collegeName && (
              <Badge variant="outline" className="text-xs rounded-full mt-1">
                {foundUser.collegeName}
              </Badge>
            )}
          </div>
        </div>

        <div>
          <Label className="text-xs mb-1 block">Their Role in Your Venture *</Label>
          <Input
            placeholder="e.g., Backend Developer"
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
            className="rounded-xl bg-muted/40 border-transparent focus:border-border focus:ring-2 focus:ring-border/20"
          />
        </div>

        <Button
          type="button"
          className="w-full gap-2 rounded-xl bg-muted hover:bg-muted-700 text-white"
          onClick={addMember}
          disabled={!memberRole.trim()}
        >
          <Plus className="h-4 w-4" />
          Add {foundUser.name.split(" ")[0]} to Team
        </Button>
      </div>
    )}

    {/* Added members list */}
    {teamMembers.length > 0 && (
      <div className="space-y-2">
        <Label>Added Members</Label>
        {teamMembers.map((m) => (
          <div key={m._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={m.avatar} alt={m.name} />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-sm font-semibold">
                {m.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.role} · {m.collegeName}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeMember(m._id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>
       
              <div className="mt-5">
                <Label>Open Roles (Optional)</Label>
                <p className="text-xs text-muted/80 mb-3 mt-0.5">
                  Specify what kind of team members you're looking for.
                </p>
                <div className="space-y-2">
                  <Input
                    placeholder="Role title (e.g., UI/UX Designer)"
                    value={currentRole.title}
                    onChange={(e) => setCurrentRole({ ...currentRole, title: e.target.value })}
                    className="rounded-xl bg-muted/40 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Input
                    placeholder="Required skills (comma-separated, e.g., Figma, Design Systems)"
                    value={currentRole.skills}
                    onChange={(e) => setCurrentRole({ ...currentRole, skills: e.target.value })}
                    className="rounded-xl bg-muted/40 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                   <p className="text-xs text-muted/80 mb-3 mt-0.5">
                  Number of openings
                 </p>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Number of openings"
                    className="rounded-lg bg-muted/40 border-transparent focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={currentRole.spots}
                    onChange={(e) =>
                      setCurrentRole({
                        ...currentRole,
                        spots: e.target.value,
                      })
                    }
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 rounded-xl mt-3"
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
                          <Badge key={s} variant="outline" className="text-xs rounded-full">{s}</Badge>
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
                    <li>Enable recruiting once you're ready for applicants</li>
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
              className="flex-1 rounded-xl border-border"
              onClick={() => navigate("/marketplace/buyer/ventures")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl text-card" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {submitting ? "Posting..." : "Post Idea"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}