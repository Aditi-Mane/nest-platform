import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useContext } from "react";
import { useUser } from "@/context/userContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Lightbulb, Users, TrendingUp, Search, Plus, Loader2,
  Bell, CheckCheck, Settings, Eye, Heart, Bookmark, MessageCircle,
  Clock, Pencil, Trash2, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchVentures, fetchMyVentures, deleteVenture,
  fetchNotifications, markNotificationRead, markAllNotificationsRead,
} from "@/api/venturesApi";

// ── Stage config ──────────────────────────────────────────────────────────────
const stageConfig = {
  ideation:         { label: "Ideation",        className: "bg-purple-100 text-purple-700 border-purple-200" },
  building:         { label: "Building",        className: "bg-blue-100 text-blue-700 border-blue-200" },
  "ready-to-pitch": { label: "Ready to Pitch",  className: "bg-green-100 text-green-700 border-green-200" },
  active:           { label: "Active",          className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  recruiting:       { label: "Recruiting",      className: "bg-orange-100 text-orange-700 border-orange-200" },
};

// ── Notification Dropdown ─────────────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(false);
  const ref                               = useRef(null);

  const unread = notifications.filter((n) => !n.read).length;


  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await fetchNotifications();
        setNotifications(data.notifications ?? []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { toast.error("Failed to mark notifications."); }
  };

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch { /* silent */ }
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="icon"
        className="rounded-xl relative"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="font-semibold text-sm">Notifications</p>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && notifications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">All caught up!</p>
            )}
            {!loading && notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleRead(n._id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-border last:border-0 ${
                  !n.read ? "bg-blue-50/60" : ""
                }`}
              >
                <p className="text-sm font-medium leading-snug">{n.title ?? n.message}</p>
                {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Venture Card ──────────────────────────────────────────────────────────────
function VentureCard({ idea, onNavigate, isOwner = false, onDelete, onOpenChatroom }) {
  const stage = stageConfig[idea.stage] ?? stageConfig.ideation;
  const confirmedMembers = idea.teamMembers?.filter((m) => m.confirmed).length ?? 0;
  const isFull = confirmedMembers >= idea.teamLimit;

  return (
    <Card
      className="p-5 rounded-2xl border border-border/60 bg-card backdrop-blur-sm 
                 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 
                 cursor-pointer flex flex-col group"
      onClick={() => onNavigate(`/marketplace/buyer/ventures/${idea._id}`)}
    >

      {/* ── Stage + Category ── */}
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${stage.className}`}>
          {stage.label}
        </span>

        <div className="flex items-center gap-1.5">
          {idea.isRecruiting && (
            <span className="text-[11px] px-2 py-0.5 rounded-full 
                             bg-orange-100 text-orange-700 border border-orange-200 animate-pulse">
              Hiring
            </span>
          )}
          <Badge variant="outline" className="text-[11px]">{idea.category}</Badge>
        </div>
      </div>

      {/* ── Title ── */}
      <h3 className="font-semibold text-[17px] mb-1 leading-snug 
                     group-hover:text-primary transition">
        {idea.title}
      </h3>

      {/* ── Description ── */}
      <p className="text-[12px] text-muted-foreground mb-3 line-clamp-3 flex-1">
        {idea.description}
      </p>

      {/* ── Tags ── */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {idea.tags?.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-[11px] px-2 py-0.5 rounded-full 
                       bg-primary/10 text-primary hover:bg-primary/20 transition"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* ── Creator ── */}
      
      <div className="flex items-center gap-3 py-3 border-t border-border/60">

        <Avatar className="h-8 w-8 ring-2 ring-primary/10">
          <AvatarImage src={idea.creator?.avatar} />
          <AvatarFallback>{idea.creator?.name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{idea.creator?.name}</p>
          <p className="text-[11px] text-muted truncate">{idea.creator?.email}</p>
          <p className="text-[9px] text-muted truncate">{idea.creator?.collegeName}</p>
        </div>

       
      </div>
      

      {/* ── Footer Stats ── */}
      <div className="flex items-center justify-between text-xs text-muted mt-2">

        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-primary" />
          <span className={`${isFull ? "text-red-500" : ""}`}>
            {confirmedMembers}/{idea.teamLimit}
          </span>
        </span>

        <div className="flex items-center gap-3">
          {idea.views > 0 && (
            <span className="flex items-center gap-1 hover:text-primary transition">
              <Eye className="h-3.5 w-3.5" /> {idea.views}
            </span>
          )}

          <span className="flex items-center gap-1 hover:text-red-500 transition">
            <Heart className="h-3.5 w-3.5" /> {idea.likes?.length ?? 0}
          </span>
        </div>
      </div>

      {/* ── CTA ── */}
      {!isOwner  && (
        <Button
          className="w-full mt-4 rounded-xl text-sm 
                     bg-primary/90 hover:bg-primary transition text-card"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(`/marketplace/buyer/ventures/${idea._id}`);
          }}
        >
          Know More
        </Button>
      )}

      {isOwner && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button
            variant="outline"
            className="rounded-xl text-sm gap-2 hover:bg-card border-border transition"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChatroom(idea);
            }}
          >
            <MessageCircle className="h-4 w-4" /> Chatroom
          </Button>
          <Button
            variant="outline"
            className="rounded-xl text-sm gap-2 hover:bg-card transition border-border"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/marketplace/buyer/ventures/${idea._id}?tab=manage`);
            }}
          >
            <Settings className="h-4 w-4" /> Manage
          </Button>
        </div>
      )}
    </Card>
  );
}

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────
function ConfirmDeleteDialog({ title, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <Card className="w-full max-w-sm rounded-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold">Archive Venture?</p>
            <p className="text-sm text-muted-foreground">This will archive "{title}"</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button
            className="flex-1 rounded-xl bg-red-500 hover:bg-red-600"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Archive"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VenturesPage() {
  const navigate = useNavigate();

  // ── Active main tab ────────────────────────────────────────────────────────
  const [mainTab, setMainTab] = useState("discover"); // "discover" | "mine"

  // ── Discover filters ───────────────────────────────────────────────────────
  const [searchQuery,       setSearchQuery]       = useState("");
  const [selectedStage,     setSelectedStage]     = useState("all");
  const [selectedCategory,  setSelectedCategory]  = useState("all");
  const [sort,              setSort]              = useState("recent");
  const [recruitingOnly,    setRecruitingOnly]    = useState(false);
  const [page,              setPage]              = useState(1);

  // ── Data ──────────────────────────────────────────────────────────────────
  const [ventures,    setVentures]    = useState([]);
  const [myVentures,  setMyVentures]  = useState([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [myLoading,   setMyLoading]   = useState(false);
  const [error,       setError]       = useState(null);

  // ── Delete confirm ─────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [deleting,     setDeleting]     = useState(false);
  
  const [totalUsers, setTotalUsers] = useState(0);

  const { user } = useUser();
  const userId = user?._id;

  useEffect(() => {
  const fetchUserCount = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/count");
      const data = await res.json();
      setTotalUsers(data.totalUsers);
    } catch (err) {
      console.error(err);
    }
  };

  fetchUserCount();
}, []);

  // ── Fetch discover ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (mainTab !== "discover") return;
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const { data } = await fetchVentures({
          page,
          limit: 9,
          search:      searchQuery   || undefined,
          category:    selectedCategory !== "all" ? selectedCategory : undefined,
          stage:       selectedStage    !== "all" ? selectedStage    : undefined,
          sort,
          isRecruiting: recruitingOnly ? true : undefined,
        });
        setVentures(data.ventures);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch {
        setError("Failed to load ventures. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, searchQuery, selectedStage, selectedCategory, sort, recruitingOnly, mainTab]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [searchQuery, selectedStage, selectedCategory, sort, recruitingOnly]);

  // ── Fetch my ventures ──────────────────────────────────────────────────────
  useEffect(() => {
    if (mainTab !== "mine") return;
    const load = async () => {
      try {
        setMyLoading(true);
        const { data } = await fetchMyVentures();
        setMyVentures(data.ventures ?? []);
      } catch {
        toast.error("Failed to load your ventures.");
      } finally {
        setMyLoading(false);
      }
    };
    load();
  }, [mainTab]);



  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteRequest = (id, title) => setDeleteTarget({ id, title });
  const handleOpenChatroom = (venture) => {
    navigate("/marketplace/buyer/ventures/chats", {
      state: { selectedVentureId: venture._id },
    });
  };
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteVenture(deleteTarget.id);
      setMyVentures((prev) => prev.filter((v) => v._id !== deleteTarget.id));
      toast.success("Venture archived.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to archive venture.");
    } finally {
      setDeleting(false);
    }
  };

  

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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2 rounded-xl border-border text-text"
                onClick={() => navigate("/marketplace/buyer/ventures/chats")}
              >
                <MessageCircle className="h-4 w-4 text-text" />
                Chat Teams
              </Button>
              <Button
                className="gap-2 rounded-xl text-card"
                onClick={() => navigate("/marketplace/buyer/ventures/create")}
              >
                <Plus className="h-4 w-4 text-card" />
                Post Your Idea
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            Collaborate with talented students, build innovative products, and pitch to investors.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Lightbulb,   label: "Active Ideas",           value: total, color: "text-purple-600", bg: "bg-purple-50" },
            { icon: Users,       label: "Student Entrepreneurs",  value: totalUsers,   color: "text-primary",    bg: "bg-blue-50"   },
            { icon: TrendingUp,  label: "Investor Connections",   value: 12,    color: "text-secondary",  bg: "bg-green-50"  },
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

        {/* ── Main Tab Switcher ── */}
        <div className="flex gap-1 p-1 bg-background rounded-xl w-fit mb-6">
          {[
            { key: "discover", label: "Discover" },
            { key: "mine",     label: "My Ventures" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMainTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                mainTab === key
                  ? "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
              {key === "mine" && myVentures.length > 0 && (
                <span className="ml-2 text-xs bg-primary text-white rounded-full px-1.5 py-0.5">
                  {myVentures.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ════ DISCOVER TAB ════ */}
        {mainTab === "discover" && (
          <>
            {/* Search & Filters */}
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
                <div className="flex gap-2 flex-wrap items-center">
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-40 rounded-xl border-border">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="views">Most Viewed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger className="w-44 rounded-xl border-border">
                      <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="ideation">Ideation</SelectItem>
                      <SelectItem value="building">Building</SelectItem>
                      <SelectItem value="ready-to-pitch">Ready to Pitch</SelectItem>
                      <SelectItem value="recruiting">Recruiting</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-44 rounded-xl border-border">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="EdTech">EdTech</SelectItem>
                      <SelectItem value="Social Impact">Social Impact</SelectItem>
                      <SelectItem value="Marketplace">Marketplace</SelectItem>
                      <SelectItem value="E-commerce">E-commerce</SelectItem>
                      <SelectItem value="Sustainability">Sustainability</SelectItem>
                      <SelectItem value="Fintech">Fintech</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Recruiting toggle pill */}
                  <button
                    onClick={() => setRecruitingOnly((r) => !r)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      recruitingOnly
                        ? "bg-orange-100 text-orange-700 border-orange-300"
                        : "border-border text-muted-foreground hover:border-orange-300"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    Hiring
                  </button>
                </div>
              </div>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" className="rounded-xl" onClick={() => setPage(1)}>
                  Try Again
                </Button>
              </div>
            )}

            {!loading && !error && ventures.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ventures.map((idea) => (
                    <VentureCard
                      key={idea._id}
                      idea={idea}
                      onNavigate={navigate}
                      isOwner={idea.creator?._id === userId}
                      onOpenChatroom={handleOpenChatroom}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3 mt-10">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Prev
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}

            {!loading && !error && ventures.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center mx-auto mb-4">
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
          </>
        )}

        {/* ════ MY VENTURES TAB ════ */}
        {mainTab === "mine" && (
          <>
            {myLoading && (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!myLoading && myVentures.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-background flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No ventures yet</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Share your entrepreneurial vision with the community!
                </p>
                <Button
                  className="rounded-xl"
                  onClick={() => navigate("/marketplace/buyer/ventures/create")}
                >
                  Post Your First Idea
                </Button>
              </div>
            )}

            {!myLoading && myVentures.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    {myVentures.length} venture{myVentures.length !== 1 ? "s" : ""} posted
                  </p>
                  <Button
                    className="gap-2 rounded-xl"
                    onClick={() => navigate("/marketplace/buyer/ventures/create")}
                  >
                    <Plus className="h-4 w-4" />
                    New Venture
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myVentures.map((idea) => (
                    <VentureCard
                      key={idea._id}
                      idea={idea}
                      onNavigate={navigate}
                      isOwner
                      onDelete={handleDeleteRequest}
                      onOpenChatroom={handleOpenChatroom}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ════ JOINED VENTURES TAB ════ */}
      </div>

      {/* ── Delete confirm dialog ── */}
      {deleteTarget && (
        <ConfirmDeleteDialog
          title={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
