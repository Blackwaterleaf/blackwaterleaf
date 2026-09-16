import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import type { SmartDeviceSelectionInput } from "@shared/blackwaterleaf-contract-v1";
import { Cable, CheckCircle2, Droplets, HousePlug, Link2, LoaderCircle, RadioTower, Sparkles, TestTube2, Trash2, Waves } from "lucide-react";
import { useMemo, useState } from "react";

const PROVIDERS = [
  { id: "home_assistant", title: "Home Assistant", description: "Zentrale für vorhandene Sensoren und Automationen", icon: HousePlug },
  { id: "aquarium_controller", title: "Aquarium-Controller", description: "Herstellergerät für Temperatur, Licht oder Wasserpflege", icon: Waves },
  { id: "water_monitor", title: "Wasser-Messgerät", description: "pH-, Leitwert- oder Mehrparameter-Monitor", icon: TestTube2 },
  { id: "zigbee_matter", title: "Zigbee / Matter", description: "Kompatibler Sensor über einen Hub", icon: RadioTower },
  { id: "other", title: "Anderes Smart-Gerät", description: "Gerät auswählen und Modell später konkretisieren", icon: Cable },
] as const;

const METRICS = [
  { id: "temperatureC", label: "Wassertemperatur", icon: Waves },
  { id: "ph", label: "pH-Wert", icon: TestTube2 },
  { id: "gh", label: "Gesamthärte (GH)", icon: Droplets },
  { id: "kh", label: "Karbonathärte (KH)", icon: Droplets },
  { id: "nitriteMgL", label: "Nitrit", icon: TestTube2 },
  { id: "nitrateMgL", label: "Nitrat", icon: TestTube2 },
  { id: "conductivityUs", label: "Leitwert", icon: Sparkles },
] as const;

type Provider = SmartDeviceSelectionInput["provider"];
type Metric = SmartDeviceSelectionInput["requestedMetrics"][number];
type Aquarium = { id: string; name: string; kind: "aquarium" | "plant" | "terrarium" };

