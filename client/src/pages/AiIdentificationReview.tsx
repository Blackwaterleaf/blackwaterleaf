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
        <div className="rounded-2xl p-6 text-center" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.65 0.16 40)" }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: "oklch(0.88 0.005 200)" }}>Zugriff verweigert</h2>
          <p style={{ color: "oklch(0.55 0.008 200)" }}>Nur Moderatoren und Admins können Bestimmungen bestätigen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-brand text-3xl mb-2" style={{ color: "oklch(0.90 0.005 200)" }}>KI-Bestimmungs-Review</h1>
        <p style={{ color: "oklch(0.55 0.008 200)" }}>Bestätige oder lehne KI-Pflanzenbestimmungen ab</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3" style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
          <TabsTrigger value="pending" style={{ color: "oklch(0.55 0.008 200)" }}>Ausstehend</TabsTrigger>
          <TabsTrigger value="approved" style={{ color: "oklch(0.55 0.008 200)" }}>Bestätigt</TabsTrigger>
          <TabsTrigger value="rejected" style={{ color: "oklch(0.55 0.008 200)" }}>Abgelehnt</TabsTrigger>
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
      <Card style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-6 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.52 0.14 148)" }} />
        <p style={{ color: "oklch(0.55 0.008 200)" }}>Keine ausstehenden Bestimmungen. Alles ist aktuell! ✨</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {corrections.map((correction: any) => (
        <Card key={correction.id} style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold mb-2" style={{ color: "oklch(0.88 0.005 200)" }}>
              {correction.topic}
            </p>
            {correction.originalAnswer && (
              <div className="mb-3 p-3 rounded" style={{ background: "oklch(0.14 0.008 200)" }}>
                <p className="text-xs mb-1" style={{ color: "oklch(0.48 0.008 200)" }}>KI-Original:</p>
                <p className="text-sm" style={{ color: "oklch(0.70 0.008 200)" }}>{correction.originalAnswer}</p>
              </div>
            )}
            <div className="p-3 rounded" style={{ background: "oklch(0.52 0.14 148 / 0.1)", border: "1px solid oklch(0.52 0.14 148 / 0.3)" }}>
              <p className="text-xs mb-1" style={{ color: "oklch(0.52 0.14 148)" }}>Korrigiert zu:</p>
              <p className="text-sm" style={{ color: "oklch(0.88 0.005 200)" }}>{correction.correctedText}</p>
            </div>
            <p className="text-xs mt-2" style={{ color: "oklch(0.48 0.008 200)" }}>
              Von: {correction.userName} • {new Date(correction.createdAt).toLocaleDateString("de-DE")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate({ correctionId: correction.id })}
              style={{ color: "oklch(0.52 0.14 148)" }}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Bestätigen
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={rejectMutation.isPending}
              onClick={() => rejectMutation.mutate({ correctionId: correction.id })}
              style={{ color: "oklch(0.65 0.16 40)" }}
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
      <Card style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-6 text-center">
        <p style={{ color: "oklch(0.55 0.008 200)" }}>Keine bestätigten Bestimmungen vorhanden</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {corrections.map((correction: any) => (
        <Card key={correction.id} style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: "oklch(0.88 0.005 200)" }}>{correction.topic}</p>
              <p className="text-sm mt-1" style={{ color: "oklch(0.70 0.008 200)" }}>{correction.correctedText}</p>
              <div className="flex items-center gap-2 mt-2">
                <ThumbsUp className="w-4 h-4" style={{ color: "oklch(0.52 0.14 148)" }} />
                <p className="text-xs" style={{ color: "oklch(0.48 0.008 200)" }}>{correction.upvotes} Upvotes</p>
              </div>
            </div>
            <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: "oklch(0.52 0.14 148)" }} />
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
      <Card style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-6 text-center">
        <p style={{ color: "oklch(0.55 0.008 200)" }}>Keine abgelehnten Bestimmungen vorhanden</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {corrections.map((correction: any) => (
        <Card key={correction.id} style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: "oklch(0.88 0.005 200)" }}>{correction.topic}</p>
              <p className="text-sm mt-1" style={{ color: "oklch(0.70 0.008 200)" }}>{correction.correctedText}</p>
            </div>
            <XCircle className="w-6 h-6 flex-shrink-0" style={{ color: "oklch(0.65 0.16 40)" }} />
          </div>
        </Card>
      ))}
    </div>
  );
}
