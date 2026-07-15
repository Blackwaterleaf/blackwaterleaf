import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, XCircle, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiIdentificationReview() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");

  // Nur Moderatoren und Admins dürfen hier rein
  if (!user || (user.role !== "moderator" && user.role !== "admin")) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        <div className="rounded-2xl p-6 text-center" style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#D4AF37" }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: "rgba(255,255,255,0.88)" }}>Zugriff verweigert</h2>
          <p style={{ color: "rgba(255,255,255,0.55)" }}>Nur Moderatoren und Admins können Bestimmungen bestätigen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-brand text-3xl mb-2" style={{ color: "rgba(255,255,255,0.90)" }}>KI-Bestimmungs-Review</h1>
        <p style={{ color: "rgba(255,255,255,0.55)" }}>Bestätige oder lehne KI-Pflanzenbestimmungen ab</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3" style={{ background: "#111614", border: "1px solid rgba(45,107,63,0.30)" }}>
          <TabsTrigger value="pending" style={{ color: "rgba(255,255,255,0.55)" }}>Ausstehend</TabsTrigger>
          <TabsTrigger value="approved" style={{ color: "rgba(255,255,255,0.55)" }}>Bestätigt</TabsTrigger>
          <TabsTrigger value="rejected" style={{ color: "rgba(255,255,255,0.55)" }}>Abgelehnt</TabsTrigger>
        </TabsList>

        {/* Ausstehend */}
        <TabsContent value="pending" className="mt-6">
          <PendingIdentificationsTab />
        </TabsContent>

        {/* Bestätigt */}
        <TabsContent value="approved" className="mt-6">
          <ApprovedIdentificationsTab />
        </TabsContent>

        {/* Abgelehnt */}
        <TabsContent value="rejected" className="mt-6">
          <RejectedIdentificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PendingIdentificationsTab() {
  const { data: corrections, isLoading } = trpc.ai.getPendingCorrections.useQuery();
  const utils = trpc.useUtils();

  const approveMutation = trpc.ai.approveCorrection.useMutation({
    onSuccess: () => {
      utils.ai.getPendingCorrections.invalidate();
      utils.ai.getApprovedCorrections.invalidate();
      toast.success("Bestimmung bestätigt ✓");
    },
    onError: (e: any) => toast.error(e.message || "Fehler"),
  });

  const rejectMutation = trpc.ai.rejectCorrection.useMutation({
    onSuccess: () => {
      utils.ai.getPendingCorrections.invalidate();
      utils.ai.getRejectedCorrections.invalidate();
      toast.success("Bestimmung abgelehnt");
    },
    onError: (e: any) => toast.error(e.message || "Fehler"),
  });

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}</div>;
  }

  if (!corrections || corrections.length === 0) {
    return (
      <Card style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }} className="p-6 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#2D9B6E" }} />
        <p style={{ color: "rgba(255,255,255,0.55)" }}>Keine ausstehenden Bestimmungen. Alles ist aktuell! ✨</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {corrections.map((correction: any) => (
        <Card key={correction.id} style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }} className="p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.88)" }}>
              {correction.topic}
            </p>
            {correction.originalAnswer && (
              <div className="mb-3 p-3 rounded" style={{ background: "#111614" }}>
                <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>KI-Original:</p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.70)" }}>{correction.originalAnswer}</p>
              </div>
            )}
            <div className="p-3 rounded" style={{ background: "rgba(45,155,110,0.10)", border: "1px solid rgba(45,155,110,0.30)" }}>
              <p className="text-xs mb-1" style={{ color: "#2D9B6E" }}>Korrigiert zu:</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.88)" }}>{correction.correctedText}</p>
            </div>
            <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
              Von: {correction.userName} • {new Date(correction.createdAt).toLocaleDateString("de-DE")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate({ correctionId: correction.id })}
              style={{ color: "#2D9B6E" }}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Bestätigen
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate({ correctionId: correction.id })}
              style={{ color: "#D4AF37" }}
            >
              <XCircle className="w-4 h-4 mr-1" /> Ablehnen
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ApprovedIdentificationsTab() {
  const { data: corrections, isLoading } = trpc.ai.getApprovedCorrections.useQuery();

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>;
  }

  if (!corrections || corrections.length === 0) {
    return (
      <Card style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }} className="p-6 text-center">
        <p style={{ color: "rgba(255,255,255,0.55)" }}>Keine bestätigten Bestimmungen vorhanden</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {corrections.map((correction: any) => (
        <Card key={correction.id} style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>{correction.topic}</p>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.70)" }}>{correction.correctedText}</p>
              <div className="flex items-center gap-2 mt-2">
                <ThumbsUp className="w-4 h-4" style={{ color: "#2D9B6E" }} />
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{correction.upvotes} Upvotes</p>
              </div>
            </div>
            <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: "#2D9B6E" }} />
          </div>
        </Card>
      ))}
    </div>
  );
}

function RejectedIdentificationsTab() {
  const { data: corrections, isLoading } = trpc.ai.getRejectedCorrections.useQuery();

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>;
  }

  if (!corrections || corrections.length === 0) {
    return (
      <Card style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }} className="p-6 text-center">
        <p style={{ color: "rgba(255,255,255,0.55)" }}>Keine abgelehnten Bestimmungen vorhanden</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {corrections.map((correction: any) => (
        <Card key={correction.id} style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>{correction.topic}</p>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.70)" }}>{correction.correctedText}</p>
            </div>
            <XCircle className="w-6 h-6 flex-shrink-0" style={{ color: "#D4AF37" }} />
          </div>
        </Card>
      ))}
    </div>
  );
}
