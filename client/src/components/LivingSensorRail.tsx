import { Droplets, Leaf, Thermometer, Wind } from "lucide-react";
import "@/styles/world-controls.css";

type SensorState = {
  label: string;
  value?: string;
  icon: typeof Thermometer;
  tone: "botany" | "aquarium" | "terrarium" | "ai";
};

/**
 * Compact home sensor rail. Values deliberately default to an honest offline
 * state until a real sensor connection supplies readings.
 */
const SENSOR_STATES: SensorState[] = [
  { label: "Wasser", icon: Thermometer, tone: "botany" },
  { label: "Luftfeuchte", icon: Leaf, tone: "botany" },
  { label: "pH-Wert", icon: Droplets, tone: "aquarium" },
  { label: "Außen", icon: Wind, tone: "aquarium" },
];

export default function LivingSensorRail({ readings = {} }: { readings?: Partial<Record<"Wasser" | "Luftfeuchte" | "pH-Wert" | "Außen", string>> }) {
  return (
    <section className="bwl-sensor-rail" aria-label="Sensorstatus">
      {SENSOR_STATES.map((sensor) => {
        const Icon = sensor.icon;
        const value = readings[sensor.label as keyof typeof readings];
        return (
          <div key={sensor.label} className={`bwl-sensor-item bwl-sensor-item-${sensor.tone}`}>
            <Icon aria-hidden="true" />
            <span>
              <strong>{value ?? "—"}</strong>
              <small>{value ? sensor.label : `${sensor.label} · offline`}</small>
            </span>
          </div>
        );
      })}
    </section>
  );
}
