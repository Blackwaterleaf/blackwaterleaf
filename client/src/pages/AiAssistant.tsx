import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Bot,
  Droplets,
  Leaf,
  Loader2,
  Send,
  Sparkles,
  ScanSearch,
  MessageCircle,
  Flag,
  Check,
  X,
  Fish,
} from "lucide-react";
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
import { Seo } from "@/components/Seo";

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
  "Welche Arten eignen sich für wenig Licht?",
];

const CHANNA_SUGGESTIONS = [
  "Welche Beckengröße braucht eine Channa andrao?",
  "Wie richte ich ein Schwarzwasser-Becken für Channa ein?",
  "Channa bleheri oder Channa gachua – was eignet sich für Einsteiger?",
  "Welches Futter ist artgerecht für Channa?",
  "Brauchen Channa eine Winterruhe?",
  "Wie verhindere ich, dass mein Channa aus dem Becken springt?",
];

export default function AiAssistant() {
  const { user, isAuthenticated } = useAuth();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const baseContextType =
    (params.get("context") as "plant" | "aquarium" | "general") ?? "general";
  const [channaMode, setChannaMode] = useState(params.get("context") === "channa");
  const contextType: "plant" | "aquarium" | "general" | "channa" =
    channaMode ? "channa" : baseContextType;
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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
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
    if (!isAuthenticated) {
      toast.error("Bitte anmelden");
      return;
    }

    const newMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, newMessage]);
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

  const contextName =
    contextType === "plant"
      ? plant?.name
      : contextType === "aquarium"
        ? aquarium?.name
        : null;
  const [mode, setMode] = useState<"chat" | "identify">("chat");

  // Community correction state
  const [correctingIdx, setCorrectingIdx] = useState<number | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const correctionMutation = trpc.ai.submitCorrection.useMutation({
    onSuccess: () => {
      toast.success(
        "Danke! Deine Korrektur fließt als Community-Fakt in die KI ein. (+8 XP)"
      );
      setCorrectingIdx(null);
      setCorrectionText("");
    },
    onError: (e) => toast.error(e.message || "Korrektur fehlgeschlagen"),
  });
  const submitCorrection = (assistantContent: string) => {
    if (correctionText.trim().length < 3) {
      toast.error("Bitte gib eine Korrektur ein");
      return;
    }
    const idx = correctingIdx ?? -1;
    const topic =
      idx > 0 ? messages[idx - 1]?.content?.slice(0, 200) : undefined;
    correctionMutation.mutate({
      kind: "chat",
      topic,
      originalAnswer: assistantContent.slice(0, 4000),
      correctedText: correctionText.trim(),
    });
  };

  return (
    <div className="flex flex-col bl-ai-shell">
      <Seo
        title="KI-Assistent – Botanik & Aquaristik Beratung"
        path="/ai"
        description="Der BlackwaterLeaf KI-Assistent beantwortet deine Fragen zu Pflanzenpflege, Aquaristik, Channa-Haltung und Wasserwerten – faktenbasiert und auf Deutsch."
      />
      {/* ── Header ── */}
      <div
        className="px-4 pt-4 pb-3 flex-shrink-0"
        style={{
          background: "#070A08",
          borderBottom: "1px solid rgba(45,107,63,0.25)",
        }}
      >
        <div className="container max-w-3xl mx-auto">
          <h1
            className="font-brand leading-none mb-0.5"
            style={{ fontSize: "clamp(1.8rem, 6vw, 2.4rem)", color: "#FFFFFF", letterSpacing: "0.01em" }}
          >
            KI-Assistent
          </h1>
          {contextName ? (
            <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.60)" }}>
              {contextType === "plant" ? "🌿" : "💧"} Kontext: {contextName}
            </p>
          ) : (
            <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.60)" }}>
              {channaMode ? "Spezialist für Channa (Schlangenkopffische)" : "Dein Begleiter für Botanik & Aquaristik & Channa"}
            </p>
          )}

          {/* Mode-Tabs als Pills (wie in Native App) */}
          {!contextName && (
            <div className="flex gap-2">
              <button
                onClick={() => setMode("chat")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
                style={{
                  background: mode === "chat" ? "#2D9B6E" : "rgba(13,17,14,0.85)",
                  color: mode === "chat" ? "#FFFFFF" : "rgba(255,255,255,0.65)",
                  border: mode === "chat" ? "none" : "1px solid rgba(45,107,63,0.30)",
                }}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Chat
              </button>
              <button
                onClick={() => setMode("identify")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
                style={{
                  background: mode === "identify" ? "#2D9B6E" : "rgba(13,17,14,0.85)",
                  color: mode === "identify" ? "#FFFFFF" : "rgba(255,255,255,0.65)",
                  border: mode === "identify" ? "none" : "1px solid rgba(45,107,63,0.30)",
                }}
              >
                <ScanSearch className="w-3.5 h-3.5" />
                Bestimmen
              </button>
              <button
                onClick={() => { setChannaMode(v => !v); setMode("chat"); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 active:scale-95"
                style={{
                  background: channaMode ? "rgba(212,175,55,0.20)" : "rgba(13,17,14,0.85)",
                  color: channaMode ? "#D4AF37" : "rgba(255,255,255,0.65)",
                  border: channaMode ? "1px solid rgba(212,175,55,0.40)" : "1px solid rgba(45,107,63,0.30)",
                }}
              >
                <Fish className="w-3.5 h-3.5" />
                Channa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Identify Mode ── */}
      {mode === "identify" && !contextName ? (
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <PlantIdentify />
        </div>
      ) : (
        <>
          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="container max-w-3xl mx-auto px-4 space-y-4">
              {/* Empty state – identisch mit Native App */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center pt-10 pb-6 px-4 animate-fade-in">
                  {/* Sparkles-Icon */}
                  <div className="mb-5"                   style={{ color: "#34D399" }}>
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M26 4L29.5 18.5L44 22L29.5 25.5L26 40L22.5 25.5L8 22L22.5 18.5L26 4Z" fill="currentColor" opacity="0.9" />
                      <path d="M42 8L43.5 13.5L49 15L43.5 16.5L42 22L40.5 16.5L35 15L40.5 13.5L42 8Z" fill="currentColor" opacity="0.6" />
                      <path d="M10 32L11 36L15 37L11 38L10 42L9 38L5 37L9 36L10 32Z" fill="currentColor" opacity="0.5" />
                    </svg>
                  </div>

                  <h2
                    className="font-brand text-2xl font-bold mb-2 text-center"
                    style={{                     color: "#FFFFFF", letterSpacing: "0.01em" }}
                  >
                    Stell deine erste Frage
                  </h2>
                  <p className="text-sm text-center mb-6" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Tippe eine Frage oder wähle einen Vorschlag.
                  </p>

                  {!isAuthenticated && (
                    <div
                      className="mb-6 p-4 rounded-2xl w-full max-w-sm"
                      style={{
                        background: "rgba(13,17,14,0.90)",
                        border: "1px solid rgba(45,107,63,0.30)",
                      }}
                    >
                      <p className="text-sm mb-3 text-center" style={{ color: "rgba(255,255,255,0.60)" }}>
                        Melde dich an, um den KI-Assistenten zu nutzen.
                      </p>
                      <Button asChild size="sm" className="w-full press-active btn-glow">
                        <a href={getLoginUrl()}>Anmelden</a>
                      </Button>
                    </div>
                  )}

                  {/* Vorschläge als große Karten (wie in Native App) */}
                  <div className="w-full max-w-lg space-y-2.5">
                    {(channaMode ? CHANNA_SUGGESTIONS : SUGGESTIONS).slice(0, 4).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        disabled={!isAuthenticated}
                        className="w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: "rgba(13,17,14,0.85)",
                          border: "1px solid rgba(45,107,63,0.30)",
                          color: "rgba(255,255,255,0.88)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message list */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  {msg.role === "assistant" ? (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(45,155,110,0.25), rgba(45,155,110,0.10))",
                        border: "1px solid rgba(45,155,110,0.30)",
                      }}
                    >
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  ) : (
                    <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5 ring-1 ring-primary/20">
                      <AvatarImage src={user?.avatarUrl ?? undefined} />
                      <AvatarFallback
                        className="text-xs font-semibold"
                        style={{
                          background: "rgba(45,155,110,0.20)",
                          color: "#34D399",
                        }}
                      >
                        {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  {/* Bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "rounded-tr-sm"
                        : "rounded-tl-sm"
                    )}
                    style={
                      msg.role === "user"
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(45,155,110,0.20), rgba(45,155,110,0.12))",
                            border: "1px solid rgba(45,155,110,0.25)",
                          }
                        : {
                            background: "rgba(13,17,14,0.90)",
                            border: "1px solid rgba(45,107,63,0.30)",
                          }
                    }
                  >
                    {msg.role === "assistant" ? (
                      <>
                        <div className="prose prose-sm prose-invert max-w-none">
                          <Streamdown>{msg.content}</Streamdown>
                        </div>
                        {isAuthenticated &&
                          (correctingIdx === i ? (
                            <div
                              className="mt-3 pt-3"
                              style={{
                                borderTop: "1px solid rgba(45,107,63,0.30)",
                              }}
                            >
                              <p className="text-xs text-muted-foreground mb-1.5">
                                Was ist die korrekte, faktenbasierte Antwort?
                              </p>
                              <Textarea
                                value={correctionText}
                                onChange={(e) =>
                                  setCorrectionText(e.target.value)
                                }
                                placeholder="z.B. Channa bleheri benötigt 22–26°C, nicht über 28°C ..."
                                className="min-h-[60px] resize-none text-sm"
                                style={{
                                  background: "rgba(7,10,8,0.95)",
                                  border: "1px solid rgba(45,107,63,0.30)",
                                }}
                              />
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCorrectingIdx(null);
                                    setCorrectionText("");
                                  }}
                                >
                                  <X className="w-3.5 h-3.5 mr-1" /> Abbrechen
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={correctionMutation.isPending}
                                  onClick={() => submitCorrection(msg.content)}
                                  className="press-active"
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" />{" "}
                                  Korrektur senden
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setCorrectingIdx(i);
                                setCorrectionText("");
                              }}
                              className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Flag className="w-3 h-3" /> Antwort korrigieren
                            </button>
                          ))}
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading dots */}
              {isLoading && (
                <div className="flex gap-3 animate-fade-in">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(45,155,110,0.25), rgba(45,155,110,0.10))",
                      border: "1px solid rgba(45,155,110,0.30)",
                    }}
                  >
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm px-4 py-3"
                    style={{
                      background: "rgba(13,17,14,0.90)",
                      border: "1px solid rgba(45,107,63,0.30)",
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ── Input Bar ── */}
          <div
            className="px-4 py-3 backdrop-blur-sm flex-shrink-0"
            style={{
              background: "rgba(7,10,8,0.97)",
              borderTop: "1px solid rgba(45,107,63,0.25)",
            }}
          >
            <div className="container max-w-3xl mx-auto flex gap-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isAuthenticated ? "Frage stellen..." : "Bitte anmelden"
                }
                disabled={!isAuthenticated || isLoading}
                className="flex-1 min-h-[44px] max-h-32 resize-none text-sm"
                style={{
                  background: "rgba(13,17,14,0.90)",
                  border: "1px solid rgba(45,107,63,0.30)",
                  color: "rgba(255,255,255,0.88)",
                }}
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
                className="w-11 h-11 flex-shrink-0 press-active btn-glow"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
