import { useState} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
//import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Heart,
  Share2,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

// -------------------------------------------------------------------
// Mock data (single idea)
// -------------------------------------------------------------------
const idea = {
  id: "1",
  title: "EcoNote - Sustainable Study Materials",
  description:
    "A platform for creating and sharing eco-friendly digital study notes with collaborative features. We aim to reduce paper waste while helping students collaborate better on their academic journey.",
  fullDescription: `EcoNote is more than just a note-taking app — it's a movement towards sustainable education. We're building a comprehensive platform that allows students to:

• Create beautiful, organized digital notes with rich formatting
• Collaborate in real-time with classmates on shared study materials
• Access AI-powered summarization and study guides
• Track environmental impact (trees saved, carbon offset)
• Monetize high-quality notes through our marketplace

Our vision is to become the go-to platform for eco-conscious students who want to excel academically while making a positive environmental impact.`,
  category: "EdTech",
  stage: "building",
  creator: {
    name: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    major: "Environmental Science",
    year: "Junior",
    email: "sarah.chen@university.edu",
  },
  teamMembers: [
    {
      name: "Sarah Chen",
      role: "Founder & Product Lead",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      skills: ["Product Design", "UX Research"],
    },
    {
      name: "James Lee",
      role: "Full-Stack Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      skills: ["React", "Node.js", "MongoDB"],
    },
    {
      name: "Maya Singh",
      role: "Marketing Lead",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      skills: ["Social Media", "Content Creation"],
    },
  ],
  teamLimit: 5,
  openRoles: [
    { title: "UI/UX Designer", skills: ["Figma", "Design Systems"], spots: 1 },
    { title: "ML Engineer", skills: ["Python", "NLP", "TensorFlow"], spots: 1 },
  ],
  likes: 24,
  createdAt: "2024-01-15",
  tags: ["Sustainability", "Education", "Tech", "AI", "Collaboration"],
  milestones: [
    { title: "MVP Development", completed: true, date: "2024-02-01" },
    { title: "Beta Testing", completed: true, date: "2024-02-15" },
    { title: "User Feedback Integration", completed: false, date: "2024-03-01" },
    { title: "Launch v1.0", completed: false, date: "2024-03-15" },
  ],
  progress: 60,
};

