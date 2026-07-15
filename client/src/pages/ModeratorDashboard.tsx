import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ModeratorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("reported-posts");

  // Nur Moderatoren und Admins dürfen hier rein
  if (!user || (user.role !== "moderator" && user.role !== "admin")) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        <div className="rounded-2xl p-6 text-center" style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#D4AF37" }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: "rgba(255,255,255,0.88)" }}>Zugriff verweigert</h2>
          <p style={{ color: "rgba(255,255,255,0.55)" }}>Nur Moderatoren und Admins können diesen Bereich sehen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-brand text-3xl mb-2" style={{ color: "rgba(255,255,255,0.90)" }}>Moderatoren-Dashboard</h1>
        <p style={{ color: "rgba(255,255,255,0.55)" }}>Verwalte gemeldete Inhalte und bestätige KI-Bestimmungen</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2" style={{ background: "#111614", border: "1px solid rgba(45,107,63,0.30)" }}>
          <TabsTrigger value="reported-posts" style={{ color: "rgba(255,255,255,0.55)" }}>Gemeldete Beiträge</TabsTrigger>
          <TabsTrigger value="ai-identifications" style={{ color: "rgba(255,255,255,0.55)" }}>KI-Bestimmungen</TabsTrigger>
        </TabsList>

        {/* Gemeldete Beiträge */}
        <TabsContent value="reported-posts" className="mt-6">
          <ReportedPostsTab />
        </TabsContent>

        {/* KI-Bestimmungen */}
        <TabsContent value="ai-identifications" className="mt-6">
          <AiIdentificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportedPostsTab() {
  const { data: reportedPosts, isLoading } = trpc.moderation.queue.useQuery({ status: "open" });
  const utils = trpc.useUtils();

  const resolveMutation = trpc.moderation.resolve.useMutation({
    onSuccess: () => {
      utils.moderation.queue.invalidate();
      toast.success("Meldung bearbeitet");
    },
    onError: (e: any) => toast.error(e.message || "Fehler"),
  });

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>;
  }

  if (!reportedPosts || (Array.isArray(reportedPosts) && reportedPosts.length === 0)) {
    return (
      <Card style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }} className="p-6 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#2D9B6E" }} />
        <p style={{ color: "rgba(255,255,255,0.55)" }}>Keine gemeldeten Beiträge. Alles ist sauber! ✨</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Array.isArray(reportedPosts) && reportedPosts.map((report: any) => (
        <Card key={report.id} style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }} className="p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.88)" }}>Grund: {report.reason}</p>
            <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>{report.post?.content}</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={resolveMutation.isPending}
              onClick={() => resolveMutation.mutate({ reportId: report.id, status: "dismissed" })}
              style={{ color: "#2D9B6E" }}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Genehmigen
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={resolveMutation.isPending}
              onClick={() => resolveMutation.mutate({ reportId: report.id, status: "resolved", action: "delete_content" })}
              style={{ color: "#D4AF37" }}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Löschen
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function AiIdentificationsTab() {
  // Placeholder: KI-Bestimmungen werden später implementiert
  const pendingIds: any[] = [];
  const isLoading = false;

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>;
  }

  if (!pendingIds || (Array.isArray(pendingIds) && pendingIds.length === 0)) {
    return (
      <Card style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }} className="p-6 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#2D9B6E" }} />
        <p style={{ color: "rgba(255,255,255,0.55)" }}>Keine ausstehenden Bestimmungen. Alles ist aktuell! ✨</p>
      </Card>
    );
  }

  return (
    <Card style={{ background: "#0D110E", border: "1px solid rgba(45,107,63,0.30)" }} className="p-6 text-center">
      <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.55)" }} />
      <p style={{ color: "rgba(255,255,255,0.55)" }}>KI-Bestimmungs-Review wird in Kürze implementiert.</p>
    </Card>
  );
}