export function SmartDeviceDialog() {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<Provider>("home_assistant");
  const [habitatId, setHabitatId] = useState<string>("");
  const [modelLabel, setModelLabel] = useState("");
  const [metrics, setMetrics] = useState<Metric[]>(["temperatureC", "ph"]);
  const [status, setStatus] = useState<string | null>(null);
  const habitats = trpc.habitats.mine.useQuery(undefined, { enabled: open, retry: false });
  const connections = trpc.smartDevices.mine.useQuery(undefined, { enabled: open, retry: false });
  const selectDevice = trpc.smartDevices.select.useMutation();
  const removeDevice = trpc.smartDevices.remove.useMutation();

  const aquariums = useMemo(() => ((habitats.data ?? []) as Aquarium[]).filter(habitat => habitat.kind === "aquarium"), [habitats.data]);

  const toggleMetric = (metric: Metric) => {
    setMetrics(current => current.includes(metric)
      ? current.length === 1 ? current : current.filter(value => value !== metric)
      : [...current, metric]);
  };

  const saveSelection = async () => {
    setStatus(null);
    try {
      await selectDevice.mutateAsync({
        provider,
        habitatId: habitatId ? Number(habitatId) : null,
        modelLabel: modelLabel.trim() || null,
        requestedMetrics: metrics,
      });
      await utils.smartDevices.mine.invalidate();
      setStatus("Geräteauswahl privat gespeichert. Eine echte Herstellerfreigabe folgt erst beim Verbinden.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Geräteauswahl konnte nicht gespeichert werden.");
    }
  };

  const discardConnection = async (id: string) => {
    setStatus(null);
    try {
      await removeDevice.mutateAsync({ id: Number(id) });
      await utils.smartDevices.mine.invalidate();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Geräteauswahl konnte nicht entfernt werden.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="smart-device-trigger"><Link2 size={16} />Smart-Gerät verbinden</button>
      </DialogTrigger>
      <DialogContent className="smart-device-dialog" showCloseButton>
        <DialogHeader className="smart-device-dialog-head">
          <span className="eyebrow"><Cable size={13} /> WERTE SYNCHRONISIEREN</span>
          <DialogTitle>Smart-Gerät auswählen</DialogTitle>
          <DialogDescription>Wähle jetzt die Geräteart und die gewünschten Werte. Die Auswahl bleibt privat. Zugangsdaten oder eine Verbindung werden in diesem Schritt nicht angefragt.</DialogDescription>
        </DialogHeader>

        <div className="smart-device-scroll">
          <section className="smart-device-section" aria-labelledby="device-type-heading">
            <div className="smart-device-section-title"><span id="device-type-heading">1 · Geräteart</span><small>Herstellerverbindung folgt später</small></div>
            <div className="smart-provider-grid">
              {PROVIDERS.map(option => {
                const Icon = option.icon;
                return <button type="button" key={option.id} className={`smart-provider-option ${provider === option.id ? "is-selected" : ""}`} onClick={() => setProvider(option.id)} aria-pressed={provider === option.id}><Icon size={18} /><span><strong>{option.title}</strong><small>{option.description}</small></span><CheckCircle2 size={16} /></button>;
              })}
            </div>
          </section>

          <section className="smart-device-section" aria-labelledby="target-aquarium-heading">
            <div className="smart-device-section-title"><span id="target-aquarium-heading">2 · Zielaquarium</span><small>Optional, jederzeit änderbar</small></div>
            <label className="field smart-device-field"><span>Messwerte diesem Aquarium zuordnen</span><select value={habitatId} onChange={event => setHabitatId(event.target.value)}><option value="">Später auswählen</option>{aquariums.map(aquarium => <option key={aquarium.id} value={aquarium.id}>{aquarium.name}</option>)}</select></label>
            {habitats.isLoading ? <p className="smart-device-hint"><LoaderCircle size={14} className="spin" />Aquarien werden geladen …</p> : aquariums.length === 0 ? <p className="smart-device-hint">Noch kein Aquarium vorhanden. Du kannst die Geräteart jetzt speichern und das Aquarium später im Profil zuordnen.</p> : null}
            <label className="field smart-device-field"><span>Hersteller oder Modell <em>optional</em></span><input value={modelLabel} maxLength={128} placeholder="z. B. Markenname oder Modell" onChange={event => setModelLabel(event.target.value)} /></label>
          </section>

          <section className="smart-device-section" aria-labelledby="metric-heading">
            <div className="smart-device-section-title"><span id="metric-heading">3 · Werte auswählen</span><small>{metrics.length} ausgewählt</small></div>
            <div className="smart-metric-list">{METRICS.map(metric => { const Icon = metric.icon; const selected = metrics.includes(metric.id); return <label key={metric.id} className={`smart-metric-option ${selected ? "is-selected" : ""}`}><input type="checkbox" checked={selected} onChange={() => toggleMetric(metric.id)} /><Icon size={16} /><span>{metric.label}</span><i /></label>; })}</div>
          </section>

          <aside className="smart-device-notice"><Sparkles size={17} /><p><strong>Noch nicht verbunden.</strong> Erst eine später ergänzte Herstellerfreigabe darf Daten abrufen und deine manuellen Werte automatisch aktualisieren.</p></aside>
          {status ? <p className="form-status smart-device-status" role="status">{status}</p> : null}
          <button type="button" className="primary-action smart-device-save" disabled={selectDevice.isPending || metrics.length === 0} onClick={() => void saveSelection()}>{selectDevice.isPending ? <><LoaderCircle size={16} className="spin" />WIRD GESPEICHERT …</> : <><Link2 size={16} />AUSWAHL PRIVAT SPEICHERN</>}</button>

          {connections.data?.length ? <section className="smart-device-section smart-device-existing"><div className="smart-device-section-title"><span>Vorgemerkte Geräte</span><small>Privat</small></div>{connections.data.map(connection => <div className="smart-device-connection" key={connection.id}><div><strong>{PROVIDERS.find(option => option.id === connection.provider)?.title ?? "Smart-Gerät"}</strong><small>{connection.modelLabel ?? "Modell noch offen"} · {connection.requestedMetrics.length} Werte · wartet auf Herstellerfreigabe</small></div><button type="button" aria-label="Geräteauswahl entfernen" disabled={removeDevice.isPending} onClick={() => void discardConnection(connection.id)}><Trash2 size={15} /></button></div>)}</section> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