// -------------------------------------------------------------------
// Stage helpers
// -------------------------------------------------------------------
const stageConfig = {
  ideation: { label: "Ideation", className: "bg-purple-100 text-purple-700 border-purple-200" },
  building: { label: "Building", className: "bg-blue-100 text-blue-700 border-blue-200" },
  "ready-to-pitch": { label: "Ready to Pitch", className: "bg-green-100 text-green-700 border-green-200" },
};

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------
export default function VentureDetailPage({ onNavigate }) {
  const navigate =useNavigate();
  const [hasLiked, setHasLiked] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const stage = stageConfig[idea.stage] ?? stageConfig.ideation;
  const spotsLeft = idea.teamLimit - idea.teamMembers.length;

  const handleJoin = () => {
    setHasJoined(true);
    toast.success("Request sent! The creator will get back to you soon.");
  };

  const handleLike = () => {
    setHasLiked((v) => !v);
    toast.success(hasLiked ? "Removed from favourites" : "Added to favourites!");
  };

  const handleShare = () => {
    toast.success("Link copied to clipboard!");
  };

  const handleContact = () => {
    toast.success("Opening message thread with Sarah…");
    setTimeout(() => navigate("/marketplace/buyer/messages"), 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Back ── */}
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/marketplace/buyer/ventures")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Ventures
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ════════════════ MAIN ════════════════ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header Card */}
            <Card className="rounded-2xl shadow-sm border border-border">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${stage.className}`}>
                      {stage.label}
                    </span>
                    <Badge variant="outline">{idea.category}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`rounded-xl ${hasLiked ? "text-red-500 border-red-300" : ""}`}
                      onClick={handleLike}
                    >
                      <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-xl" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-3">{idea.title}</h1>
                <p className="text-muted-foreground leading-relaxed mb-6">{idea.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {idea.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-6 border-t border-border">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {idea.teamMembers.length}/{idea.teamLimit} members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Heart className="h-4 w-4" />
                    {idea.likes} likes
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Started {idea.createdAt}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="rounded-2xl shadow-sm border border-border">
              <CardContent className="p-6">
                <Tabs defaultValue="overview">
                  <TabsList className="w-full justify-start rounded-xl mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                  </TabsList>

                  {/* Overview */}
                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Full Description</h3>
                      <p className="text-muted-foreground whitespace-pre-line text-sm leading-relaxed">
                        {idea.fullDescription}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">We're Looking For</h3>
                      <div className="space-y-3">
                        {idea.openRoles.map((role, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-xl border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-sm">{role.title}</p>
                              <Badge variant="secondary" className="rounded-full">
                                {role.spots} spot{role.spots > 1 ? "s" : ""}
                              </Badge>
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
                    </div>
                  </TabsContent>

                  {/* Team */}
                  <TabsContent value="team" className="space-y-4">
                    <h3 className="font-semibold">Current Team ({idea.teamMembers.length})</h3>
                    {idea.teamMembers.map((member, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-border">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.skills.map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs rounded-full">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  {/* Progress */}
                  <TabsContent value="progress" className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Overall Progress</h3>
                        <span className="text-sm font-semibold">{idea.progress}%</span>
                      </div>
                     {/*<Progress value={idea.progress} className="h-2" /> */}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Milestones</h3>
                      <div className="space-y-3">
                        {idea.milestones.map((m, i) => (
                          <div
                            key={i}
                            className={`flex items-start gap-3 p-4 rounded-xl border ${
                              m.completed
                                ? "bg-green-50 border-green-200"
                                : "bg-gray-50 border-border"
                            }`}
                          >
                            {m.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                            ) : (
                              <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{m.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {m.completed ? "Completed" : "Target"}: {m.date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* ════════════════ SIDEBAR ════════════════ */}
          <div className="space-y-6">

            {/* Creator */}
            <Card className="rounded-2xl shadow-sm border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Project Creator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={idea.creator.avatar} />
                    <AvatarFallback>{idea.creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{idea.creator.name}</p>
                    <p className="text-sm text-muted-foreground">{idea.creator.major}</p>
                    <p className="text-xs text-muted-foreground">{idea.creator.year}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={handleContact}>
                  <MessageSquare className="h-4 w-4" />
                  Contact Creator
                </Button>
              </CardContent>
            </Card>

            {/* Join Team */}
            {!hasJoined && spotsLeft > 0 && (
              <Card className="rounded-2xl shadow-sm border border-primary/20 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <p className="font-semibold">Join This Team</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {spotsLeft} spot{spotsLeft > 1 ? "s" : ""} remaining. Collaborate and bring this idea to life!
                  </p>
                  <Button className="w-full rounded-xl" onClick={handleJoin}>
                    Request to Join
                  </Button>
                </CardContent>
              </Card>
            )}

            {hasJoined && (
              <Card className="rounded-2xl shadow-sm border border-green-300 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="font-semibold text-green-700">Request Sent!</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The creator will review your request and get back to you soon.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Investor Ready */}
            <Card className="rounded-2xl shadow-sm border border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  <p className="font-semibold">Investor Ready?</p>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect with investors when your product is ready to pitch.
                </p>
                <Button variant="outline" className="w-full rounded-xl" onClick={() => navigate("/marketplace/buyer/ventures/investors")}>
                  View Investors
                </Button>
              </CardContent>
            </Card>

            {/* Share */}
            <Card className="rounded-2xl shadow-sm border border-border">
              <CardContent className="p-6">
                <p className="font-semibold mb-2">Help Us Grow</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Share this idea with students who might be interested!
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-xl" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-xl">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
