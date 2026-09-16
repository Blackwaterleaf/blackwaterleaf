import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { decideApproval, getPendingApprovals, registerPushToken } from "./api";
import { listenForApprovalNotifications, registerForPushNotificationsAsync } from "./push";

const palette = {
  background: "#07100f",
  surface: "#10201c",
  surfaceRaised: "#162a24",
  border: "rgba(156,235,198,.14)",
  text: "#eff8f3",
  muted: "#78958b",
  mint: "#9cebc6",
  amber: "#d8b477",
  violet: "#d1b8ef",
};

type Tab = "workspace" | "tasks" | "approvals" | "activity";
type Task = { id: number; title: string; status: string; goal: string };
type Approval = { id: number; taskId: number; actionType: string; resourceScope: string; riskSummary: string; expiresAt: string };

export default function App() {
  const [tab, setTab] = useState<Tab>("workspace");
  const [pushReady, setPushReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [approvalCount, setApprovalCount] = useState(0);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [tasks] = useState<Task[]>([]);
  const stats = useMemo(() => ({ active: tasks.filter(task => task.status === "running").length, completed: tasks.filter(task => task.status === "succeeded").length }), [tasks]);
  useEffect(() => {
    let mounted = true;
    void registerForPushNotificationsAsync().then(async token => {
      const accessToken = await SecureStore.getItemAsync("studio_access_token");
      if (mounted) setAccessToken(accessToken);
      if (token && accessToken) {
        await registerPushToken(accessToken, token);
        const pending = await getPendingApprovals(accessToken);
        if (mounted) { setApprovals(pending); setApprovalCount(pending.length); }
      }
      if (mounted) setPushReady(Boolean(token && accessToken));
    }).catch(() => { if (mounted) setPushReady(false); });
    const subscription = listenForApprovalNotifications(() => { setApprovalCount(count => count + 1); setTab("approvals"); });
    return () => { mounted = false; subscription.remove(); };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Ionicons name="sparkles" size={15} color={palette.background} /></View>
            <View><Text style={styles.brand}>BlackWaterLeaf <Text style={styles.brandAccent}>Studio</Text></Text><Text style={styles.overline}>ANDROID CLIENT</Text></View>
          </View>
          <View style={styles.online}><View style={styles.dot} /><Text style={styles.onlineText}>CONTROL API</Text></View>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {tab === "workspace" ? <Workspace tasks={tasks} active={stats.active} completed={stats.completed} /> : null}
          {tab === "tasks" ? <Tasks tasks={tasks} /> : null}
          {tab === "approvals" ? <Approvals pushReady={pushReady} approvals={approvals} accessToken={accessToken} onDecision={async (approvalId, decision) => { if (!accessToken) return; await decideApproval(accessToken, approvalId, decision); setApprovals(current => current.filter(approval => approval.id !== approvalId)); setApprovalCount(current => Math.max(0, current - 1)); }} /> : null}
          {tab === "activity" ? <Activity /> : null}
        </ScrollView>
        <View style={styles.tabBar}>
          <TabButton active={tab === "workspace"} label="Arbeitsraum" icon="grid-outline" onPress={() => setTab("workspace")} />
          <TabButton active={tab === "tasks"} label="Aufträge" icon="layers-outline" onPress={() => setTab("tasks")} />
          <TabButton active={tab === "approvals"} label="Freigaben" icon="shield-checkmark-outline" onPress={() => { setApprovalCount(0); setTab("approvals"); }} badge={approvalCount} />
          <TabButton active={tab === "activity"} label="Aktivität" icon="list-outline" onPress={() => setTab("activity")} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Workspace({ tasks, active, completed }: { tasks: Task[]; active: number; completed: number }) {
  return <>
    <View style={styles.hero}><Text style={styles.overlineMint}>CONTROLLED AGENT WORK</Text><Text style={styles.heroTitle}>Vom Ziel zum{"\n"}<Text style={styles.heroAccent}>klaren Ergebnis.</Text></Text><Text style={styles.heroCopy}>Formuliere ein Ziel und verfolge jeden Schritt. Der mobile Client führt selbst keinen Code aus.</Text><Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>Neuen Auftrag anlegen</Text><Ionicons name="arrow-forward" color={palette.background} size={17} /></Pressable></View>
    <View style={styles.metrics}><Metric label="Aktiv" value={active} /><Metric label="Abgeschlossen" value={completed} /><Metric label="Worker" value="—" muted /></View>
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Sicherheitsstatus</Text><Text style={styles.sectionLink}>Live</Text></View>
    <View style={styles.card}><SafetyRow label="Agent Control Plane" value="Verfügbar" good icon="sparkles-outline" /><SafetyRow label="Isolated Worker" value="Nicht konfiguriert" icon="terminal-outline" /><SafetyRow label="Netzwerkzugriff" value="Deaktiviert" good icon="lock-closed-outline" /><SafetyRow label="Datei-Mounts" value="Keine" good icon="document-lock-outline" /></View>
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Letzte Aufträge</Text><Text style={styles.sectionLink}>{tasks.length}</Text></View>
    {tasks.length === 0 ? <Empty icon="layers-outline" title="Noch keine Aufträge" copy="Aufträge aus der Studio-Control-API erscheinen hier mit echtem Status." /> : tasks.map(task => <View style={styles.taskRow} key={task.id}><View style={styles.taskIcon}><Ionicons name="terminal-outline" size={16} color={palette.mint} /></View><View style={styles.taskBody}><Text style={styles.taskTitle}>{task.title}</Text><Text style={styles.taskMeta}>#{task.id} · {task.status}</Text></View></View>)}
  </>;
}

function Tasks({ tasks }: { tasks: Task[] }) { return <><Text style={styles.pageTitle}>Aufträge</Text><Text style={styles.pageCopy}>Serverseitig gespeicherte Studio-Aufträge.</Text>{tasks.length === 0 ? <Empty icon="layers-outline" title="Keine Aufträge vorhanden" copy="Lege einen Auftrag im Web-Arbeitsraum an." /> : tasks.map(task => <View style={styles.card} key={task.id}><Text style={styles.taskTitle}>{task.title}</Text><Text style={styles.taskMeta}>{task.status}</Text></View>)}</>; }
function Activity() { return <><Text style={styles.pageTitle}>Aktivität</Text><Text style={styles.pageCopy}>Audit-Ereignisse werden nur aus der Control-API gelesen.</Text><Empty icon="list-outline" title="Noch keine Aktivität" copy="Echte Workspace- und Agentenereignisse erscheinen nach der ersten Aktion." /></>; }
function Approvals({ pushReady, approvals, accessToken, onDecision }: { pushReady: boolean; approvals: Approval[]; accessToken: string | null; onDecision: (approvalId: number, decision: "approved" | "denied") => Promise<void> }) { return <><Text style={styles.pageTitle}>Freigaben</Text><Text style={styles.pageCopy}>Bestätigungen für riskante Agentenaktionen direkt auf dem Handy.</Text><View style={styles.pushBanner}><Ionicons name={pushReady ? "notifications" : "notifications-off-outline"} size={19} color={pushReady ? palette.mint : palette.amber} /><View style={styles.safetyBody}><Text style={styles.safetyLabel}>{pushReady ? "Push-Benachrichtigungen aktiv" : "Push noch nicht aktiviert"}</Text><Text style={styles.safetyValue}>{pushReady ? "Neue Freigaben öffnen diesen Bereich automatisch." : "Berechtigung und Mobile-OAuth auf einem echten Android-Gerät erforderlich."}</Text></View></View>{approvals.length > 0 ? approvals.map(approval => <View style={styles.card} key={approval.id}><View style={styles.approvalHeader}><Text style={styles.taskTitle}>{approval.actionType}</Text><View style={styles.statusAmber} /></View><Text style={styles.taskMeta}>Task #{approval.taskId} · {approval.resourceScope}</Text><Text style={styles.approvalRisk}>{approval.riskSummary}</Text><View style={styles.decisionRow}><Pressable disabled={!accessToken} onPress={() => void onDecision(approval.id, "denied")} style={({ pressed }) => [styles.denyButton, pressed && styles.pressed]}><Text style={styles.denyText}>Ablehnen</Text></Pressable><Pressable disabled={!accessToken} onPress={() => void onDecision(approval.id, "approved")} style={({ pressed }) => [styles.primaryButton, styles.approvalButton, pressed && styles.pressed]}><Text style={styles.primaryText}>Freigeben</Text><Ionicons name="checkmark" color={palette.background} size={16} /></Pressable></View></View>) : <Empty icon="shield-checkmark-outline" title="Keine offenen Freigaben" copy="Ausstehende Bestätigungen aus deinem Workspace erscheinen hier." />}</>; }
function Metric({ label, value, muted }: { label: string; value: number | string; muted?: boolean }) { return <View style={styles.metric}><Text style={styles.overline}>{label}</Text><Text style={[styles.metricValue, muted && { color: palette.amber }]}>{value}</Text></View>; }
function SafetyRow({ label, value, icon, good }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; good?: boolean }) { return <View style={styles.safetyRow}><View style={styles.safetyIcon}><Ionicons name={icon} size={16} color={palette.muted} /></View><View style={styles.safetyBody}><Text style={styles.safetyLabel}>{label}</Text><Text style={styles.safetyValue}>{value}</Text></View><View style={[styles.status, good ? styles.statusGood : styles.statusNeutral]} /></View>; }
function Empty({ icon, title, copy }: { icon: keyof typeof Ionicons.glyphMap; title: string; copy: string }) { return <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={icon} size={21} color={palette.mint} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyCopy}>{copy}</Text></View>; }
function TabButton({ active, label, icon, onPress, badge }: { active: boolean; label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; badge?: number }) { return <Pressable onPress={onPress} style={styles.tab}><View><Ionicons name={icon} size={20} color={active ? palette.mint : palette.muted} />{badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}</View><Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: palette.border },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: { width: 29, height: 29, borderRadius: 9, backgroundColor: palette.mint, alignItems: "center", justifyContent: "center" },
  brand: { color: palette.text, fontSize: 14, fontWeight: "600" },
  brandAccent: { color: palette.mint },
  overline: { color: palette.muted, fontSize: 9, letterSpacing: 1.4, fontWeight: "700", marginTop: 3 },
  overlineMint: { color: palette.mint, fontSize: 10, letterSpacing: 1.4, fontWeight: "700" },
  online: { flexDirection: "row", gap: 7, alignItems: "center" },
  onlineText: { color: palette.muted, fontSize: 9, letterSpacing: 1, fontWeight: "700" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.mint },
  content: { padding: 20, paddingBottom: 35 },
  hero: { padding: 22, borderRadius: 17, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surfaceRaised, marginBottom: 12 },
  heroTitle: { color: palette.text, fontSize: 33, lineHeight: 34, letterSpacing: -1.6, fontWeight: "600", marginTop: 14 },
  heroAccent: { color: palette.mint },
  heroCopy: { color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 12, marginBottom: 20 },
  primaryButton: { height: 43, paddingHorizontal: 14, borderRadius: 9, backgroundColor: palette.mint, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  primaryText: { color: palette.background, fontSize: 12, fontWeight: "700" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  metrics: { flexDirection: "row", gap: 8, marginBottom: 25 },
  metric: { flex: 1, padding: 13, borderRadius: 12, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface },
  metricValue: { color: palette.text, fontSize: 23, fontWeight: "600", marginTop: 5 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 11, marginTop: 3 },
  sectionTitle: { color: palette.text, fontSize: 16, fontWeight: "600" },
  sectionLink: { color: palette.mint, fontSize: 11 },
  card: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, marginBottom: 22 },
  pushBanner: { flexDirection: "row", alignItems: "center", gap: 11, padding: 14, borderRadius: 13, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, marginBottom: 16 },
  safetyRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(156,235,198,.08)" },
  safetyIcon: { width: 29, height: 29, borderRadius: 8, backgroundColor: "rgba(156,235,198,.07)", alignItems: "center", justifyContent: "center" },
  safetyBody: { flex: 1 },
  safetyLabel: { color: palette.text, fontSize: 12, fontWeight: "500" },
  safetyValue: { color: palette.muted, fontSize: 10, marginTop: 3 },
  status: { width: 7, height: 7, borderRadius: 4 },
  statusGood: { backgroundColor: palette.mint },
  statusNeutral: { backgroundColor: palette.amber },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(156,235,198,.08)" },
  taskIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: "rgba(156,235,198,.08)", alignItems: "center", justifyContent: "center" },
  taskBody: { flex: 1 },
  taskTitle: { color: palette.text, fontSize: 12, fontWeight: "600" },
  taskMeta: { color: palette.muted, fontSize: 10, marginTop: 4 },
  empty: { alignItems: "center", paddingVertical: 46, paddingHorizontal: 20 },
  emptyIcon: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, borderColor: palette.border, backgroundColor: "rgba(156,235,198,.07)", alignItems: "center", justifyContent: "center", marginBottom: 13 },
  emptyTitle: { color: palette.text, fontSize: 14, fontWeight: "600" },
  emptyCopy: { color: palette.muted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 7 },
  pageTitle: { color: palette.text, fontSize: 30, fontWeight: "600", letterSpacing: -1.3, marginTop: 8 },
  pageCopy: { color: palette.muted, fontSize: 12, marginTop: 7, marginBottom: 24 },
  tabBar: { flexDirection: "row", paddingTop: 10, paddingBottom: 10, borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: "#091512" },
  tab: { flex: 1, alignItems: "center", gap: 4 },
  tabLabel: { color: palette.muted, fontSize: 10 },
  tabLabelActive: { color: palette.mint, fontWeight: "600" },
  badge: { position: "absolute", top: -6, right: -9, minWidth: 15, height: 15, borderRadius: 8, backgroundColor: palette.amber, alignItems: "center", justifyContent: "center" },
  badgeText: { color: palette.background, fontSize: 9, fontWeight: "800" },
  approvalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusAmber: { width: 7, height: 7, borderRadius: 4, backgroundColor: palette.amber },
  approvalRisk: { color: palette.violet, fontSize: 11, lineHeight: 17, marginTop: 9 },
  approvalButton: { marginTop: 15, height: 38 },
  decisionRow: { flexDirection: "row", gap: 8, marginTop: 15 },
  denyButton: { flex: 1, height: 38, borderRadius: 9, borderWidth: 1, borderColor: "rgba(251,113,133,.35)", alignItems: "center", justifyContent: "center" },
  denyText: { color: "#ffabb6", fontSize: 12, fontWeight: "700" },
});
