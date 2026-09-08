import { useEffect, useRef, useState } from 'react';
import { stations as stationsApi } from '@/lib/api';
import {
  clampZoomAfterFit,
  DEFAULT_MAP_CENTER,
  GOOGLE_MAPS_MAP_ID,
  isGoogleMapsConfigured,
  loadGoogleMaps,
} from '@/lib/googleMaps';

interface ChargingStationsMapProps {
  onStationSelect?: (stationId: string) => void;
  selectedStationId?: string | null;
}

const ChargingStationsMap = ({ onStationSelect, selectedStationId }: ChargingStationsMapProps = {}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const infoWindow = useRef<google.maps.InfoWindow | null>(null);
  const markers = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markerById = useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const [stations, setStations] = useState<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const markersAddedRef = useRef(false);

  // Fetch stations on mount
  useEffect(() => {
    fetchStations();
  }, []);

  // Initialize the Google map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    let cancelled = false;

    if (!isGoogleMapsConfigured()) {
      setMapError('Map unavailable — VITE_GOOGLE_MAPS_API_KEY is not configured.');
      return;
    }

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapContainer.current) return;

        const mapInstance = new maps.Map(mapContainer.current, {
          center: DEFAULT_MAP_CENTER,
          zoom: 7,
          // Advanced markers (the custom HTML pins below) require a Map ID.
          mapId: GOOGLE_MAPS_MAP_ID,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: { position: maps.ControlPosition.RIGHT_TOP },
          clickableIcons: false,
        });

        // One shared InfoWindow: Google renders each popup in its own overlay,
        // so reusing a single instance is how you get "only one open at a time"
        // without tracking open state per marker.
        infoWindow.current = new maps.InfoWindow({ maxWidth: 320 });

        map.current = mapInstance;
        setMapLoaded(true);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setMapError(error.message);
        if (import.meta.env.DEV) {
          console.error('Google Maps failed to load:', error);
        }
      });

    return () => {
      cancelled = true;
      markers.current.forEach((marker) => {
        marker.map = null;
      });
      markers.current = [];
      markerById.current.clear();
      infoWindow.current?.close();
      infoWindow.current = null;
      map.current = null;
      setMapLoaded(false);
      markersAddedRef.current = false;
    };
  }, []);

  // Add markers when both map is loaded AND stations are available
  useEffect(() => {
    if (!map.current || !mapLoaded || stations.length === 0) return;

    // Prevent duplicate marker additions
    if (markersAddedRef.current && markers.current.length > 0) return;

    // Clear existing markers
    markers.current.forEach((marker) => {
      marker.map = null;
    });
    markers.current = [];
    markerById.current.clear();

    const bounds = new google.maps.LatLngBounds();

    stations.forEach((station) => {
      const markerElement = createCustomMarker(station);
      const position = { lat: Number(station.latitude), lng: Number(station.longitude) };

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: map.current!,
        position,
        content: markerElement,
        title: station.name,
        // Without this Google renders the custom content pointer-events:none,
        // so neither the DOM click below nor the :hover scale would fire.
        gmpClickable: true,
      });

      // Click → zoom in + show popup, plus notify parent (FindCharger
      // uses this to scroll its sidebar list). We zoom here so the Home
      // map has the same feel as /find-charger even though it has no
      // parent-controlled sidebar to sync with.
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation();
        openStationPopup(station, marker, 14);
        onStationSelect?.(station.id);
      });

      markers.current.push(marker);
      markerById.current.set(station.id, marker);
      bounds.extend(position);
    });

    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, 80);
      clampZoomAfterFit(map.current, 12);
    }

    markersAddedRef.current = true;
  }, [stations, mapLoaded, onStationSelect]);

  // Pan + open popup when parent selects a station from the side list
  useEffect(() => {
    if (!map.current || !selectedStationId) return;
    const station = stations.find((s) => s.id === selectedStationId);
    const marker = markerById.current.get(selectedStationId);
    if (!station || !marker) return;
    openStationPopup(station, marker, 13);
  }, [selectedStationId, stations]);

  const openStationPopup = (
    station: any,
    marker: google.maps.marker.AdvancedMarkerElement,
    minZoom: number
  ) => {
    if (!map.current) return;
    map.current.panTo({ lat: Number(station.latitude), lng: Number(station.longitude) });
    map.current.setZoom(Math.max(map.current.getZoom() ?? minZoom, minZoom));
    infoWindow.current?.setContent(createPopupContent(station));
    infoWindow.current?.open({ map: map.current, anchor: marker });
  };

  const createCustomMarker = (station: any) => {
    const el = document.createElement('div');
    const isDC = station.charger_type === 'DC';
    const isResidential = station.station_type === 'Residential';

    el.className = 'custom-marker';
    el.style.cursor = 'pointer';
    // AdvancedMarkerElement anchors its content by the bottom edge; shifting
    // down by half the height puts the icon's visual centre on the coordinate,
    // matching how the pins were anchored before.
    el.style.transform = 'translateY(50%)';
    el.title = `Click to open ${station.name} in Google Maps`;
    el.innerHTML = `
      <div class="marker-container ${isDC ? 'dc-charger' : 'ac-charger'} ${isResidential ? 'residential' : ''}">
        <div class="marker-pulse"></div>
        <div class="marker-icon">
          ${isDC
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>'
          }
        </div>
        <div class="marker-badge">${station.total_chargers}</div>
      </div>
    `;

    return el;
  };

  const createPopupContent = (station: any) => {
    const isDC = station.charger_type === 'DC';
    const isResidential = station.station_type === 'Residential';

    return `
      <div class="station-popup">
        <div class="popup-header ${isDC ? 'dc-header' : 'ac-header'}">
          <div class="popup-icon">
            ${isDC
              ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>'
              : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>'
            }
          </div>
          <h3 class="popup-title">${station.name}</h3>
          <span class="popup-type-badge ${isResidential ? 'residential-badge' : 'public-badge'}">
            ${isResidential ? 'Residential' : 'Public'}
          </span>
        </div>
        <div class="popup-content">
          <div class="popup-row">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>${station.address}</span>
          </div>
          <div class="popup-row">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${station.city}, ${station.state}</span>
          </div>
          <div class="popup-divider"></div>
          <div class="popup-charger-info">
            <div class="charger-type-label">${isDC ? 'DC Fast Charging' : 'AC Charging'}</div>
            <div class="charger-power">${station.power_output}</div>
            <div class="charger-connector">${station.connector_type} Connector</div>
          </div>
          <div class="popup-availability">
            <div class="availability-indicator ${station.status === 'active' ? 'active' : 'inactive'}"></div>
            <span>${station.available_chargers}/${station.total_chargers} Available</span>
          </div>
          <button
            onclick="window.open('https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}', '_blank')"
            class="navigate-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"></path></svg>
            Navigate with Google Maps
          </button>
        </div>
      </div>
    `;
  };

  const fetchStations = async () => {
    try {
      setStations(await stationsApi.listActive());
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching stations:', error);
      }
    }
  };

  return (
    <>
      <div className="charging-stations-map w-full h-[500px] md:h-[600px] rounded-2xl shadow-elegant overflow-hidden relative" style={{ minHeight: '500px' }}>
        <div ref={mapContainer} className="h-full w-full" />

        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted px-6 text-center">
            <p className="text-sm text-muted-foreground">{mapError}</p>
          </div>
        )}

        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      <style>{`
        /* IMPORTANT: no transform or transition rules that fight the anchoring
           translateY(50%) set inline on .custom-marker — Google positions the
           advanced-marker wrapper, and any transform here replaces the
           centring offset. All hover + animation effects live on the inner
           .marker-container instead. */
        .custom-marker {
          cursor: pointer;
          will-change: auto;
        }

        .marker-container {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .custom-marker:hover .marker-container {
          transform: scale(1.15);
          z-index: 10;
        }

        .marker-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .ac-charger .marker-pulse {
          background: radial-gradient(circle, rgba(38, 116, 236, 0.4), transparent);
        }

        .dc-charger .marker-pulse {
          background: radial-gradient(circle, rgba(147, 51, 234, 0.4), transparent);
        }

        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        .marker-icon {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .ac-charger .marker-icon {
          background: linear-gradient(135deg, #2674EC, #00E5FF);
          color: white;
        }

        .dc-charger .marker-icon {
          background: linear-gradient(135deg, #9333EA, #C026D3);
          color: white;
        }

        .residential .marker-icon {
          border: 3px solid #F59E0B;
        }

        .marker-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: white;
          color: #2674EC;
          font-size: 10px;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .dc-charger .marker-badge {
          color: #9333EA;
        }

        /* Google's InfoWindow ships its own padding, close button and inner
           scroll wrapper. Strip them so .station-popup below can own the
           whole card. */
        .charging-stations-map .gm-style-iw.gm-style-iw-c {
          padding: 0;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          max-height: none !important;
        }

        .charging-stations-map .gm-style-iw-d {
          overflow: hidden !important;
          max-height: none !important;
        }

        .charging-stations-map .gm-style-iw-chr {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 1;
          height: 0;
        }

        .charging-stations-map .gm-style-iw-chr button {
          filter: invert(1) grayscale(1) brightness(2);
        }

        .station-popup {
          min-width: 280px;
        }

        .popup-header {
          padding: 16px;
          color: white;
          position: relative;
        }

        .ac-header {
          background: linear-gradient(135deg, #2674EC, #00E5FF);
        }

        .dc-header {
          background: linear-gradient(135deg, #9333EA, #C026D3);
        }

        .popup-icon {
          margin-bottom: 8px;
        }

        .popup-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .popup-type-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .public-badge {
          background: rgba(255, 255, 255, 0.25);
          color: white;
        }

        .residential-badge {
          background: #F59E0B;
          color: white;
        }

        .popup-content {
          padding: 16px;
          background: white;
        }

        .popup-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 10px;
          font-size: 13px;
          color: #475569;
        }

        .popup-row svg {
          flex-shrink: 0;
          margin-top: 2px;
          color: #2674EC;
        }

        .popup-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #E2E8F0, transparent);
          margin: 12px 0;
        }

        .popup-charger-info {
          background: linear-gradient(135deg, #F0F9FF, #DBEAFE);
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .charger-type-label {
          font-size: 11px;
          font-weight: 600;
          color: #2674EC;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .charger-power {
          font-size: 16px;
          font-weight: 700;
          color: #1E293B;
          margin-bottom: 4px;
        }

        .charger-connector {
          font-size: 12px;
          color: #64748B;
        }

        .popup-availability {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #10B981;
        }

        .availability-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10B981;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .availability-indicator.inactive {
          background: #EF4444;
        }

        .navigate-button {
          width: 100%;
          margin-top: 12px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #2674EC, #00E5FF);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .navigate-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(38, 116, 236, 0.4);
        }

        .navigate-button:active {
          transform: translateY(0);
        }
      `}</style>
    </>
  );
};

export default ChargingStationsMap;
