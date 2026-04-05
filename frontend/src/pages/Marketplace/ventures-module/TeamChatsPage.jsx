import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import JoinedVentures from "./JoinedVentures";
import { fetchMyVentures, getAcceptedApplications } from "@/api/venturesApi";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const resolvedInitialId = useMemo(() => {
  if (!initialSelectedVentureId) return null;
  // Direct match (member chats have the real _id)
  const direct = joinedVenturesData.find((t) => t._id === initialSelectedVentureId);
  if (direct) return direct._id;
  // Owner chats are prefixed — find by venture._id
  const ownerMatch = joinedVenturesData.find(
    (t) => t.venture?._id === initialSelectedVentureId
  );
  return ownerMatch?._id ?? initialSelectedVentureId;
}, [initialSelectedVentureId, joinedVenturesData]);

  return (
    <div className="h-[calc(100vh-72px)] overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto h-full px-4 py-0 md:px-4 md:py-4">
        
        <div className="mb-4">
     
    </div>
        {loading ? (
          <div className="flex h-full justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="h-full">
            <JoinedVentures
              teams={joinedVenturesData}
              initialSelectedVentureId={resolvedInitialId}
              onBack={() => navigate("/marketplace/buyer/ventures")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
