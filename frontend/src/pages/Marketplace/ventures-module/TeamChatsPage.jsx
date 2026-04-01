import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import JoinedVentures from "./JoinedVentures";
import { fetchMyVentures, getAcceptedApplications } from "@/api/venturesApi";

export default function TeamChatsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [teams, setTeams] = useState([]);
  const [myVentures, setMyVentures] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialSelectedVentureId = location.state?.selectedVentureId || null;

  useEffect(() => {
    let isMounted = true;

    const loadChatData = async () => {
      try {
        setLoading(true);

        const [acceptedRes, myVenturesRes] = await Promise.all([
          getAcceptedApplications(),
          fetchMyVentures(),
        ]);

        if (!isMounted) return;

        setTeams(acceptedRes.data.applications || []);
        setMyVentures(myVenturesRes.data.ventures || []);
      } catch {
        if (!isMounted) return;
        toast.error("Failed to load team chats.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadChatData();

    return () => {
      isMounted = false;
    };
  }, []);

  const joinedVenturesData = useMemo(() => {
    const ownerVentures = myVentures.map((venture) => ({
      _id: `owner-${venture._id}`,
      venture,
      roleAppliedFor: "Founder",
      respondedAt: venture.createdAt || new Date().toISOString(),
      lastMessageAt: venture.createdAt || new Date().toISOString(),
      lastMessagePreview: `Chatroom for ${venture.title}`,
      isOwnerChat: true,
    }));

    const acceptedVentureIds = new Set(teams.map((team) => team.venture?._id));
    const ownerOnlyVentures = ownerVentures.filter(
      (team) => !acceptedVentureIds.has(team.venture?._id)
    );

    return [...ownerOnlyVentures, ...teams];
  }, [myVentures, teams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="px-0 mb-3 gap-2"
            onClick={() => navigate("/marketplace/buyer/ventures")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Ventures
          </Button>

          <div className="flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-4xl font-bold">Team Chats</h1>
              <p className="text-muted-foreground mt-1">
                Stay in sync with your ventures and team members in one place.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <JoinedVentures
            teams={joinedVenturesData}
            initialSelectedVentureId={initialSelectedVentureId}
          />
        )}
      </div>
    </div>
  );
}
