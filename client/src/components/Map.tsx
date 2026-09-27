/**
 * GOOGLE MAPS FRONTEND INTEGRATION - ESSENTIAL GUIDE
 *
 * USAGE FROM PARENT COMPONENT:
 * ======
 *
 * const mapRef = useRef<google.maps.Map | null>(null);
 *
 * <MapView
 *   initialCenter={{ lat: 40.7128, lng: -74.0060 }}
 *   initialZoom={15}
 *   onMapReady={(map) => {
 *     mapRef.current = map; // Store to control map from parent anytime, google map itself is in charge of the re-rendering, not react state.
 * </MapView>
 *
 * ======
 * Available Libraries and Core Features:
 * -------------------------------
 * 📍 MARKER (from `marker` library)
 * - Attaches to map using { map, position }
 * new google.maps.marker.AdvancedMarkerElement({
 *   map,
 *   position: { lat: 37.7749, lng: -122.4194 },
 *   title: "San Francisco",
 * });
 *
 * -------------------------------
 * 🏢 PLACES (from `places` library)
 * - Does not attach directly to map; use data with your map manually.
 * const place = new google.maps.places.Place({ id: PLACE_ID });
 * await place.fetchFields({ fields: ["displayName", "location"] });
 * map.setCenter(place.location);
 * new google.maps.marker.AdvancedMarkerElement({ map, position: place.location });
 *
 * -------------------------------
 * 🧭 GEOCODER (from `geocoding` library)
 * - Standalone service; manually apply results to map.
 * const geocoder = new google.maps.Geocoder();
 * geocoder.geocode({ address: "New York" }, (results, status) => {
 *   if (status === "OK" && results[0]) {
 *     map.setCenter(results[0].geometry.location);
 *     new google.maps.marker.AdvancedMarkerElement({
 *       map,
 *       position: results[0].geometry.location,
 *     });
 *   }
 * });
 *
 * -------------------------------
 * 📐 GEOMETRY (from `geometry` library)
 * - Pure utility functions; not attached to map.
 * const dist = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
 *
 * -------------------------------
 * 🛣️ ROUTES (from `routes` library)
 * - Combines DirectionsService (standalone) + DirectionsRenderer (map-attached)
 * const directionsService = new google.maps.DirectionsService();
 * const directionsRenderer = new google.maps.DirectionsRenderer({ map });
 * directionsService.route(
 *   { origin, destination, travelMode: "DRIVING" },
 *   (res, status) => status === "OK" && directionsRenderer.setDirections(res)
 * );
 *
 * -------------------------------
 * 🌦️ MAP LAYERS (attach directly to map)
 * - new google.maps.TrafficLayer().setMap(map);
 * - new google.maps.TransitLayer().setMap(map);
 * - new google.maps.BicyclingLayer().setMap(map);
 *
 * -------------------------------
 * ✅ SUMMARY
 * - “map-attached” → AdvancedMarkerElement, DirectionsRenderer, Layers.
 * - “standalone” → Geocoder, DirectionsService, DistanceMatrixService, ElevationService.
 * - “data-only” → Place, Geometry utilities.
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";
import { OpenStreetMap, type OpenStreetMapPoint } from "@/components/OpenStreetMap";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

let mapScriptPromise: { locale: "de" | "en"; promise: Promise<void> } | null = null;

function loadMapScript(locale: "de" | "en") {
  if (window.google?.maps) return Promise.resolve();
  if (!API_KEY) return Promise.reject(new Error("Kartenbasis ist nicht konfiguriert."));
  if (mapScriptPromise?.locale === locale) return mapScriptPromise.promise;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&language=${locale}&region=${locale === "de" ? "DE" : "US"}&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (window.google?.maps) resolve();
      else reject(new Error("Kartenbasis wurde ohne Google-Maps-API geladen."));
      script.remove();
    };
    script.onerror = () => {
      script.remove();
      mapScriptPromise = null;
      reject(new Error("Kartenbasis konnte nicht geladen werden."));
    };
    document.head.appendChild(script);
  });
  mapScriptPromise = { locale, promise };
  return promise;
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
  onMapError?: (error: Error) => void;
  points?: OpenStreetMapPoint[];
  fallbackPoints?: OpenStreetMapPoint[];
  locale?: "de" | "en";
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  onMapReady,
  onMapError,
  points = [],
  fallbackPoints = [],
  locale = "de",
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [useOpenStreetMap, setUseOpenStreetMap] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const init = usePersistFn(async () => {
    try {
      await loadMapScript(locale);
      if (!mapContainer.current || !window.google?.maps) {
        throw new Error("Kartencontainer ist nicht verfügbar.");
      }
      map.current = new window.google.maps.Map(mapContainer.current, {
        zoom: initialZoom,
        center: initialCenter,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        streetViewControl: false,
        mapId: "DEMO_MAP_ID",
      });
      setMapReady(true);
      onMapReady?.(map.current);
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error("Kartenbasis konnte nicht initialisiert werden.");
      console.error(normalized);
      setUseOpenStreetMap(true);
      // The OSM surface is the truthful, keyless fallback. Do not turn a
      // usable map fallback into a red error state in the parent surface.
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!mapReady || !map.current || !window.google?.maps?.marker?.AdvancedMarkerElement) return;
    markers.current.forEach(marker => { marker.map = null; });
    markers.current = points.map(point => new window.google.maps.marker.AdvancedMarkerElement({
      map: map.current,
      position: { lat: point.lat, lng: point.lng },
      title: point.detail ? `${point.label} · ${point.detail}` : point.label,
    }));
    return () => {
      markers.current.forEach(marker => { marker.map = null; });
      markers.current = [];
    };
  }, [mapReady, points]);

  if (useOpenStreetMap) {
    return <OpenStreetMap className={className} initialCenter={initialCenter} initialZoom={initialZoom} points={fallbackPoints.length ? fallbackPoints : points} locale={locale} />;
  }
  return <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />;
}
