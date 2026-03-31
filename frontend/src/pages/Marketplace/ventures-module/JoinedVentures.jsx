import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, ChevronRight, X, Phone, Info
} from 'lucide-react';

const stageConfig = {
  ideation:         { label: "Ideation",        className: "bg-purple-100 text-purple-700" },
  building:         { label: "Building",        className: "bg-blue-100 text-blue-700" },
  "ready-to-pitch": { label: "Ready to Pitch",  className: "bg-green-100 text-green-700" },
  active:           { label: "Active",          className: "bg-yellow-100 text-yellow-700" },
  recruiting:       { label: "Recruiting",      className: "bg-orange-100 text-orange-700" },
};

// WhatsApp-style chat list item
function ChatListItem({ application, isSelected, onClick }) {
  const venture = application.venture;
  const lastMessageTime = new Date(application.respondedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 border-b border-border cursor-pointer transition-colors ${
        isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/50"
      }`}
    >
      {/* Avatar */}
      <Avatar className="h-14 w-14 ring-2 ring-primary/10 shrink-0">
        <AvatarImage src={venture?.creator?.avatar} />
        <AvatarFallback>{venture?.creator?.name?.charAt(0)}</AvatarFallback>
      </Avatar>

      {/* Chat info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="font-semibold text-sm truncate">{venture?.title}</p>
          <span className="text-xs text-muted-foreground shrink-0">{lastMessageTime}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {venture?.creator?.name} • {application.roleAppliedFor}
        </p>
      </div>

      {/* Indicator */}
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
}

// Team info panel
function TeamInfoPanel({ application, onClose }) {
  const venture = application.venture;
  const stage = stageConfig[venture?.stage] || stageConfig.ideation;
  const confirmedMembers = venture?.teamMembers?.filter((m) => m.confirmed).length || 0;

  return (
    <div className="w-80 bg-white border-l border-border flex flex-col">
      {/* Header */}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Venture Info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Venture</p>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{venture?.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {venture?.description}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Badge className={`text-xs rounded-full ${stage.className}`}>
                  {stage.label}
                </Badge>
                <Badge variant="outline" className="text-xs rounded-full">
                  {venture?.category}
                </Badge>
              </div>
            </div>
          </div>

          {/* Your Role */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Your Role</p>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-sm text-blue-700">{application.roleAppliedFor}</p>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
              Team Members ({confirmedMembers}/{venture?.teamLimit})
            </p>
            <div className="space-y-2">
              {venture?.teamMembers
                ?.filter((m) => m.confirmed)
                .slice(0, 5)
                .map((member, i) => (
                  <div key={i} className="flex items-center gap-2">
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
                <p className="text-xs text-muted-foreground py-2">
                  +{confirmedMembers - 5} more members
                </p>
              )}
            </div>
          </div>

          {/* Creator */}
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

// Chat view
function TeamChatView({ application, onClose, onInfoClick }) {
  const venture = application.venture;
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "system",
      text: `You've been accepted to join "${venture.title}"! Welcome to the team.`,
      timestamp: new Date(application.respondedAt),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "user",
          text: newMessage,
          timestamp: new Date(),
        },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-xl ${
                  msg.sender === "user"
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-background text-foreground rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === "user" ? "text-primary/80" : "text-muted-foreground"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 px-4 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <Button
          size="sm"
          className="rounded-xl px-4"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

// Main component
const JoinedVentures = ({ teams }) => {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  if (!teams || teams.length === 0) {
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
    <div className="flex h-[600px] rounded-2xl border border-border overflow-hidden bg-white shadow-sm">
      {/* Chat List */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Team Chats
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {teams.length} team{teams.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {teams.map((application) => (
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

      {/* Main area: Chat or empty state */}
      {selectedApplication ? (
        <>
          <TeamChatView
            application={selectedApplication}
            onClose={() => {
              setSelectedApplication(null);
              setShowInfo(false);
            }}
            onInfoClick={() => setShowInfo(!showInfo)}
          />

          {/* Team Info Panel */}
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
