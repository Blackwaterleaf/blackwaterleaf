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
        <div className="rounded-2xl p-6 text-center" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.65 0.16 40)" }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: "oklch(0.88 0.005 200)" }}>Zugriff verweigert</h2>
          <p style={{ color: "oklch(0.55 0.008 200)" }}>Nur Moderatoren und Admins können diesen Bereich sehen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-brand text-3xl mb-2" style={{ color: "oklch(0.90 0.005 200)" }}>Moderatoren-Dashboard</h1>
        <p style={{ color: "oklch(0.55 0.008 200)" }}>Verwalte gemeldete Inhalte und bestätige KI-Bestimmungen</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2" style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
          <TabsTrigger value="reported-posts" style={{ color: "oklch(0.55 0.008 200)" }}>Gemeldete Beiträge</TabsTrigger>
          <TabsTrigger value="ai-identifications" style={{ color: "oklch(0.55 0.008 200)" }}>KI-Bestimmungen</TabsTrigger>
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
      <Card style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-6 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.52 0.14 148)" }} />
        <p style={{ color: "oklch(0.55 0.008 200)" }}>Keine gemeldeten Beiträge. Alles ist sauber! ✨</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Array.isArray(reportedPosts) && reportedPosts.map((report: any) => (
        <Card key={report.id} style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-4">
          <div className="mb-4">
            <p className="text-sm font-semibold" style={{ color: "oklch(0.88 0.005 200)" }}>Grund: {report.reason}</p>
            <p className="text-sm mt-2" style={{ color: "oklch(0.55 0.008 200)" }}>{report.post?.content}</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={resolveMutation.isPending}
              onClick={() => resolveMutation.mutate({ reportId: report.id, status: "dismissed" })}
              style={{ color: "oklch(0.52 0.14 148)" }}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Genehmigen
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={resolveMutation.isPending}
              onClick={() => resolveMutation.mutate({ reportId: report.id, status: "resolved", action: "delete_content" })}
              style={{ color: "oklch(0.65 0.16 40)" }}
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
      <Card style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-6 text-center">
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.52 0.14 148)" }} />
        <p style={{ color: "oklch(0.55 0.008 200)" }}>Keine ausstehenden Bestimmungen. Alles ist aktuell! ✨</p>
      </Card>
    );
  }

  return (
    <Card style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-6 text-center">
      <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.55 0.008 200)" }} />
      <p style={{ color: "oklch(0.55 0.008 200)" }}>KI-Bestimmungs-Review wird in Kürze implementiert.</p>
    </Card>
  );
}
