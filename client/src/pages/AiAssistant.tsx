import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Bot, Droplets, Leaf, Loader2, Send, Sparkles, ScanSearch, MessageCircle, Flag, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import PlantIdentify from "@/components/PlantIdentify";
import { useSearch } from "wouter";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Streamdown } from "streamdown";
import { nanoid } from "nanoid";
import { getLoginUrl } from "@/const";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Welche Wasserwerte braucht ein Schwarzwasser-Biotop?",
  "Meine Alocasia bekommt gelbe Blätter – was ist das Problem?",
  "Wie pflege ich Anubias im Aquarium?",
  "Welche Fische passen zu Channa?",
  "Mein pH-Wert ist zu hoch – was kann ich tun?",
  "Welche Pflanzen eignen sich für wenig Licht?",
];

export default function AiAssistant() {
  const { user, isAuthenticated } = useAuth();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const contextType = (params.get("context") as "plant" | "aquarium" | "general") ?? "general";
  const contextId = params.get("id") ? parseInt(params.get("id")!) : undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => nanoid());
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: plant } = trpc.plants.get.useQuery(
    { id: contextId! },
    { enabled: contextType === "plant" && !!contextId }
  );
  const { data: aquarium } = trpc.aquariums.get.useQuery(
    { id: contextId! },
    { enabled: contextType === "aquarium" && !!contextId }
  );

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
      toast.error("Fehler beim Senden");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;
    if (!isAuthenticated) { toast.error("Bitte anmelden"); return; }

    const newMessage: Message = { role: "user", content };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    chatMutation.mutate({
      message: content,
      sessionId,
      contextType,
      contextId,
      history: messages,
    });
  };

  const contextName = contextType === "plant" ? plant?.name : contextType === "aquarium" ? aquarium?.name : null;
  const [mode, setMode] = useState<"chat" | "identify">("chat");

  // Community correction state: which assistant message is being corrected.
  const [correctingIdx, setCorrectingIdx] = useState<number | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const correctionMutation = trpc.ai.submitCorrection.useMutation({
    onSuccess: () => {
      toast.success("Danke! Deine Korrektur fließt als Community-Fakt in die KI ein. (+8 XP)");
      setCorrectingIdx(null);
      setCorrectionText("");
    },
    onError: (e) => toast.error(e.message || "Korrektur fehlgeschlagen"),
  });
  const submitCorrection = (assistantContent: string) => {
    if (correctionText.trim().length < 3) { toast.error("Bitte gib eine Korrektur ein"); return; }
    // Find the preceding user message as topic.
    const idx = correctingIdx ?? -1;
    const topic = idx > 0 ? messages[idx - 1]?.content?.slice(0, 200) : undefined;
    correctionMutation.mutate({ kind: "chat", topic, originalAnswer: assistantContent.slice(0, 4000), correctedText: correctionText.trim() });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-border/30 px-4 py-3 bg-background/80 backdrop-blur-sm">
        <div className="container max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-sm">BlackwaterLeaf KI-Assistent</h1>
            {contextName ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {contextType === "plant" ? <Leaf className="w-3 h-3" /> : <Droplets className="w-3 h-3" />}
                Kontext: {contextName}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Experte für Aquaristik & Pflanzen</p>
            )}
          </div>
          {!contextName && (
            <div className="flex items-center gap-1 bg-secondary/60 rounded-lg p-0.5">
              <button
                onClick={() => setMode("chat")}
                className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all press-active",
                  mode === "chat" ? "bg-primary/15 text-primary" : "text-muted-foreground")}
              >
                <MessageCircle className="w-3.5 h-3.5" /> Chat
              </button>
              <button
                onClick={() => setMode("identify")}
                className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all press-active",
                  mode === "identify" ? "bg-primary/15 text-primary" : "text-muted-foreground")}
              >
                <ScanSearch className="w-3.5 h-3.5" /> Bestimmen
              </button>
            </div>
          )}
        </div>
      </div>

      {mode === "identify" && !contextName ? (
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <PlantIdentify />
        </div>
      ) : (
      <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="container max-w-3xl mx-auto px-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display font-semibold text-lg mb-2">Wie kann ich helfen?</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Ich bin dein Experte für Aquaristik und Pflanzen. Stelle mir Fragen zu Pflege, Problemen oder Bestimmung.
              </p>
              {!isAuthenticated && (
                <div className="mb-6 p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-3">Melde dich an, um den KI-Assistenten zu nutzen.</p>
                  <Button asChild size="sm" className="press-active">
                    <a href={getLoginUrl()}>Anmelden</a>
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    disabled={!isAuthenticated}
                    className="text-left text-xs px-3 py-2.5 rounded-lg bg-secondary/50 border border-border/50 hover:bg-secondary hover:border-primary/30 transition-all duration-150 press-active disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 animate-fade-in",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {msg.role === "assistant" ? (
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              ) : (
                <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                  <AvatarImage src={user?.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-secondary text-xs">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === "user"
                    ? "bg-primary/15 text-foreground rounded-tr-sm"
                    : "bg-card border border-border/50 rounded-tl-sm"
                )}
              >
                {msg.role === "assistant" ? (
                  <>
                    <div className="prose prose-sm prose-invert max-w-none">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                    {isAuthenticated && (
                      correctingIdx === i ? (
                        <div className="mt-3 pt-3 border-t border-border/40">
                          <p className="text-xs text-muted-foreground mb-1.5">Was ist die korrekte, faktenbasierte Antwort?</p>
                          <Textarea
                            value={correctionText}
                            onChange={(e) => setCorrectionText(e.target.value)}
                            placeholder="z.B. Channa bleheri benötigt 22–26°C, nicht über 28°C ..."
                            className="min-h-[60px] resize-none text-sm bg-secondary/50 border-border/50"
                          />
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={() => { setCorrectingIdx(null); setCorrectionText(""); }}>
                              <X className="w-3.5 h-3.5 mr-1" /> Abbrechen
                            </Button>
                            <Button size="sm" disabled={correctionMutation.isPending} onClick={() => submitCorrection(msg.content)} className="press-active">
                              <Check className="w-3.5 h-3.5 mr-1" /> Korrektur senden
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setCorrectingIdx(i); setCorrectionText(""); }}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Flag className="w-3 h-3" /> Antwort korrigieren
                        </button>
                      )
                    )}
                  </>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border/30 px-4 py-3 bg-background/80 backdrop-blur-sm">
        <div className="container max-w-3xl mx-auto flex gap-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAuthenticated ? "Stelle eine Frage..." : "Bitte anmelden"}
            disabled={!isAuthenticated || isLoading}
            className="flex-1 min-h-[44px] max-h-32 resize-none bg-secondary/50 border-border/50 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            size="icon"
            disabled={!input.trim() || !isAuthenticated || isLoading}
            onClick={() => sendMessage()}
            className="w-11 h-11 flex-shrink-0 press-active"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
