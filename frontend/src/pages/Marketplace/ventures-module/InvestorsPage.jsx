import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  TrendingUp,
  Building2,
  DollarSign,
  Mail,
  Linkedin,
  Send,
} from "lucide-react";
import { toast } from "sonner";

// -------------------------------------------------------------------
// Mock data
// -------------------------------------------------------------------
const mockInvestors = [
  {
    id: "1",
    name: "Jennifer Martinez",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100",
    type: "Angel Investor",
    company: "TechStart Angels",
    focus: ["EdTech", "AI", "SaaS"],
    investmentRange: "$50K – $250K",
    portfolio: ["LearnFast", "StudyHub", "NoteMaster"],
    bio: "Former educator turned investor. Passionate about education technology and student-founded startups.",
    location: "San Francisco, CA",
    linkedIn: "jennifer-martinez",
    email: "jmartinez@techstartangels.com",
  },
  {
    id: "2",
    name: "David Chen",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    type: "Venture Capital",
    company: "Campus Ventures",
    focus: ["Marketplace", "Social Impact", "Sustainability"],
    investmentRange: "$100K – $500K",
    portfolio: ["GreenCampus", "ShareBooks", "EcoStudent"],
    bio: "Leading early-stage VC focused on student entrepreneurs. 15+ years experience in consumer tech.",
    location: "Boston, MA",
    linkedIn: "davidchen-vc",
    email: "david@campusventures.com",
  },
  {
    id: "3",
    name: "University Innovation Fund",
    avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100",
    type: "University Fund",
    company: "University Innovation Lab",
    focus: ["All Categories"],
    investmentRange: "$10K – $100K",
    portfolio: ["Various student projects"],
    bio: "Dedicated fund for supporting student entrepreneurship. Providing mentorship and seed funding.",
    location: "Multiple Locations",
    email: "innovation@university.edu",
  },
  {
    id: "4",
    name: "Sarah Thompson",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
    type: "Accelerator",
    company: "NextGen Accelerator",
    focus: ["Tech", "E-commerce", "Fintech"],
    investmentRange: "$75K + mentorship",
    portfolio: ["PayStudent", "CampusCart", "BudgetBuddy"],
    bio: "12-week intensive program for student startups. Provides funding, mentorship, and networking.",
    location: "New York, NY",
    linkedIn: "sarah-thompson-nextgen",
    email: "apply@nextgenaccelerator.com",
  },
  {
    id: "5",
    name: "Michael Park",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100",
    type: "Angel Investor",
    company: "Impact Investors Network",
    focus: ["Social Impact", "Health", "Sustainability"],
    investmentRange: "$25K – $150K",
    portfolio: ["HealthHub", "FoodShare", "CleanEnergy"],
    bio: "Supporting student ventures that create positive social and environmental impact.",
    location: "Seattle, WA",
    linkedIn: "michael-park-impact",
    email: "mpark@impactinvestors.com",
  },
];

const typeConfig = {
  "Angel Investor": "bg-purple-100 text-purple-700 border-purple-200",
  "Venture Capital": "bg-blue-100 text-blue-700 border-blue-200",
  Accelerator: "bg-green-100 text-green-700 border-green-200",
  "University Fund": "bg-orange-100 text-orange-700 border-orange-200",
};

// -------------------------------------------------------------------
// Component
// -------------------------------------------------------------------
export default function InvestorsPage({ onNavigate }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [pitchModal, setPitchModal] = useState(null); // investor | null
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const filtered = mockInvestors.filter((inv) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      inv.name.toLowerCase().includes(q) ||
      inv.company.toLowerCase().includes(q) ||
      inv.focus.some((f) => f.toLowerCase().includes(q));
    const matchesType = selectedType === "all" || inv.type === selectedType;
    return matchesSearch && matchesType;
  });

  const openPitch = (investor) => {
    setPitchModal(investor);
    setSubject("");
    setMessage("");
  };

  const sendPitch = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    toast.success(`Pitch sent to ${pitchModal.name}!`);
    setPitchModal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/marketplace/buyer/ventures")}>
          <ArrowLeft className="h-4 w-4" />
          Back to Ventures
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-secondary" />
            <h1 className="text-4xl font-bold">Connect with Investors</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Connect with investors who specialize in supporting student entrepreneurs and early-stage startups.
          </p>
        </div>

        {/* ── Search & Filter ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investors by name, company, or focus area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl border-border focus-visible:ring-secondary"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-52 rounded-xl">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-muted">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Angel Investor">Angel Investors</SelectItem>
                <SelectItem value="Venture Capital">Venture Capital</SelectItem>
                <SelectItem value="Accelerator">Accelerators</SelectItem>
                <SelectItem value="University Fund">University Funds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Tips ── */}
        <Card className="rounded-2xl border border-primary/20 bg-blue-50 mb-8 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Before You Reach Out</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Ensure your product/idea is ready for the stage you're pitching at</li>
              <li>Prepare a clear pitch deck and business plan</li>
              <li>Research each investor's focus areas and portfolio</li>
              <li>Be professional and concise in your communication</li>
              <li>Follow up respectfully if you don't hear back within 2 weeks</li>
            </ul>
          </CardContent>
        </Card>

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((inv) => (
              <Card
                key={inv.id}
                className="rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  {/* Avatar + name */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={inv.avatar} />
                      <AvatarFallback>{inv.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{inv.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                        <Building2 className="h-3 w-3 shrink-0" />
                        {inv.company}
                      </p>
                      <span
                        className={`mt-2 inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                          typeConfig[inv.type] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {inv.type}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground mb-4">{inv.bio}</p>

                  {/* Focus */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Focus Areas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {inv.focus.map((f) => (
                        <Badge key={f} variant="secondary" className="rounded-full text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Investment range */}
                  <div className="flex items-center gap-2 text-sm mb-4 pb-4 border-b border-border">
                    <DollarSign className="h-4 w-4 text-secondary shrink-0" />
                    <span className="text-muted-foreground">Investment Range:</span>
                    <span className="font-medium">{inv.investmentRange}</span>
                  </div>

                  {/* Portfolio */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Portfolio</p>
                    <p className="text-sm text-muted-foreground">{inv.portfolio.join(", ")}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 rounded-xl gap-2"
                      variant="default"
                      onClick={() => openPitch(inv)}
                    >
                      <Send className="h-4 w-4" />
                      Send Pitch
                    </Button>
                    {inv.linkedIn && (
                      <Button variant="outline" size="icon" className="rounded-xl">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                    )}
                    {inv.email && (
                      <Button variant="outline" size="icon" className="rounded-xl">
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No investors found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* ── Pitch Modal ── */}
      {pitchModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setPitchModal(null)}
        >
          <Card
            className="w-full max-w-2xl rounded-2xl shadow-xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Send Pitch to {pitchModal.name}</CardTitle>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setPitchModal(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <Input
                  placeholder="e.g., Pitch: EcoNote – Sustainable EdTech Platform"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Your Pitch</Label>
                <Textarea
                  placeholder="Introduce yourself, describe your venture, explain why you're reaching out to this investor, and include your ask…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={10}
                  className="mt-1.5 rounded-xl"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be clear, concise, and professional. Include links to your pitch deck or demo if available.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setPitchModal(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 rounded-xl gap-2" onClick={sendPitch}>
                  <Send className="h-4 w-4" />
                  Send Pitch
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
