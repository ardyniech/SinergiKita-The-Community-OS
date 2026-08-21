// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useMapData } from './logic/useMapData';
import { useLeafletPatches } from './logic/useLeafletPatches';
import { MapContainer } from './primitives/MapContainer';
import { MapControls } from './primitives/MapControls';
import { createIncidentIcon, createSosIcon, createUserIcon, createMemberIcon, getIncidentEmoji } from './primitives/markerUtils';

export default function IncidentMap() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  const { alerts, emergencies, activeMembers, loading } = useMapData(profile);
  const [leafletLoaded, setLeafletLoaded] = useState(!!(window as any).L);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Filters
  const [showIncidents, setShowIncidents] = useState(true);
  const [showMembers, setShowMembers] = useState(true);

  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const isMountedRef = useRef(true);
  const isSyncingRef = useRef(false);

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 1. Wait for Leaflet to be loaded
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }
    const interval = setInterval(() => {
      if ((window as any).L) {
        setLeafletLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Apply patches
  useLeafletPatches(leafletLoaded);

  const onMapReady = (map: any, layerGroup: any) => {
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;
    setMapReady(true);

    // Get current device position to center map
    let watchId: number;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
            map.setView([lat, lng], 14);
            setUserLocation({ lat, lng });
          }
        },
        () => {}
      );
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
            setUserLocation({ lat, lng });
          }
        },
        () => {}
      );
    }

    return () => {
      if (watchId && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  };

  // Sync Markers to Map
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !layerGroupRef.current || !isMountedRef.current) return;
    if (isSyncingRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!map._container) return;

    isSyncingRef.current = true;

    try {
      const activeKeys = new Set<string>();

      if (showIncidents) {
        alerts.forEach(alert => {
          try {
            if (!isMountedRef.current || !map._container) return;
            if (!alert.location) return;
            
            const key = `alert_${alert.id}`;
            activeKeys.add(key);

            const icon = createIncidentIcon(L, alert);
            const latlng = [alert.location.lat, alert.location.lng];
            const popupContent = `
              <div class="p-1 min-w-[150px] font-sans">
                <h5 class="font-extrabold text-[10px] uppercase text-rose-600 tracking-tight flex items-center gap-1">
                  ${getIncidentEmoji(alert.incidentType)} ${alert.title}
                </h5>
                <p class="text-[9px] text-slate-600 mt-0.5 leading-normal">${alert.description}</p>
                <div class="flex items-center justify-between border-t border-slate-100 pt-1 mt-1 text-[7px] text-slate-400 font-mono">
                  <span>OLEH: ${alert.userName}</span>
                </div>
              </div>
            `;

            let marker = markersRef.current[key];
            if (marker) {
              marker.setLatLng(latlng);
              marker.setIcon(icon);
              marker.setPopupContent(popupContent);
            } else {
              marker = L.marker(latlng, { icon });
              marker.addTo(layerGroup);
              marker.bindPopup(popupContent);
              markersRef.current[key] = marker;
            }
          } catch (err) {}
        });

        emergencies.forEach(sos => {
          try {
            if (!isMountedRef.current || !map._container) return;
            const key = `sos_${sos.id}`;
            activeKeys.add(key);
            const icon = createSosIcon(L, sos);
            const latlng = [sos.latitude, sos.longitude];
            const popupContent = `
              <div class="p-1 min-w-[160px] font-sans border-2 border-red-500 rounded-lg">
                <h5 class="font-black text-[11px] uppercase text-red-600 tracking-tight flex items-center gap-1 mb-1">
                  🚨 EMERGENCY SOS
                </h5>
                <p class="text-[10px] font-bold text-slate-900">${sos.senderName}</p>
                <p class="text-[9px] text-slate-500 leading-tight">${sos.senderAddress}</p>
                <div class="mt-2 pt-1 border-t border-red-100">
                  <p class="text-[8px] font-black text-red-500 uppercase tracking-widest">Status: ${sos.status || 'Triggered'}</p>
                  <p class="text-[7px] text-slate-400 mt-0.5">${sos.triggeredAt ? new Date(sos.triggeredAt).toLocaleTimeString() : ''}</p>
                </div>
              </div>
            `;
            let marker = markersRef.current[key];
            if (marker) {
              marker.setLatLng(latlng);
              marker.setIcon(icon);
              marker.setPopupContent(popupContent);
            } else {
              marker = L.marker(latlng, { icon, zIndexOffset: 2000 });
              marker.addTo(layerGroup);
              marker.bindPopup(popupContent);
              markersRef.current[key] = marker;
            }
          } catch (err) {}
        });
      }

      if (showMembers) {
        if (userLocation) {
          try {
            if (!isMountedRef.current || !map._container) return;
            const key = 'user_location';
            activeKeys.add(key);
            const icon = createUserIcon(L);
            const latlng = [userLocation.lat, userLocation.lng];
            const popupContent = `
              <div class="p-1 font-sans text-center">
                <h5 class="font-black text-[11px] text-blue-600 uppercase">LOKASI SAYA</h5>
                <p class="text-[9px] text-slate-500 mt-0.5">Posisi GPS Saat Ini</p>
              </div>
            `;
            let marker = markersRef.current[key];
            if (marker) {
              marker.setLatLng(latlng);
              marker.setIcon(icon);
              marker.setPopupContent(popupContent);
            } else {
              marker = L.marker(latlng, { icon, zIndexOffset: 1000 });
              marker.addTo(layerGroup);
              marker.bindPopup(popupContent);
              markersRef.current[key] = marker;
            }
          } catch (err) {}
        }

        activeMembers.forEach(member => {
          try {
            if (!isMountedRef.current || !map._container) return;
            if (member.uid === profile?.uid) return;
            const key = `member_${member.uid}`;
            activeKeys.add(key);
            const icon = createMemberIcon(L, member);
            const latlng = [member.latitude, member.longitude];
            const popupContent = `
              <div class="p-1 min-w-[140px] font-sans">
                <div class="flex items-center gap-1">
                  <h5 class="font-black text-[10px] uppercase text-slate-900 leading-tight">${member.displayName}</h5>
                </div>
                <p class="text-[8px] font-mono font-bold text-slate-400 uppercase mt-0.5">${member.role || 'Warga'}</p>
                <div class="flex items-center gap-1 text-[8px] text-slate-500 mt-1 border-t border-slate-100 pt-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span>Terhubung Real-Time</span>
                </div>
              </div>
            `;
            let marker = markersRef.current[key];
            if (marker) {
              marker.setLatLng(latlng);
              marker.setIcon(icon);
              marker.setPopupContent(popupContent);
            } else {
              marker = L.marker(latlng, { icon });
              marker.addTo(layerGroup);
              marker.bindPopup(popupContent);
              markersRef.current[key] = marker;
            }
          } catch (err) {}
        });
      }

      Object.keys(markersRef.current).forEach(key => {
        if (!activeKeys.has(key)) {
          const marker = markersRef.current[key];
          if (marker) {
            try { layerGroup.removeLayer(marker); } catch (err) {}
          }
          delete markersRef.current[key];
        }
      });
    } catch (e) {
      console.warn("Leaflet sync error prevented:", e);
    } finally {
      isSyncingRef.current = false;
    }
  }, [leafletLoaded, mapReady, alerts, emergencies, activeMembers, showIncidents, showMembers, userLocation, profile]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
          mapInstanceRef.current.setView([lat, lng], 15);
          setUserLocation({ lat, lng });
          showToast("📍 Peta difokuskan ke GPS Anda");
        }
      },
      () => showToast("❌ Gagal menjangkau GPS Anda")
    );
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200 mb-3 h-[350px] relative flex flex-col">
      <MapControls 
        showMembers={showMembers}
        setShowMembers={setShowMembers}
        showIncidents={showIncidents}
        setShowIncidents={setShowIncidents}
        activeMembersCount={activeMembers.length}
        alertsCount={alerts.length}
        loading={loading}
        onRecenter={handleRecenter}
      />
      <MapContainer 
        leafletLoaded={leafletLoaded}
        onMapReady={onMapReady}
      />
    </div>
  );
}
