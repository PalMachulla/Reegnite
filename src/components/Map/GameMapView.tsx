import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { MonsterSpawn, LocationContext } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom player icon using URL encoding instead of btoa to avoid Latin1 issues
const playerIconSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <circle cx="16" cy="16" r="14" fill="#4a90e2" stroke="#ffffff" stroke-width="3"/>
    <circle cx="16" cy="16" r="8" fill="#ffffff"/>
    <circle cx="16" cy="16" r="4" fill="#4a90e2"/>
  </svg>
`);

const playerIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${playerIconSvg}`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Custom monster spawn icon using a simple design without emoji
const monsterIconSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <circle cx="16" cy="16" r="14" fill="#f59e0b" stroke="#ffffff" stroke-width="3"/>
    <circle cx="16" cy="16" r="8" fill="#dc2626"/>
    <polygon points="16,8 20,14 12,14" fill="#ffffff"/>
    <circle cx="13" cy="12" r="1.5" fill="#ffffff"/>
    <circle cx="19" cy="12" r="1.5" fill="#ffffff"/>
  </svg>
`);

const monsterIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${monsterIconSvg}`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

interface GameMapViewProps {
  userLocation: { lat: number; lng: number };
  locationContext: LocationContext | null;
  nearbyMonsters: MonsterSpawn[];
  onMonsterClick: (monster: MonsterSpawn) => void;
}

// Component to handle map events and player tracking
function MapEventHandler({
  userLocation,
}: {
  userLocation: { lat: number; lng: number };
}) {
  const { updatePlayerPosition } = useAuthStore();
  const map = useMap();

  useEffect(() => {
    // Center map on user location when it changes
    map.setView([userLocation.lat, userLocation.lng], map.getZoom());
    updatePlayerPosition(userLocation.lat, userLocation.lng);
  }, [userLocation, map, updatePlayerPosition]);

  // Handle map click events for future features
  useMapEvents({
    click: (e) => {
      console.log("Map clicked at:", e.latlng);
    },
  });

  return null;
}

// Component to handle map zoom and view controls
function MapController() {
  const map = useMap();

  useEffect(() => {
    // Set initial zoom level appropriate for monster hunting
    map.setZoom(16);

    // Add custom controls if needed
    const customControl = new L.Control({ position: "topright" });
    customControl.onAdd = () => {
      const div = L.DomUtil.create("div", "custom-map-control");
      div.innerHTML = `
        <button class="map-control-btn" title="Recenter on player">
          📍
        </button>
      `;
      div.style.cssText = `
        background: rgba(26, 26, 46, 0.9);
        border: 1px solid #4a90e2;
        border-radius: 8px;
        padding: 8px;
      `;

      div.querySelector(".map-control-btn")?.addEventListener("click", () => {
        // This will be handled by the parent component
        const event = new CustomEvent("recenterMap");
        window.dispatchEvent(event);
      });

      return div;
    };

    customControl.addTo(map);

    return () => {
      map.removeControl(customControl);
    };
  }, [map]);

  return null;
}

const GameMapView = ({
  userLocation,
  locationContext,
  nearbyMonsters,
  onMonsterClick,
}: GameMapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const [mapKey, setMapKey] = useState(0);

  // Handle recenter map event
  useEffect(() => {
    const handleRecenter = () => {
      if (mapRef.current) {
        mapRef.current.setView([userLocation.lat, userLocation.lng], 16);
      }
    };

    window.addEventListener("recenterMap", handleRecenter);
    return () => window.removeEventListener("recenterMap", handleRecenter);
  }, [userLocation]);

  // Force map re-render if location changes significantly
  useEffect(() => {
    setMapKey((prev) => prev + 1);
  }, [userLocation.lat, userLocation.lng]);

  return (
    <div className="map-container h-full w-full">
      <MapContainer
        key={mapKey}
        center={[userLocation.lat, userLocation.lng]}
        zoom={16}
        className="h-full w-full rounded-xl"
        ref={mapRef}
        zoomControl={true}
        attributionControl={true}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Map event handlers */}
        <MapEventHandler userLocation={userLocation} />
        <MapController />

        {/* Player location marker */}
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={playerIcon}
        >
          <Popup>
            <div className="text-center space-y-2">
              <h3 className="font-game text-primary-600 font-bold">
                Your Location
              </h3>
              <p className="text-sm text-gray-600">
                Lat: {userLocation.lat.toFixed(6)}
                <br />
                Lng: {userLocation.lng.toFixed(6)}
              </p>
              {locationContext && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-accent-600 capitalize">
                    {locationContext.biome} Biome
                  </p>
                  <p className="text-xs text-gray-500">
                    {locationContext.weather.condition} •{" "}
                    {locationContext.weather.temperature}°C
                  </p>
                </div>
              )}
            </div>
          </Popup>
        </Marker>

        {/* Monster spawn markers */}
        {nearbyMonsters.map((monster) => (
          <Marker
            key={monster.id}
            position={[monster.position.lat, monster.position.lng]}
            icon={monsterIcon}
            eventHandlers={{
              click: () => onMonsterClick(monster),
            }}
          >
            <Popup>
              <div className="text-center space-y-2">
                <h3 className="font-game text-accent-600 font-bold">
                  Wild Monster
                </h3>
                <p className="text-sm text-gray-600 capitalize">
                  {monster.biome} creature
                </p>
                <p className="text-xs text-gray-500">
                  Spawned: {new Date(monster.spawnedAt).toLocaleTimeString()}
                </p>
                <button
                  onClick={() => onMonsterClick(monster)}
                  className="mt-2 px-3 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors"
                >
                  Capture Monster
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Radius circle around player (monster spawn area) */}
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={100} // 100 meter radius
          pathOptions={{
            color: "#4a90e2",
            fillColor: "#4a90e2",
            fillOpacity: 0.1,
            weight: 2,
            dashArray: "5, 5",
          }}
        />
      </MapContainer>

      {/* Map overlay UI */}
      <div className="absolute top-4 left-4 bg-dark-800/90 backdrop-blur-sm rounded-lg p-3 text-white shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-primary-300">🗺️</span>
          <span className="text-sm font-medium">Monster Hunt Zone</span>
        </div>
        <p className="text-xs text-dark-300 mt-1">
          {nearbyMonsters.length} monster(s) nearby
        </p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-dark-800/90 backdrop-blur-sm rounded-lg p-3 text-white shadow-lg">
        <h4 className="text-sm font-game text-primary-300 mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-primary-500 border-2 border-white"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-accent-500 border-2 border-white"></div>
            <span>Wild Monster</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 border border-primary-400 border-dashed"></div>
            <span>Hunt Range</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMapView;
