import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icons when bundling with Vite.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type LatLng = { lat: number; lng: number };

type OverpassElement =
  | {
      type: 'node';
      id: number;
      lat: number;
      lon: number;
      tags?: Record<string, string>;
    }
  | {
      type: 'way' | 'relation';
      id: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    };

type OverpassResponse = {
  elements: OverpassElement[];
};

function Recenter({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center.lat, center.lng, zoom, map]);
  return null;
}

export function NearbyRestAreasMap({ radiusMeters = 5000 }: { radiusMeters?: number }) {
  const [pos, setPos] = useState<LatLng | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);

  const [places, setPlaces] = useState<{ id: string; name: string; kind: string; loc: LatLng }[]>([]);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsGeoLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setIsGeoLoading(false);
      setGeoError('Geolocation is not supported on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (p) => {
        if (cancelled) return;
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setIsGeoLoading(false);
      },
      (err) => {
        if (cancelled) return;
        setIsGeoLoading(false);
        // Keep message short and actionable.
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Enable location to show nearby rest areas.');
        } else {
          setGeoError('Unable to get your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30_000,
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pos) return;

    const controller = new AbortController();
    const run = async () => {
      try {
        setIsPlacesLoading(true);
        setPlacesError(null);

        // Query OpenStreetMap via Overpass for common "rest stop" style POIs.
        // We include a few tags because rest areas are mapped inconsistently.
        const q = `
[out:json][timeout:25];
(
  node["highway"="rest_area"](around:${radiusMeters},${pos.lat},${pos.lng});
  way["highway"="rest_area"](around:${radiusMeters},${pos.lat},${pos.lng});
  node["highway"="services"](around:${radiusMeters},${pos.lat},${pos.lng});
  way["highway"="services"](around:${radiusMeters},${pos.lat},${pos.lng});
  node["amenity"="parking"]["parking"="rest_area"](around:${radiusMeters},${pos.lat},${pos.lng});
);
out center tags;`;

        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
          body: `data=${encodeURIComponent(q)}`,
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Overpass error: ${res.status}`);
        }

        const data = (await res.json()) as OverpassResponse;

        const next = data.elements
          .map((el) => {
            const tags = el.tags ?? {};
            const name = tags.name ?? tags.brand ?? 'Rest area';
            const kind = tags.highway === 'services' ? 'Services' : tags.highway === 'rest_area' ? 'Rest area' : 'Parking';

            const lat = el.type === 'node' ? el.lat : el.center?.lat;
            const lon = el.type === 'node' ? el.lon : el.center?.lon;
            if (typeof lat !== 'number' || typeof lon !== 'number') return null;

            return {
              id: `${el.type}:${el.id}`,
              name,
              kind,
              loc: { lat, lng: lon },
            };
          })
          .filter(Boolean) as { id: string; name: string; kind: string; loc: LatLng }[];

        setPlaces(next);
        setIsPlacesLoading(false);
      } catch (e) {
        if (controller.signal.aborted) return;
        setIsPlacesLoading(false);
        setPlacesError('Unable to load nearby rest areas.');
      }
    };

    run();
    return () => controller.abort();
  }, [pos, radiusMeters]);

  const zoom = useMemo(() => {
    // Rough: smaller radius => closer zoom.
    if (radiusMeters <= 2000) return 14;
    if (radiusMeters <= 5000) return 13;
    return 12;
  }, [radiusMeters]);

  if (isGeoLoading) {
    return (
      <div className="flex h-full min-h-[150px] items-center justify-center bg-accent text-muted-foreground">
        Locating…
      </div>
    );
  }

  if (!pos) {
    return (
      <div className="flex h-full min-h-[150px] items-center justify-center bg-accent p-4 text-center text-muted-foreground">
        {geoError ?? 'Location unavailable.'}
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[150px]">
      <MapContainer
        center={[pos.lat, pos.lng]}
        zoom={zoom}
        className="h-full w-full"
        attributionControl={false}
        scrollWheelZoom={false}
      >
        <Recenter center={pos} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Keep attribution in-app elsewhere if needed; this just hides the Leaflet control.
          // See OSM tile usage policy for production apps.
        />

        {/* Your location */}
        <Circle
          center={[pos.lat, pos.lng]}
          radius={radiusMeters}
          pathOptions={{ color: '#ef4444', weight: 2, fillColor: '#ef4444', fillOpacity: 0.08 }}
        />
        <Marker position={[pos.lat, pos.lng]}>
          <Popup>Your location</Popup>
        </Marker>

        {/* Nearby places */}
        {places.map((p) => (
          <Marker key={p.id} position={[p.loc.lat, p.loc.lng]}>
            <Popup>
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm opacity-80">{p.kind}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {(isPlacesLoading || placesError) && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-3">
          <div className="rounded-full bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow">
            {placesError ? placesError : 'Loading nearby rest areas…'}
          </div>
        </div>
      )}
    </div>
  );
}
