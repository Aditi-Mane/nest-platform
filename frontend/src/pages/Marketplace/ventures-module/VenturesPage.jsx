import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lightbulb, Users, TrendingUp, Search, Plus } from "lucide-react";


// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------
const mockIdeas = [
  {
    id: "1",
    title: "EcoNote - Sustainable Study Materials",
    description:
      "A platform for creating and sharing eco-friendly digital study notes with collaborative features. We aim to reduce paper waste while helping students collaborate better.",
    category: "EdTech",
    stage: "building",
    creator: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      major: "Environmental Science",
    },
    teamMembers: 3,
    teamLimit: 5,
    likes: 24,
    createdAt: "2024-01-15",
    tags: ["Sustainability", "Education", "Tech"],
  },
  {
    id: "2",
    title: "CampusEats - Student Meal Sharing",
    description:
      "Connect students who have extra meal swipes with those who need them. Build a community-driven food sharing platform with AI-powered matching.",
    category: "Social Impact",
    stage: "ideation",
    creator: {
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      major: "Computer Science",
    },
    teamMembers: 2,
    teamLimit: 6,
    likes: 45,
    createdAt: "2024-01-20",
    tags: ["Food", "Community", "AI"],
  },
  {
    id: "3",
    title: "StudyBuddy AI - Personalized Tutor",
    description:
      "AI-powered tutoring assistant that adapts to individual learning styles. Looking for ML engineers and UX designers to join the core team.",
    category: "EdTech",
    stage: "ready-to-pitch",
    creator: {
      name: "Priya Patel",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      major: "AI/ML",
    },
    teamMembers: 5,
    teamLimit: 5,
    likes: 67,
    createdAt: "2024-01-10",
    tags: ["AI", "Education", "Tutoring"],
  },
  {
    id: "4",
    title: "DormSwap - Furniture Exchange Platform",
    description:
      "Marketplace for students to buy, sell, and exchange dorm furniture and decor. Reduce waste and save money!",
    category: "Marketplace",
    stage: "building",
    creator: {
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      major: "Business",
    },
    teamMembers: 4,
    teamLimit: 6,
    likes: 32,
    createdAt: "2024-01-18",
    tags: ["Marketplace", "Sustainability", "Students"],
  },
  {
    id: "5",
    title: "CampusCrafts - Handmade Goods Hub",
    description:
      "E-commerce platform exclusively for student artisans to sell handmade crafts, art, and custom items. Need devs and marketing talent!",
    category: "E-commerce",
    stage: "ideation",
    creator: {
      name: "Emma Williams",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
      major: "Art & Design",
    },
    teamMembers: 2,
    teamLimit: 5,
    likes: 28,
    createdAt: "2024-01-22",
    tags: ["Art", "E-commerce", "Handmade"],
  },
  {
    id: "6",
    title: "QuickPitch - Student Pitch Practice",
    description:
      "Platform where student entrepreneurs can practice their pitches with AI feedback and connect with real investors when ready.",
    category: "EdTech",
    stage: "building",
    creator: {
      name: "David Kim",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
      major: "Entrepreneurship",
    },
    teamMembers: 3,
    teamLimit: 4,
    likes: 51,
    createdAt: "2024-01-12",
    tags: ["Entrepreneurship", "AI", "Pitching"],
  },
];

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
const stageConfig = {
  ideation: {
    label: "Ideation",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  building: {
    label: "Building",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  "ready-to-pitch": {
    label: "Ready to Pitch",
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------
export default function VenturesPage({ onNavigate }) {
    const navigate= useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = mockIdeas.filter((idea) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      idea.title.toLowerCase().includes(q) ||
      idea.description.toLowerCase().includes(q) ||
      idea.tags.some((t) => t.toLowerCase().includes(q));
    const matchesStage = selectedStage === "all" || idea.stage === selectedStage;
    const matchesCategory =
      selectedCategory === "all" || idea.category === selectedCategory;
    return matchesSearch && matchesStage && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Student Ventures</h1>
            </div>
            <Button
              className="gap-2 rounded-xl"
              onClick={() => navigate("/marketplace/buyer/ventures/create")}
            >
              <Plus className="h-4 w-4" />
              Post Your Idea
            </Button>
          </div>
          <p className="text-muted-foreground mt-1">
            Collaborate with talented students, build innovative products, and pitch to investors.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Lightbulb, label: "Active Ideas", value: 24, color: "text-purple-600", bg: "bg-purple-50" },
            { icon: Users, label: "Student Entrepreneurs", value: 156, color: "text-primary", bg: "bg-blue-50" },
            { icon: TrendingUp, label: "Investor Connections", value: 12, color: "text-secondary", bg: "bg-green-50" },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label} className="p-6 rounded-2xl shadow-sm border border-border">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Search & Filters ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ideas by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-border focus-visible:ring-secondary"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-44 rounded-xl">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent className="bg-muted">
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="ideation">Ideation</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="ready-to-pitch">Ready to Pitch</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-44 rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-muted">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="EdTech">EdTech</SelectItem>
                  <SelectItem value="Social Impact">Social Impact</SelectItem>
                  <SelectItem value="Marketplace">Marketplace</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── Ideas Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((idea) => {
              const stage = stageConfig[idea.stage] ?? stageConfig.ideation;
              const isFull = idea.teamMembers >= idea.teamLimit;
              return (
                <Card
                  key={idea.id}
                  className="p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                  onClick={() => onNavigate("venture-detail", idea.id)}
                >
                  {/* Stage + Category */}
                  <div className="flex items-start justify-between mb-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${stage.className}`}>
                      {stage.label}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {idea.category}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-base mb-2 leading-snug">{idea.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                    {idea.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {idea.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Creator */}
                  <div className="flex items-center gap-3 pb-4 border-b border-border mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={idea.creator.avatar} />
                      <AvatarFallback>{idea.creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{idea.creator.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{idea.creator.major}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      {idea.teamMembers}/{idea.teamLimit} members
                    </span>
                    <span>{idea.likes} likes</span>
                  </div>

                  {/* Join Button */}
                  {!isFull && (
                    <Button
                      className="w-full mt-4 rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                       navigate(`/marketplace/buyer/ventures/${idea.id}`)
                      }}
                    >
                      Join Team
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No ideas found</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Try adjusting your filters or post your own idea!
            </p>
            <Button className="rounded-xl" onClick={() => navigate("/marketplace/buyer/ventures/create")}>
              Post Your Idea
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
