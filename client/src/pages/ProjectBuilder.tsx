import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Code2, FileCode2, GitBranch, Globe2, Layers3, Loader2, Plus, Rocket, Smartphone, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProjectBuilder() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [target, setTarget] = useState<"web" | "web_native">("web");
  const [brief, setBrief] = useState("");
  const [targetUsers, setTargetUsers] = useState("");
  const [platforms, setPlatforms] = useState("Web");
  const [dataSensitivity, setDataSensitivity] = useState<"public" | "internal" | "confidential" | "regulated">("internal");
  const [integrations, setIntegrations] = useState("");
  const [deliveryScope, setDeliveryScope] = useState("");
  const [budget, setBudget] = useState("20");
  const [filePath, setFilePath] = useState("README.md");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("# Neues Studio-Projekt\n\nDieses Projekt wird über einen kontrollierten Draft-Workflow aufgebaut.\n");
  const [patchSummary, setPatchSummary] = useState("");
  const [patchBody, setPatchBody] = useState("");

  const projects = trpc.studio.projects.useQuery();
  const project = trpc.studio.projectWorkspace.useQuery({ projectId: selectedProjectId ?? 0 }, { enabled: selectedProjectId !== null });
  const selectedFile = trpc.studio.readProjectFile.useQuery({ projectId: selectedProjectId ?? 0, path: selectedFilePath ?? "" }, { enabled: selectedProjectId !== null && selectedFilePath !== null });
  const createProject = trpc.studio.createProject.useMutation({
    onSuccess: result => { setSelectedProjectId(result.id); projects.refetch(); toast.success("Projektprofil angelegt"); },
    onError: error => toast.error(error.message),
  });
  const saveFile = trpc.studio.saveProjectFile.useMutation({
    onSuccess: () => { project.refetch(); toast.success("Datei als neue Version gespeichert"); },
    onError: error => toast.error(error.message),
  });
  const createPatch = trpc.studio.createDraftPatch.useMutation({
    onSuccess: () => { project.refetch(); setPatchSummary(""); setPatchBody(""); toast.success("Draft-Patch zur Prüfung angelegt"); },
    onError: error => toast.error(error.message),
  });
  const requestPreview = trpc.studio.requestPreview.useMutation({
    onSuccess: () => { project.refetch(); toast.success("Preview-Gate angelegt; Execution bleibt bis zur Sandbox-Abnahme blockiert"); },
    onError: error => toast.error(error.message),
  });
  const decideEnvironmentApproval = trpc.studio.decideEnvironmentApproval.useMutation({ onSuccess: () => { project.refetch(); toast.success("Preview-Freigabe aktualisiert"); }, onError: error => toast.error(error.message) });
  const promoteProjectToStaging = trpc.studio.promoteProjectToStaging.useMutation({ onSuccess: () => { project.refetch(); toast.success("Staging-Anfrage protokolliert"); }, onError: error => toast.error(error.message) });

  useEffect(() => {
    if (!selectedFile.data) return;
    setFilePath(selectedFile.data.path);
    setFileContent(selectedFile.data.content);
  }, [selectedFile.data]);

  const activeProject = project.data?.project;
  return (
    <div className="space-y-5">
      <section className="hero-panel relative overflow-hidden">
        <div className="hero-kicker"><span className="hero-kicker-dot" /> CONTROLLED APP FACTORY</div>
        <h1 className="max-w-3xl">Von der Idee zur <span>versionierten App.</span></h1>
        <p className="max-w-2xl">Wähle das Zielprofil, halte das Briefing fest und arbeite mit überprüfbaren Dateien und Draft-Patches. Die echte Sandbox bleibt bis zur technischen Abnahme deaktiviert.</p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card className="studio-card">
          <CardHeader className="studio-card-head"><div><div className="studio-small-label">PROJEKTPROFILE</div><CardTitle>Neues Projekt</CardTitle></div><Layers3 size={18} className="text-[#7de4bd]" /></CardHeader>
          <CardContent className="space-y-4">
            <Input className="studio-input" value={name} onChange={event => setName(event.target.value)} placeholder="z. B. Kundenportal" />
            <div className="grid grid-cols-2 gap-2">
              <button className={`rounded-xl border p-3 text-left transition ${target === "web" ? "border-[#7de4bd] bg-[#7de4bd]/10" : "border-white/10 bg-white/[0.02]"}`} onClick={() => setTarget("web")}><Globe2 size={17} className="mb-2 text-[#7de4bd]" /><strong className="block text-sm">Web</strong><span className="studio-muted text-xs">Responsive App</span></button>
              <button className={`rounded-xl border p-3 text-left transition ${target === "web_native" ? "border-[#7de4bd] bg-[#7de4bd]/10" : "border-white/10 bg-white/[0.02]"}`} onClick={() => setTarget("web_native")}><Smartphone size={17} className="mb-2 text-[#7de4bd]" /><strong className="block text-sm">Web + Native</strong><span className="studio-muted text-xs">Expo-Profil</span></button>
            </div>
            <Textarea className="studio-input min-h-24" value={brief} onChange={event => setBrief(event.target.value)} placeholder="Produktziel und wichtigste Abläufe …" />
            <Input className="studio-input" value={targetUsers} onChange={event => setTargetUsers(event.target.value)} placeholder="Zielgruppe / Nutzerrollen" />
            <Input className="studio-input" value={platforms} onChange={event => setPlatforms(event.target.value)} placeholder="Plattformen, z. B. Web, Android" />
            <select className="studio-input w-full" value={dataSensitivity} onChange={event => setDataSensitivity(event.target.value as typeof dataSensitivity)}><option value="public">Öffentlich</option><option value="internal">Intern</option><option value="confidential">Vertraulich</option><option value="regulated">Reguliert</option></select>
            <Input className="studio-input" value={integrations} onChange={event => setIntegrations(event.target.value)} placeholder="Integrationen, z. B. Stripe, Google, Slack" />
            <Input className="studio-input" value={deliveryScope} onChange={event => setDeliveryScope(event.target.value)} placeholder="Lieferumfang / Must-have-Funktionen" />
            <Input className="studio-input" type="number" min="0" value={budget} onChange={event => setBudget(event.target.value)} placeholder="Budget in EUR" />
            <Button className="studio-primary-button w-full" disabled={createProject.isPending || name.trim().length < 2 || brief.trim().length < 20 || targetUsers.trim().length < 3 || deliveryScope.trim().length < 3} onClick={() => createProject.mutate({ name, target, brief, targetUsers, platforms, dataSensitivity, integrations, deliveryScope, budgetCents: Math.round(Number(budget || 0) * 100) })}><Plus size={16} />{createProject.isPending ? "Wird angelegt…" : "Projektprofil anlegen"}</Button>
            <div className="studio-auth-note"><Sparkles size={14} /> Das Profil legt die Grenze für Web- und Native-Code fest.</div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="studio-card">
            <CardHeader className="studio-card-head"><div><div className="studio-small-label">DEINE PROJEKTE</div><CardTitle>Code-Arbeitsbereich</CardTitle></div><Code2 size={18} className="text-[#7de4bd]" /></CardHeader>
            <CardContent>
              {(projects.data ?? []).length === 0 ? <div className="studio-empty-state"><FileCode2 size={24} /><p>Noch kein Projektprofil. Lege links Web oder Web + Native fest.</p></div> : <div className="grid gap-3 md:grid-cols-2">{projects.data?.map(item => <button key={item.id} onClick={() => setSelectedProjectId(item.id)} className={`rounded-xl border p-4 text-left transition ${selectedProjectId === item.id ? "border-[#7de4bd] bg-[#7de4bd]/10" : "border-white/10 bg-white/[0.02] hover:border-white/25"}`}><div className="flex items-start justify-between gap-3"><div><strong>{item.name}</strong><div className="studio-muted mt-1 text-xs">{item.target === "web_native" ? "Web + Native" : "Web"} · {item.defaultBranch}</div></div><GitBranch size={16} className="text-white/40" /></div></button>)}</div>}
            </CardContent>
          </Card>

          {activeProject ? <>
            <Card className="studio-card">
              <CardHeader className="studio-card-head"><div><div className="studio-small-label">{activeProject.target === "web_native" ? "WEB + NATIVE" : "WEB"} / {activeProject.slug}</div><CardTitle>{activeProject.name}</CardTitle></div><div className="rounded-full bg-[#7de4bd]/10 px-3 py-1 text-xs text-[#7de4bd]">Branch: {activeProject.defaultBranch}</div></CardHeader>
              <CardContent className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3"><div className="flex items-center gap-2 text-sm font-semibold"><FileCode2 size={16} className="text-[#7de4bd]" /> Dateien / Versionen</div>{(project.data?.files ?? []).length === 0 ? <p className="studio-muted text-sm">Noch keine Dateien. Speichere die erste Projektdatei als kontrollierte Version.</p> : <div className="max-h-40 space-y-2 overflow-auto">{project.data?.files.map(file => <button key={file.id} className="flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-left text-sm hover:border-white/25" onClick={() => { setSelectedFilePath(file.path); setFilePath(file.path); }}><span>{file.path}</span><span className="studio-muted text-xs">v{file.version}</span></button>)}</div>}
                  <Input className="studio-input" value={filePath} onChange={event => setFilePath(event.target.value)} placeholder="src/App.tsx" /><Textarea className="studio-input min-h-36 font-mono text-xs" value={fileContent} onChange={event => setFileContent(event.target.value)} /><Button variant="outline" disabled={saveFile.isPending} onClick={() => saveFile.mutate({ projectId: activeProject.id, path: filePath, content: fileContent })}><CheckCircle2 size={15} /> Datei-Version speichern</Button></div>
                <div className="space-y-3"><div className="flex items-center gap-2 text-sm font-semibold"><GitBranch size={16} className="text-[#7de4bd]" /> Draft-Patch / Preview</div><Input className="studio-input" value={patchSummary} onChange={event => setPatchSummary(event.target.value)} placeholder="z. B. Startseite mit Login ergänzen" /><Textarea className="studio-input min-h-28 font-mono text-xs" value={patchBody} onChange={event => setPatchBody(event.target.value)} placeholder="diff --git …" /><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={createPatch.isPending || patchBody.length < 1} onClick={() => createPatch.mutate({ projectId: activeProject.id, summary: patchSummary || "Unbenannter Draft-Patch", patch: patchBody })}>Draft-Patch anlegen</Button><Button className="studio-primary-button" disabled={requestPreview.isPending} onClick={() => requestPreview.mutate({ projectId: activeProject.id })}><Rocket size={15} /> Preview-Gate anfordern</Button></div><div className="rounded-xl border border-[#d9b36c]/25 bg-[#d9b36c]/[0.06] p-3 text-xs text-[#e8d19b]">Preview wird als kontrolliertes Gate protokolliert. Ohne isolierten Worker entsteht noch keine laufende App.</div></div>
              </CardContent>
            </Card>
            <div className="grid gap-5 md:grid-cols-2">{(project.data?.environments ?? []).map(environment => <Card className="studio-card" key={environment.id}><CardContent className="flex items-center justify-between gap-3 p-5"><div><div className="studio-small-label">{environment.environment.toUpperCase()}</div><div className="mt-1 font-semibold">{environment.status === "not_ready" ? "Noch nicht bereit" : environment.status === "awaiting_approval" ? "Freigabe erforderlich" : environment.status === "blocked" ? "Durch Sandbox-Gate blockiert" : environment.status}</div><div className="studio-muted mt-1 text-xs">{environment.buildSha ?? "Kein Build-Artefakt"}</div></div><div className="flex items-center gap-2">{environment.environment === "preview" && project.data?.environmentApproval?.status === "pending" ? <><Button size="sm" variant="outline" disabled={decideEnvironmentApproval.isPending} onClick={() => decideEnvironmentApproval.mutate({ approvalId: project.data!.environmentApproval!.id, projectId: activeProject.id, decision: "denied", reason: "Manuell abgelehnt" })}>Ablehnen</Button><Button size="sm" className="studio-primary-button" disabled={decideEnvironmentApproval.isPending} onClick={() => decideEnvironmentApproval.mutate({ approvalId: project.data!.environmentApproval!.id, projectId: activeProject.id, decision: "approved" })}>Freigeben</Button></> : environment.environment === "preview" && project.data?.environmentApproval?.status === "approved" ? <Button size="sm" variant="outline" disabled={promoteProjectToStaging.isPending} onClick={() => promoteProjectToStaging.mutate({ projectId: activeProject.id })}>Staging anfordern</Button> : environment.environment === "preview" ? <Loader2 size={18} className={environment.status === "awaiting_approval" ? "animate-spin text-[#d9b36c]" : "text-white/30"} /> : <LockIcon />}</div></CardContent></Card>)}</div>
          </> : <div className="studio-empty-state min-h-48"><Layers3 size={28} /><p>Wähle ein Projektprofil aus, um Dateien und kontrollierte Preview-Gates zu verwalten.</p></div>}
        </div>
      </div>
    </div>
  );
}

function LockIcon() { return <div className="rounded-full bg-white/5 p-2 text-white/35"><Rocket size={15} /></div>; }
