import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Users, BarChart3, LogOut, Shield, Ban, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPanel() {
  const { user } = useAuth();

  // Nur Admin darf hier rein
  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-8">
        <div className="rounded-2xl p-6 text-center" style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
          <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "oklch(0.65 0.16 40)" }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: "oklch(0.88 0.005 200)" }}>Zugriff verweigert</h2>
          <p style={{ color: "oklch(0.55 0.008 200)" }}>Nur Admins können diesen Bereich sehen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-brand text-3xl mb-2" style={{ color: "oklch(0.90 0.005 200)" }}>Admin-Panel</h1>
        <p style={{ color: "oklch(0.55 0.008 200)" }}>Verwalte Nutzer, Moderatoren und überwache die Plattform</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3" style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
          <TabsTrigger value="stats" style={{ color: "oklch(0.55 0.008 200)" }}>Statistiken</TabsTrigger>
          <TabsTrigger value="users" style={{ color: "oklch(0.55 0.008 200)" }}>Nutzer</TabsTrigger>
          <TabsTrigger value="audit" style={{ color: "oklch(0.55 0.008 200)" }}>Audit-Log</TabsTrigger>
        </TabsList>

        {/* Statistiken */}
        <TabsContent value="stats" className="mt-6">
          <StatsTab />
        </TabsContent>

        {/* Nutzer-Verwaltung */}
        <TabsContent value="users" className="mt-6">
          <UsersTab />
        </TabsContent>

        {/* Audit-Log */}
        <TabsContent value="audit" className="mt-6">
          <AuditLogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsTab() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  if (isLoading) {
    return <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24" />)}</div>;
  }

  if (!stats) return null;

  const statCards = [
    { label: "Nutzer gesamt", value: stats.users.total },
    { label: "Neu diese Woche", value: stats.users.newThisWeek },
    { label: "Aktiv diesen Monat", value: stats.users.activeThisMonth },
    { label: "Beiträge", value: stats.content.posts },
    { label: "Gemeldete Inhalte", value: stats.moderation.openReports, highlight: stats.moderation.openReports > 0 },
    { label: "Gruppen", value: stats.content.groups },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {statCards.map((stat, i) => (
        <Card
          key={i}
          style={{
            background: stat.highlight ? "oklch(0.65 0.16 40 / 0.1)" : "oklch(0.12 0.008 200)",
            border: stat.highlight ? "1px solid oklch(0.65 0.16 40 / 0.3)" : "1px solid oklch(0.20 0.008 200)",
          }}
          className="p-4 text-center"
        >
          <p style={{ color: "oklch(0.55 0.008 200)" }} className="text-sm mb-2">{stat.label}</p>
          <p className="text-3xl font-bold" style={{ color: stat.highlight ? "oklch(0.65 0.16 40)" : "oklch(0.88 0.005 200)" }}>
            {stat.value}
          </p>
        </Card>
      ))}
    </div>
  );
}

function UsersTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: users, isLoading } = trpc.admin.users.useQuery({ query: searchQuery || undefined });
  const utils = trpc.useUtils();

  const setRoleMutation = trpc.admin.setRole.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
      toast.success("Rolle aktualisiert");
    },
    onError: (e: any) => toast.error(e.message || "Fehler"),
  });

  const setStatusMutation = trpc.admin.setStatus.useMutation({
    onSuccess: () => {
      utils.admin.users.invalidate();
      toast.success("Status aktualisiert");
    },
    onError: (e: any) => toast.error(e.message || "Fehler"),
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Nach Name, Username oder E-Mail suchen..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.20 0.008 200)", color: "oklch(0.88 0.005 200)" }}
      />

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : !users || users.length === 0 ? (
        <Card style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-6 text-center">
          <p style={{ color: "oklch(0.55 0.008 200)" }}>Keine Nutzer gefunden</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((u: any) => (
            <Card key={u.id} style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold" style={{ color: "oklch(0.88 0.005 200)" }}>{u.name}</p>
                  <p className="text-sm" style={{ color: "oklch(0.55 0.008 200)" }}>@{u.username} • {u.email}</p>
                  <p className="text-xs mt-1" style={{ color: "oklch(0.48 0.008 200)" }}>Beigetreten: {new Date(u.createdAt).toLocaleDateString("de-DE")}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {/* Rolle */}
                  <Select
                    value={u.role}
                    onValueChange={(role) => setRoleMutation.mutate({ userId: u.id, role: role as any })}
                  >
                    <SelectTrigger style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.20 0.008 200)", color: "oklch(0.88 0.005 200)" }} className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
                      <SelectItem value="user">Nutzer</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Status */}
                  <Select
                    value={u.status}
                    onValueChange={(status) => setStatusMutation.mutate({ userId: u.id, status: status as any })}
                  >
                    <SelectTrigger style={{ background: "oklch(0.14 0.008 200)", border: "1px solid oklch(0.20 0.008 200)", color: "oklch(0.88 0.005 200)" }} className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }}>
                      <SelectItem value="active">Aktiv</SelectItem>
                      <SelectItem value="suspended">Eingeschränkt</SelectItem>
                      <SelectItem value="banned">Gesperrt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AuditLogTab() {
  const { data: logs, isLoading } = trpc.moderation.auditLog.useQuery({});

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16" />)}</div>;
  }

  if (!logs || logs.length === 0) {
    return (
      <Card style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-6 text-center">
        <p style={{ color: "oklch(0.55 0.008 200)" }}>Keine Audit-Einträge vorhanden</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log: any) => (
        <Card key={log.id} style={{ background: "oklch(0.12 0.008 200)", border: "1px solid oklch(0.20 0.008 200)" }} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: "oklch(0.88 0.005 200)" }}>
                {log.actorName} • {log.action}
              </p>
              <p className="text-sm" style={{ color: "oklch(0.55 0.008 200)" }}>
                {log.targetType} #{log.targetId}
              </p>
              {log.note && <p className="text-xs mt-1" style={{ color: "oklch(0.48 0.008 200)" }}>{log.note}</p>}
              <p className="text-xs mt-1" style={{ color: "oklch(0.48 0.008 200)" }}>
                {new Date(log.createdAt).toLocaleString("de-DE")}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
