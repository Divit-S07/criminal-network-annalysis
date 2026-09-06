import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Users, Filter, Search, Upload, Map as MapIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useData } from "@/context/DataContext";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const markerIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:10px;height:10px;border-radius:50%;background:#22d3ee;border:2px solid #0a0b10;box-shadow:0 0 6px rgba(34,211,238,0.4)"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

function FlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 1 });
  }, [center, map]);
  return null;
}

export default function MapPage() {
  const { locations, hasData } = useData();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [caseFilter, setCaseFilter] = useState("");
  const [search, setSearch] = useState("");
  const [flyCenter, setFlyCenter] = useState<[number, number] | null>(null);

  useEffect(() => { setCaseFilter(""); setSearch(""); setSelectedId(null); }, [locations.length]);

  const filtered = locations.filter((l) => {
    if (caseFilter && !l.cases.includes(caseFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.name.toLowerCase().includes(q) && !l.type.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const uniqueCases = [...new Set(locations.flatMap((l) => l.cases))].sort();
  const selectedLoc = filtered.find((l) => l.id === selectedId);

  if (!hasData && locations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
          <MapIcon className="mx-auto mb-3 size-8 text-white/15" />
          <h2 className="text-sm font-semibold text-white/70">No locations yet</h2>
          <p className="mt-2 text-[11px] leading-relaxed text-white/30">Locations appear on the map when uploaded records contain location data.</p>
          <button
            onClick={() => navigate("/app/upload")}
            className="mt-5 flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-cyan-500"
          >
            <Upload className="size-3" /> Upload data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="relative flex-1">
        <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0e0f14]/90 px-2.5 py-1.5">
            <Search className="size-3 text-white/30" />
            <input
              type="text"
              placeholder="Search location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-36 bg-transparent text-[11px] text-white/70 placeholder:text-white/20 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0e0f14]/90 px-2.5 py-1.5">
            <Filter className="size-3 text-white/30" />
            <select
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
              className="bg-transparent text-[11px] text-white/60 outline-none"
            >
              <option value="" className="bg-[#14151c]">All cases</option>
              {uniqueCases.map((c) => (
                <option key={c} value={c} className="bg-[#14151c]">{c}</option>
              ))}
            </select>
          </div>
          <span className="rounded-lg bg-[#0e0f14]/90 px-2.5 py-1.5 text-[10px] text-white/30">{filtered.length} locations</span>
        </div>

        <MapContainer center={[20.5, 78.9]} zoom={5} className="size-full" style={{ background: "#0a0b10" }} zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' />
          <FlyTo center={flyCenter} />
          {filtered.map((loc) => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={markerIcon} eventHandlers={{ click: () => setSelectedId(loc.id) }}>
              <Popup>
                <div className="min-w-[180px] p-1">
                  <div className="text-xs font-semibold text-gray-800">{loc.name}</div>
                  <div className="mt-1 space-y-0.5 text-[11px] text-gray-600">
                    <div>Type: {loc.type}</div>
                    <div>{loc.lat.toFixed(4)}°N, {loc.lng.toFixed(4)}°E</div>
                    <div>{loc.entities.length} entities</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="w-72 border-l border-white/[0.06] bg-[#0e0f14] overflow-auto">
        <div className="border-b border-white/[0.06] px-4 py-3">
          <h2 className="text-xs font-medium text-white/50">Locations</h2>
        </div>
        <div className="p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-[11px] text-white/25">No locations found</p>
          ) : filtered.map((loc) => (
            <button
              key={loc.id}
              onClick={() => { setSelectedId(loc.id); setFlyCenter([loc.lat, loc.lng]); }}
              className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${selectedId === loc.id ? "bg-cyan-500/10" : "hover:bg-white/[0.04]"}`}
            >
              <MapPin className={`mt-0.5 size-3.5 shrink-0 ${selectedId === loc.id ? "text-cyan-400" : "text-white/25"}`} />
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-white/70">{loc.name}</div>
                <div className="text-[10px] text-white/30">{loc.type}</div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-white/25">
                  <span className="flex items-center gap-1"><Users className="size-2.5" />{loc.entities.length}</span>
                  <span>{loc.cases.length} cases</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        {selectedLoc && (
          <div className="border-t border-white/[0.06] px-4 py-3">
            <h3 className="text-[10px] font-medium uppercase tracking-wider text-white/30">Detail</h3>
            <div className="mt-2 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-white/30">Coordinates</span>
                <span className="text-white/50">{selectedLoc.lat.toFixed(4)}, {selectedLoc.lng.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/30">Type</span>
                <span className="text-white/50">{selectedLoc.type}</span>
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-[10px] font-medium uppercase tracking-wider text-white/30">Associated Entities</h4>
              <div className="mt-1.5 space-y-1">
                {selectedLoc.entities.map((eid) => (
                  <div key={eid} className="rounded-md bg-white/[0.03] px-2 py-1 text-[10px] text-white/50">{eid}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
