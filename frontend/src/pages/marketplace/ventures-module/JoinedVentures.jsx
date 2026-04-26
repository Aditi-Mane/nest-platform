import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '../../../context/UserContext.jsx';
import { useSocket } from '../../../context/SocketContext.jsx';
import { fetchVentureMessages, sendVentureMessage } from '@/api/venturesApi';
import { toast } from 'sonner';
import {
  MessageCircle,
  ChevronRight,
  X,
  Info,
  Loader2,
  ArrowLeft,
  Menu,
} from 'lucide-react';

const stageConfig = {
  ideation: { label: 'Ideation', className: 'bg-purple-100 text-purple-700' },
  building: { label: 'Building', className: 'bg-blue-100 text-blue-700' },
  'ready-to-pitch': { label: 'Ready to Pitch', className: 'bg-green-100 text-green-700' },
  active: { label: 'Active', className: 'bg-yellow-100 text-yellow-700' },
  recruiting: { label: 'Recruiting', className: 'bg-orange-100 text-orange-700' },
};

function formatPreview(message, fallbackRole) {
  if (!message) return `Accepted as ${fallbackRole}`;
  if (message.messageType === 'system') return message.text;

  const senderName = message.sender?.name || 'Someone';
  return `${senderName}: ${message.text}`;
}

function getMetaMessageDetails(message, venture) {
  const metaType = message?.meta?.type;

  if (!metaType) {
    return {
      title: 'Team Update',
      body: message?.text || 'A team update was posted.',
    };
  }

  if (metaType === 'USER_JOINED') {
    const joinedUserId = String(message?.meta?.user || '');
    const joinedMember = venture?.teamMembers?.find(
      (member) => String(member.user?._id || member.user) === joinedUserId
    );

    return {
      title: 'New Member Joined',
      body: joinedMember?.user?.name
        ? `${joinedMember.user.name} joined the venture as ${joinedMember.role}.`
        : message?.text || 'A new member joined the venture.',
    };
  }

  return {
    title: metaType.replaceAll('_', ' '),
    body: message?.text || 'A team update was posted.',
  };
}

function getSenderRole(senderId, venture) {
  if (!senderId || !venture) return '';

  if (String(venture.creator?._id || venture.creator) === String(senderId)) {
    return 'Founder';
  }

  const member = venture.teamMembers?.find(
    (teamMember) => String(teamMember.user?._id || teamMember.user) === String(senderId)
  );

  return member?.role || '';
}

function getFounderProfile(venture) {
  const creator =
    venture?.creator && typeof venture.creator === 'object' ? venture.creator : null;

  if (creator?.name || creator?.avatar || creator?.collegeName) {
    return creator;
  }

  const founderMember = venture?.teamMembers?.find((member) => {
    const role = String(member?.role || '').toLowerCase();
    return member?.confirmed && role === 'founder';
  });

  const founderUser =
    founderMember?.user && typeof founderMember.user === 'object' ? founderMember.user : null;

  return founderUser || null;
}

