"use client";

import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap, Marker, Polygon } from "leaflet";
import { Crosshair, Trash2, Undo2 } from "lucide-react";
import { M2_PER_HA, polygonAreaM2 } from "@/lib/geo-area";
import "leaflet/dist/leaflet.css";

// OpenStreetMap has no satellite layer; Esri's World Imagery is the free aerial one, and its attribution is a licence condition, not decoration.
// ArcGIS serves tiles as {z}/{y}/{x} (y before x), unlike OSM's {z}/{x}/{y}; swapping them silently renders the wrong place.
const ESRI_IMAGERY_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

// World Imagery has no place names, roads, or boundaries, so alone it's anonymous green fields; these two transparent layers sit on top to make it a hybrid.
const ESRI_PLACES_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
const ESRI_ROADS_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";

const OSM_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// Central Java is a sane default view; the wilayah dataset has no coordinates, so only GPS (not a saved village) can seed the real center.
const DEFAULT_CENTER: [number, number] = [-7.5, 110.5];
const DEFAULT_ZOOM = 13;

// Close enough to pick out individual field boundaries.
const PLOT_ZOOM = 18;

const PLOT_COLOR = "#309152";

function requestPosition(
  onSuccess: (lat: number, lng: number) => void,
  onError: (message: string) => void,
  onSettled: () => void,
) {
  if (!navigator.geolocation) {
    onError("This device can't share its location. Pan to your plot instead.");
    onSettled();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      onSuccess(position.coords.latitude, position.coords.longitude);
      onSettled();
    },
    () => {
      onError("Couldn't get your location. Pan to your plot instead.");
      onSettled();
    },
    { enableHighAccuracy: true, timeout: 10000 },
  );
}

function formatArea(m2: number) {
  const ha = m2 / M2_PER_HA;
  const fmt = (v: number, d: number) =>
    new Intl.NumberFormat("id-ID", { maximumFractionDigits: d }).format(v);
  return { ha, haText: fmt(ha, 4), m2Text: fmt(m2, 0) };
}

export function PlotAreaMap({ onApply }: { onApply: (hectares: number) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const drawnRef = useRef<LayerGroup | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const polygonRef = useRef<Polygon | null>(null);
  const draggingRef = useRef(false);

  const [points, setPoints] = useState<[number, number][]>([]);
  const [ready, setReady] = useState(false);
  // Starts true: the farmer just opened the map and we're already looking for them, so don't flash an idle button first.
  const [locating, setLocating] = useState(true);
  const [locateError, setLocateError] = useState<string | null>(null);

  // Leaflet touches window at import time, so it can't be imported at module scope in a component Next server-renders; load it here instead.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      leafletRef.current = L;
      const map = L.map(containerRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

      // Imagery plus the transparent label/road overlays, grouped so the layer control toggles them as one "Satellite" option.
      const satellite = L.layerGroup([
        L.tileLayer(ESRI_IMAGERY_URL, {
          maxZoom: 19,
          attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
        }),
        L.tileLayer(ESRI_PLACES_URL, { maxZoom: 19 }),
        L.tileLayer(ESRI_ROADS_URL, { maxZoom: 19 }),
      ]).addTo(map);

      const street = L.tileLayer(OSM_URL, {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      });

      L.control.layers({ Satellite: satellite, Street: street }).addTo(map);
      drawnRef.current = L.layerGroup().addTo(map);

      // Functional update: this handler is registered once and would otherwise close over an empty points array forever.
      map.on("click", (event) => {
        setPoints((prev) => [...prev, [event.latlng.lat, event.latlng.lng]]);
      });

      mapRef.current = map;
      setReady(true);

      // Opening the map implies wanting GPS; Central Java is only the fallback for a refusal or failure.
      requestPosition(
        (lat, lng) => {
          if (!cancelled) mapRef.current?.setView([lat, lng], PLOT_ZOOM);
        },
        (message) => {
          if (!cancelled) setLocateError(message);
        },
        () => {
          if (!cancelled) setLocating(false);
        },
      );
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const group = drawnRef.current;
    if (!L || !group) return;
    // Mid-drag this would destroy and recreate the marker under the cursor, dropping the drag; the drag handler keeps the shape in sync imperatively until the drag ends.
    if (draggingRef.current) return;

    group.clearLayers();
    markersRef.current = [];
    polygonRef.current = null;

    points.forEach((point) => {
      // circleMarker can't be dragged, only L.marker can, so corners are markers wearing a circular divIcon.
      const marker = L.marker(point, {
        draggable: true,
        icon: L.divIcon({
          className: "",
          html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${PLOT_COLOR};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
      }).addTo(group);

      marker.on("dragstart", () => {
        draggingRef.current = true;
      });

      marker.on("drag", () => {
        const latlngs = markersRef.current.map((m) => m.getLatLng());
        // Moves the outline with the corner without going through state, which would rebuild the markers and kill the drag.
        polygonRef.current?.setLatLngs(latlngs);
        setPoints(latlngs.map((ll) => [ll.lat, ll.lng] as [number, number]));
      });

      marker.on("dragend", () => {
        draggingRef.current = false;
      });

      // Otherwise tapping a corner to grab it also drops a new corner there.
      marker.on("click", (event) => L.DomEvent.stopPropagation(event));

      markersRef.current.push(marker);
    });

    if (points.length >= 3) {
      polygonRef.current = L.polygon(points, {
        color: PLOT_COLOR,
        weight: 2,
        fillOpacity: 0.25,
      }).addTo(group);
    } else if (points.length === 2) {
      L.polyline(points, { color: PLOT_COLOR, weight: 2, dashArray: "4" }).addTo(group);
    }
  }, [points, ready]);

  // Still useful after the automatic locate: a way back once you've panned off.
  function locate() {
    setLocating(true);
    setLocateError(null);

    requestPosition(
      (lat, lng) => mapRef.current?.setView([lat, lng], PLOT_ZOOM),
      setLocateError,
      () => setLocating(false),
    );
  }

  const areaM2 = polygonAreaM2(points);
  const { ha, haText, m2Text } = formatArea(areaM2);
  const hasPlot = points.length >= 3;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary disabled:opacity-60"
        >
          <Crosshair className="size-3.5" aria-hidden="true" />
          {locating ? "Finding you…" : "Go to my location"}
        </button>
        <button
          type="button"
          onClick={() => setPoints((prev) => prev.slice(0, -1))}
          disabled={points.length === 0}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary disabled:opacity-40"
        >
          <Undo2 className="size-3.5" aria-hidden="true" />
          Undo corner
        </button>
        <button
          type="button"
          onClick={() => setPoints([])}
          disabled={points.length === 0}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary disabled:opacity-40"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
          Clear
        </button>
      </div>

      <div
        ref={containerRef}
        className="h-72 w-full overflow-hidden rounded-xl border border-border"
        // Leaflet's own panes sit at z-index 400+, which would otherwise punch through the sticky header.
        style={{ zIndex: 0 }}
      />

      {locateError && <p className="text-xs text-destructive">{locateError}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {hasPlot
              ? "Measured plot · drag any corner to adjust"
              : `Tap each corner of your field: ${Math.max(0, 3 - points.length)} more needed`}
          </p>
          <p className="font-serif text-lg font-bold text-foreground">
            {hasPlot ? `${haText} ha` : "N/A"}
            {hasPlot && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                {m2Text} m²
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onApply(ha)}
          disabled={!hasPlot}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          Use this area
        </button>
      </div>
    </div>
  );
}
