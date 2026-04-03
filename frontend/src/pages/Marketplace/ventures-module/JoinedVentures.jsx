import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/context/UserContext';
import { useSocket } from '@/context/SocketContext';
import { fetchVentureMessages, sendVentureMessage } from '@/api/venturesApi';
import { toast } from 'sonner';
import {
  MessageCircle,
  ChevronRight,
  X,
  Info,
  Loader2,
  ArrowLeft,
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
      className={`flex items-center gap-3 px-4 py-3 border-b border-border cursor-pointer transition-colors ${
        isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-muted/50'
      }`}
    >
      <Avatar className="h-10 w-10 bg-primary text-white">
        <AvatarFallback className="bg-primary text-white font-semibold">
          {  venture?.title.charAt(0)|| "V"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-semibold text-sm truncate">{venture?.title}</p>
          <span className="text-xs text-muted-foreground shrink-0">{lastMessageTime}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{previewText}</p>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
}

function TeamInfoPanel({ application, onClose }) {
  const venture = application.venture;
  const stage = stageConfig[venture?.stage] || stageConfig.ideation;
  const confirmedMembers = venture?.teamMembers?.filter((m) => m.confirmed).length || 0;

  return (
    <div className="w-80 bg-white border-l border-border flex flex-col">
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
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
        <div className="p-4 space-y-6">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Venture</p>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{venture?.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{venture?.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge className={`text-xs rounded-full ${stage.className}`}>{stage.label}</Badge>
                <Badge variant="outline" className="text-xs rounded-full">
                  {venture?.category}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Your Role</p>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-sm text-blue-700">{application.roleAppliedFor}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
              Team Members ({confirmedMembers}/{venture?.teamLimit})
            </p>
            <div className="space-y-2">
              {venture?.teamMembers
                ?.filter((member) => member.confirmed)
                .slice(0, 5)
                .map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user?.avatar} />
                      <AvatarFallback>{member.user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              {confirmedMembers > 5 && (
                <p className="text-xs text-muted-foreground py-2">+{confirmedMembers - 5} more members</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Creator</p>
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={venture?.creator?.avatar} />
                <AvatarFallback>{venture?.creator?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{venture?.creator?.name}</p>
                <p className="text-xs text-muted-foreground">{venture?.creator?.collegeName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamChatView({ application, onClose, onInfoClick, onMessageSent }) {
  const venture = application.venture;
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
    <div className="flex-1 flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={venture?.creator?.avatar} />
            <AvatarFallback>{venture?.creator?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{venture?.title}</p>
            <p className="text-xs text-muted-foreground">{venture?.creator?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={onInfoClick}
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
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
                    <div className="max-w-md rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 px-4 py-3 text-center shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        {metaDetails.title}
                      </p>
                      <p className="mt-1 text-sm">{metaDetails.body}</p>
                      {msg.text && msg.text !== metaDetails.body && (
                        <p className="mt-1 text-xs text-amber-800/80">{msg.text}</p>
                      )}
                      <p className="mt-2 text-[11px] text-amber-700/80">
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
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white text-foreground border border-border rounded-bl-none'
                    }`}
                  >
                    <p
                      className={`text-xs font-medium mb-1 ${
                        isOwnMessage ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}
                    >
                      {senderLabel}
                    </p>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
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

      <div className="p-4 border-t border-border flex gap-2">
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
          className="flex-1 px-4 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
        />
        <Button
          size="sm"
          className="rounded-xl px-4"
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
    <div className="flex h-full rounded-none border-0 overflow-hidden bg-white shadow-sm md:rounded-2xl md:border md:border-border">
      <div className="w-80 border-r border-border flex flex-col">
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="font-semibold flex items-center gap-2">
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
              }}
            />
          ))}
        </div>
      </div>

      {selectedApplication ? (
        <>
          <TeamChatView
            application={selectedApplication}
            onClose={() => {
              setSelectedApplication(null);
              setShowInfo(false);
            }}
            onInfoClick={() => setShowInfo(!showInfo)}
            onMessageSent={handleMessageSent}
          />

          {showInfo && (
            <TeamInfoPanel
              application={selectedApplication}
              onClose={() => setShowInfo(false)}
            />
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Select a team to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinedVentures;
