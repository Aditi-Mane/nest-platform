import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, Sparkles, AlertCircle, Rocket, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createVenture } from "@/api/venturesApi";

const CATEGORIES = [
  "Tech & AI", "Sustainability", "E-commerce", "Food & Beverage",
  "Health & Fitness", "Design", "EdTech", "FinTech", "Other",
];

const TOTAL_STEPS = 3;

export default function CreateStartupPage() {
  const navigate = useNavigate();   // ← fixed: removed stray `s`
  const [step, setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "", tagline: "", category: "", description: "",
    problem: "", solution: "", seeking: "", equity: "",
    valuation: "", teamSize: "", website: "",
    useFunds: [],  // selected fund uses
  });

  const progress = (step / TOTAL_STEPS) * 100;
  const set = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleFund = (item) => {
    setFormData((prev) => ({
      ...prev,
      useFunds: prev.useFunds.includes(item)
        ? prev.useFunds.filter((f) => f !== item)
        : [...prev.useFunds, item],
    }));
  };

  const next = () => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!formData.seeking || !formData.equity) {
      toast.error("Please fill in funding details.");
      return;
    }
    try {
      setSubmitting(true);
      // Map the 3-step form to our Venture model fields
      await createVenture({
        title:           formData.name,
        description:     formData.tagline,
        fullDescription: `${formData.description}\n\nThe Problem:\n${formData.problem}\n\nOur Solution:\n${formData.solution}`,
        category:        formData.category,
        stage:           "ready-to-pitch",
        teamLimit:       Number(formData.teamSize) || 5,
        isRecruiting:    false,
        tags:            [],
      });
      toast.success("Startup published successfully!");
      navigate("/marketplace/buyer/ventures");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Failed to publish startup.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepLabels = ["Basic Info", "Details", "Funding"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/marketplace/buyer/ventures")}>
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-1">Create Your Startup</h1>
          <p className="text-muted-foreground">Share your vision with the community</p>
        </div>

        {/* Progress Card */}
        <Card className="rounded-2xl shadow-sm border border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium">Step {step} of {TOTAL_STEPS}</span>
              <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            <div className="flex justify-between text-sm">
              {stepLabels.map((label, i) => (
                <span
                  key={label}
                  className={step >= i + 1 ? "text-primary font-medium" : "text-muted-foreground"}
                >
                  {label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insight Banner */}
        <Alert className="mb-8 border-primary/20 bg-blue-50 rounded-2xl">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertDescription>
            Our AI will analyse your startup and generate match scores to connect you with the right investors.
          </AlertDescription>
        </Alert>

        {/* ════ STEP 1 ════ */}
        {step === 1 && (
          <Card className="rounded-2xl shadow-sm border border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">1</span>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <Label htmlFor="name">Startup Name *</Label>
                <Input id="name" placeholder="e.g., StudySync" value={formData.name}
                  onChange={(e) => set("name", e.target.value)} className="mt-1.5 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline *</Label>
                <Input id="tagline" placeholder="A brief, catchy description of your startup"
                  value={formData.tagline} onChange={(e) => set("tagline", e.target.value)}
                  className="mt-1.5 rounded-xl" />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger className="mt-1.5 rounded-xl">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-muted">
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Cover image upload placeholder */}
              <div>
                <Label>Cover Image</Label>
                <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10 MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input id="teamSize" type="number" placeholder="e.g., 4" value={formData.teamSize}
                    onChange={(e) => set("teamSize", e.target.value)} className="mt-1.5 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input id="website" type="url" placeholder="https://yourstartup.com" value={formData.website}
                    onChange={(e) => set("website", e.target.value)} className="mt-1.5 rounded-xl" />
                </div>
              </div>

              <Button className="w-full rounded-xl" size="lg"
                disabled={!formData.name || !formData.tagline || !formData.category}
                onClick={next}
              >
                Continue to Details
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ════ STEP 2 ════ */}
        {step === 2 && (
          <Card className="rounded-2xl shadow-sm border border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">2</span>
                Startup Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <Label htmlFor="description">Overview *</Label>
                <Textarea id="description" placeholder="Provide a comprehensive overview of your startup…"
                  value={formData.description} onChange={(e) => set("description", e.target.value.slice(0, 500))}
                  rows={4} className="mt-1.5 rounded-xl" />
                <p className="text-xs text-muted-foreground mt-1">{formData.description.length} / 500 characters</p>
              </div>
              <div>
                <Label htmlFor="problem">The Problem *</Label>
                <Textarea id="problem" placeholder="What problem does your startup solve?"
                  value={formData.problem} onChange={(e) => set("problem", e.target.value)}
                  rows={3} className="mt-1.5 rounded-xl" />
              </div>
              <div>
                <Label htmlFor="solution">Your Solution *</Label>
                <Textarea id="solution" placeholder="How does your product/service solve this problem?"
                  value={formData.solution} onChange={(e) => set("solution", e.target.value)}
                  rows={3} className="mt-1.5 rounded-xl" />
              </div>

              {/* Pitch video upload placeholder */}
              <div>
                <Label>Elevator Pitch Video (optional)</Label>
                <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">Upload your pitch video</p>
                  <p className="text-xs text-muted-foreground">MP4, MOV up to 50 MB</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" size="lg" onClick={back}>Back</Button>
                <Button className="flex-1 rounded-xl" size="lg"
                  disabled={!formData.description || !formData.problem || !formData.solution}
                  onClick={next}
                >
                  Continue to Funding
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ════ STEP 3 ════ */}
        {step === 3 && (
          <Card className="rounded-2xl shadow-sm border border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">3</span>
                Funding Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <Alert className="rounded-xl border-border bg-gray-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All funding information will be visible to verified investors on the platform.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seeking">Amount Seeking *</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="seeking" type="number" placeholder="50000" value={formData.seeking}
                      onChange={(e) => set("seeking", e.target.value)} className="pl-7 rounded-xl" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="equity">Equity Offered *</Label>
                  <div className="relative mt-1.5">
                    <Input id="equity" type="number" placeholder="10" value={formData.equity}
                      onChange={(e) => set("equity", e.target.value)} className="rounded-xl pr-7" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="valuation">Current Valuation</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input id="valuation" type="number" placeholder="500000" value={formData.valuation}
                    onChange={(e) => set("valuation", e.target.value)} className="pl-7 rounded-xl" />
                </div>
              </div>

              {/* Use of funds — now interactive */}
              <div>
                <Label>Use of Funds</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {["Product Development", "Marketing", "Hiring", "Operations", "R&D", "Other"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleFund(item)}
                      className={`text-sm px-3 py-2 rounded-xl border transition-colors ${
                        formData.useFunds.includes(item)
                          ? "bg-primary/10 border-primary text-primary font-medium"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Preview */}
              <Card className="rounded-2xl border border-primary/20 bg-blue-50">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">AI Preview</p>
                      <p className="text-sm text-muted-foreground">
                        Based on your inputs, we estimate an AI match score of{" "}
                        <span className="text-secondary font-medium">85–90%</span> with investors
                        interested in {formData.category || "your category"}.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" size="lg" onClick={back} disabled={submitting}>
                  Back
                </Button>
                <Button
                  className="flex-1 rounded-xl gap-2 bg-secondary hover:bg-secondary/90"
                  size="lg"
                  onClick={submit}
                  disabled={submitting}
                >
                  {submitting
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Rocket className="h-4 w-4" />
                  }
                  {submitting ? "Publishing..." : "Publish Startup"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
