import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

export type OpenStreetMapPoint = {
  lat: number;
  lng: number;
  label: string;
  detail?: string;
};

type OpenStreetMapProps = {
  className?: string;
  initialCenter: { lat: number; lng: number };
  initialZoom: number;
  points?: OpenStreetMapPoint[];
  ariaLabel?: string;
  locale?: "de" | "en";
}

export function OpenStreetMap({ className, initialCenter, initialZoom, points = [], ariaLabel, locale = "de" }: OpenStreetMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView([initialCenter.lat, initialCenter.lng], initialZoom);
    const tileHost = locale === "de" ? "https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    L.tileLayer(tileHost, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }).addTo(map);

    const markers = points.map(point => L.circleMarker([point.lat, point.lng], {
      radius: 8,
      color: "#143d24",
      weight: 2,
      fillColor: "#b9fb7f",
      fillOpacity: 0.95,
    }).addTo(map).bindPopup(`<strong>${escapeHtml(point.label)}</strong>${point.detail ? `<br><span>${escapeHtml(point.detail)}</span>` : ""}`));
    if (points.length > 1) {
      const bounds = L.latLngBounds(points.map(point => [point.lat, point.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [36, 36], maxZoom: initialZoom });
    }

    return () => {
      markers.forEach(marker => marker.remove());
      map.remove();
    };
  }, [initialCenter.lat, initialCenter.lng, initialZoom, points, locale]);

  return <div ref={containerRef} className={cn("openstreetmap-map", className)} role="img" aria-label={ariaLabel ?? "OpenStreetMap-Karte"} />;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}