function ChatListItem({ application, isSelected, onClick }) {
  const venture = application.venture;
  const lastActivity = application.lastMessageAt || application.respondedAt;
  const previewText = application.lastMessagePreview || `Accepted as ${application.roleAppliedFor}`;
  const lastMessageTime = new Date(lastActivity).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 border-b border-border px-3 py-3 cursor-pointer transition-colors sm:gap-3 sm:px-4 ${
        isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-muted/50'
      }`}
    >
      <Avatar className="h-9 w-9 bg-primary text-white sm:h-10 sm:w-10">
        <AvatarFallback className="bg-primary text-white text-sm font-semibold">
          {  venture?.title.charAt(0)|| "V"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="truncate text-[13px] font-semibold sm:text-sm">{venture?.title}</p>
          <span className="shrink-0 text-[10px] text-muted-foreground sm:text-xs">{lastMessageTime}</span>
        </div>
        <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{previewText}</p>
      </div>

      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground sm:h-4 sm:w-4" />
    </div>
  );
}

function TeamInfoPanel({ application, onClose }) {
  const venture = application.venture;
  const founderProfile = getFounderProfile(venture);
  const stage = stageConfig[venture?.stage] || stageConfig.ideation;
  const confirmedMembers = venture?.teamMembers?.filter((m) => m.confirmed).length || 0;



  return (
    <div className="flex h-full w-full flex-col bg-white md:w-80 md:max-w-none md:border-l md:border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold sm:text-base">
          <Info className="h-4 w-4" /> Team Info
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 p-4 pb-8">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground sm:text-xs">Venture</p>
            <div className="space-y-2">
              <h4 className="text-[13px] font-semibold sm:text-sm">{venture?.title}</h4>
              <p className="whitespace-pre-wrap break-words text-[11px] text-muted-foreground sm:text-xs">
                {venture?.description}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge className={`rounded-full text-[10px] sm:text-xs ${stage.className}`}>{stage.label}</Badge>
                <Badge variant="outline" className="rounded-full text-[10px] sm:text-xs">
                  {venture?.category}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground sm:text-xs">Your Role</p>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-[13px] font-medium text-blue-700 sm:text-sm">{application.roleAppliedFor}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase text-muted-foreground sm:text-xs">
              Team Members ({confirmedMembers}/{venture?.teamLimit})
            </p>
            <div className="space-y-2">
              {venture?.teamMembers
  ?.filter((member) => member.confirmed)
  .map((member, index) => {
   
    const userObj = member.user && typeof member.user === "object" && "name" in member.user
      ? member.user
      : null;

    return (
      <div key={index} className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={userObj?.avatar} />
          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
            {userObj?.name?.charAt(0)?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="truncate text-[13px] font-medium sm:text-sm">{userObj?.name ?? "Unknown"}</p>
          <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{member.role}</p>
        </div>
      </div>
    );
  })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase text-muted-foreground sm:text-xs">Creator</p>
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={founderProfile?.avatar || "/default-avatar.png"} />
                <AvatarFallback>{founderProfile?.name?.charAt(0) || "F"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-[13px] font-medium sm:text-sm">{founderProfile?.name || "Founder"}</p>
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  {founderProfile?.collegeName || "College not available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamChatView({ application, onClose, onOpenList, onInfoClick, onMessageSent }) {
  const venture = application.venture;
  const founderProfile = getFounderProfile(venture);
  const stage = stageConfig[venture?.stage] || stageConfig.ideation;
  const { user } = useUser();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const currentUserId = user?._id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let isMounted = true;

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await fetchVentureMessages(venture._id);

        if (!isMounted) return;

        const loadedMessages = Array.isArray(data) ? data : [];
        setMessages(loadedMessages);

        const lastMessage = loadedMessages[loadedMessages.length - 1];
        if (lastMessage) {
          onMessageSent?.(application._id, lastMessage);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || 'Failed to load chat messages.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, [application._id, venture._id]);

  useEffect(() => {
    if (!socket || !venture?._id) return;

    const roomId = venture._id;
    const handleConnect = () => {
      socket.emit('join_venture_room', roomId);
    };

    const handleIncomingMessage = (incomingMessage) => {
      if (String(incomingMessage?.venture) !== String(roomId)) return;

      setMessages((prev) => {
        const alreadyExists = prev.some((message) => message._id === incomingMessage._id);
        if (alreadyExists) return prev;
        return [...prev, incomingMessage];
      });

      onMessageSent?.(application._id, incomingMessage);
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on('connect', handleConnect);

    socket.on('receive_venture_message', handleIncomingMessage);

    return () => {
      socket.emit('leave_venture_room', roomId);
      socket.off('connect', handleConnect);
      socket.off('receive_venture_message', handleIncomingMessage);
    };
  }, [application._id, onMessageSent, socket, venture?._id]);

  const handleSendMessage = async () => {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || sending) return;

    try {
      setSending(true);
      const { data } = await sendVentureMessage(venture._id, { text: trimmedMessage });
      setMessages((prev) => {
        const alreadyExists = prev.some((message) => message._id === data._id);
        if (alreadyExists) return prev;
        return [...prev, data];
      });
      onMessageSent?.(application._id, data);
      setNewMessage('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="px-3 py-3 border-b border-border flex items-center justify-between gap-2 sm:px-4 sm:gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-lg md:hidden"
            onClick={onOpenList}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarImage src={founderProfile?.avatar} />
            <AvatarFallback>{founderProfile?.name?.charAt(0) || "F"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate pr-1 text-[13px] font-semibold sm:text-sm md:text-base">{venture?.title}</p>
            <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
              {founderProfile?.name || "Founder"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            className="h-8 shrink-0 rounded-lg px-2 text-[11px] md:h-8 md:w-8 md:px-0"
            onClick={onInfoClick}
          >
            <Info className="h-4 w-4" />
            <span className="ml-1 md:hidden">Info</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 shrink-0 rounded-lg md:inline-flex"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border-b border-border bg-background/60 px-3 py-3 md:hidden">
        <div className="flex flex-wrap gap-2">
          <Badge className={`rounded-full text-[10px] ${stage.className}`}>{stage.label}</Badge>
          {venture?.category ? (
            <Badge variant="outline" className="rounded-full text-[10px]">
              {venture.category}
            </Badge>
          ) : null}
          {application?.roleAppliedFor ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {application.roleAppliedFor}
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Founder: {founderProfile?.name || "Founder"}
          {founderProfile?.collegeName ? ` • ${founderProfile.collegeName}` : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 bg-muted/20">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <p className="text-sm text-muted-foreground mb-3">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">
                  No messages yet. Start the conversation with your team.
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isSystem = msg.messageType === 'system';
              const senderId = msg.sender?._id || msg.sender;
              const isOwnMessage = String(senderId) === String(currentUserId);
              const senderRole = getSenderRole(msg.sender?._id || msg.sender, venture);
              const senderName = isOwnMessage ? 'You' : msg.sender?.name || 'Team Member';
              const senderLabel = senderRole ? `${senderName} • ${senderRole}` : senderName;

              if (isSystem) {
                const metaDetails = getMetaMessageDetails(msg, venture);

                return (
                  <div key={msg._id} className="flex justify-center">
                    <div className="max-w-full rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-center text-amber-900 shadow-sm sm:max-w-md sm:px-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 sm:text-[11px]">
                        {metaDetails.title}
                      </p>
                      <p className="mt-1 text-[13px] sm:text-sm">{metaDetails.body}</p>
                      {msg.text && msg.text !== metaDetails.body && (
                        <p className="mt-1 text-[11px] text-amber-800/80 sm:text-xs">{msg.text}</p>
                      )}
                      <p className="mt-2 text-[10px] text-amber-700/80 sm:text-[11px]">
                        {new Date(msg.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg._id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 sm:max-w-xs sm:px-4 ${
                      isOwnMessage
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white text-foreground border border-border rounded-bl-none'
                    }`}
                  >
                    <p
                      className={`mb-1 text-[11px] font-medium ${
                        isOwnMessage ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      {senderLabel}
                    </p>
                    <p className="whitespace-pre-wrap break-words text-[13px] sm:text-sm">{msg.text}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        isOwnMessage ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 sm:p-4 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={loading || Boolean(error) || sending}
          className="flex-1 rounded-xl border border-border px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 sm:px-4 sm:text-sm"
        />
        <Button
          size="sm"
          className="rounded-xl px-3 text-[12px] sm:px-4 sm:text-sm"
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || loading || Boolean(error) || sending}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
        </Button>
      </div>
    </div>
  );
}

const JoinedVentures = ({ teams, initialSelectedVentureId = null, onBack = null }) => {
  const hydratedTeams = useMemo(
    () =>
      [...(teams || [])].sort(
        (a, b) =>
          new Date(b.lastMessageAt || b.respondedAt).getTime() -
          new Date(a.lastMessageAt || a.respondedAt).getTime()
      ),
    [teams]
  );

  const [teamStates, setTeamStates] = useState(hydratedTeams);
  const [selectedApplication, setSelectedApplication] = useState(hydratedTeams[0] || null);
  const [showInfo, setShowInfo] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  useEffect(() => {
    setTeamStates(hydratedTeams);
    setSelectedApplication((prevSelected) => {
      if (!hydratedTeams.length) return null;
      if (!prevSelected) return hydratedTeams[0];
      return hydratedTeams.find((team) => team._id === prevSelected._id) || hydratedTeams[0];
    });
  }, [hydratedTeams]);

 useEffect(() => {
  if (!initialSelectedVentureId || !hydratedTeams.length) return;

  const matchingTeam = hydratedTeams.find((team) => {
    return (
      String(team._id) === String(initialSelectedVentureId) ||
      String(team.venture?._id) === String(initialSelectedVentureId)
    );
  });

  if (matchingTeam) {
    setSelectedApplication(matchingTeam);
    setShowInfo(false);
  }
}, [hydratedTeams, initialSelectedVentureId]);

  const handleMessageSent = useCallback((applicationId, message) => {
    if (!message) return;

    setTeamStates((prev) =>
      [...prev]
        .map((team) => {
          if (team._id !== applicationId) return team;

          return {
            ...team,
            lastMessageAt: message.createdAt,
            lastMessagePreview: formatPreview(message, team.roleAppliedFor),
          };
        })
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt || b.respondedAt).getTime() -
            new Date(a.lastMessageAt || a.respondedAt).getTime()
        )
    );
  }, []);

  if (!teamStates.length) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-1">No Joined Teams Yet</h3>
        <p className="text-muted-foreground text-sm mb-6">
          Your accepted applications will appear here. Apply to ventures to join teams!
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full rounded-none border-0 overflow-hidden bg-white shadow-sm md:rounded-2xl md:border md:border-border">
      <div className="hidden w-80 border-r border-border md:flex md:flex-col">
        <div className="px-4 py-5 border-b border-border">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-semibold">
              <MessageCircle className="h-5 w-5" />
              Team Chats
            </h2>

            <span className="text-sm text-muted-foreground">
              {teamStates.length} {teamStates.length === 1 ? 'team' : 'teams'}
            </span>
          </div>

          
        </div>

        <div className="flex-1 overflow-y-auto">
          {teamStates.map((application) => (
            <ChatListItem
              key={application._id}
              application={application}
              isSelected={selectedApplication?._id === application._id}
              onClick={() => {
                setSelectedApplication(application);
                setShowInfo(false);
                setShowMobileList(false);
              }}
            />
          ))}
        </div>
      </div>

      {selectedApplication ? (
        <>
          <TeamChatView
            application={selectedApplication}
            onOpenList={() => setShowMobileList(true)}
            onClose={() => {
              setSelectedApplication(null);
              setShowInfo(false);
            }}
            onInfoClick={() => setShowInfo(!showInfo)}
            onMessageSent={handleMessageSent}
          />

          {showInfo && (
            <>
              <div
                className="fixed inset-0 z-30 bg-black/40 md:hidden"
                onClick={() => setShowInfo(false)}
              />
              <div className="fixed inset-0 z-40 md:static md:z-auto md:inset-auto">
                <TeamInfoPanel
                  application={selectedApplication}
                  onClose={() => setShowInfo(false)}
                />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Select a team to start chatting</p>
            <Button
              className="mt-4 rounded-xl md:hidden"
              variant="outline"
              onClick={() => setShowMobileList(true)}
            >
              Open team list
            </Button>
          </div>
        </div>
      )}

      {showMobileList && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setShowMobileList(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 flex w-full max-w-[92vw] flex-col bg-white shadow-xl md:hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div>
                <h2 className="text-sm font-semibold">Team Chats</h2>
                <p className="text-[11px] text-muted-foreground">
                  {teamStates.length} {teamStates.length === 1 ? 'team' : 'teams'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onBack && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={onBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setShowMobileList(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {teamStates.map((application) => (
                <ChatListItem
                  key={application._id}
                  application={application}
                  isSelected={selectedApplication?._id === application._id}
                  onClick={() => {
                    setSelectedApplication(application);
                    setShowInfo(false);
                    setShowMobileList(false);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JoinedVentures;
