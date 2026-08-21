import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, limit, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MapPin, Loader2, Navigation, Users, AlertTriangle } from 'lucide-react';

export default function IncidentMap() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  const [alerts, setAlerts] = useState<any[]>([]);
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leafletLoaded, setLeafletLoaded] = useState(!!(window as any).L);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Filters
  const [showIncidents, setShowIncidents] = useState(true);
  const [showMembers, setShowMembers] = useState(true);

  const mapRef = useRef<HTMLDivElement>(null);
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

  // 1b. Safety Patch for Leaflet DomUtil to prevent _leaflet_pos errors
  useEffect(() => {
    if (leafletLoaded) {
      const L = (window as any).L;
      if (L && !L._patchedSafelyInComp) {
        L._patchedSafelyInComp = true;
        
        if (L.DomUtil) {
          L.DomUtil.setPosition = function (el: any, point: any) {
            if (!el) return;
            try {
              el._leaflet_pos = point;
              if (L.Browser && L.Browser.any3d) {
                L.DomUtil.setTransform(el, point);
              } else if (el.style) {
                el.style.left = (point ? point.x : 0) + 'px';
                el.style.top = (point ? point.y : 0) + 'px';
              }
            } catch (err) {
              // Intercept
            }
          };

          L.DomUtil.getPosition = function (el: any) {
            if (!el) return (L.Point ? new L.Point(0, 0) : { x: 0, y: 0 });
            try {
              return el._leaflet_pos || (L.Point ? new L.Point(0, 0) : { x: 0, y: 0 });
            } catch (err) {
              return (L.Point ? new L.Point(0, 0) : { x: 0, y: 0 });
            }
          };
        }

        if (L.PosAnimation && L.PosAnimation.prototype) {
          L.PosAnimation.prototype._runFrame = function (progress: any, round: any) {
            if (!this._el) return;
            try {
              let pos = this._startPos.add(this._offset.multiplyBy(progress));
              if (round) pos = pos.round();
              if (this._el) {
                this._el._leaflet_pos = pos;
                L.DomUtil.setPosition(this._el, pos);
              }
              this.fire('step');
            } catch (err) {
              // Intercept
            }
          };
        }

        if (L.Marker && L.Marker.prototype) {
          const _origMarkerSetPos = L.Marker.prototype._setPos;
          if (_origMarkerSetPos) {
            L.Marker.prototype._setPos = function (pos: any) {
              if (!this._icon && !this._shadow) return;
              try {
                if (this._icon) this._icon._leaflet_pos = pos;
                if (this._shadow) this._shadow._leaflet_pos = pos;
                return _origMarkerSetPos.call(this, pos);
              } catch (err) {
                // Intercept
              }
            };
          }
        }
      }
    }
  }, [leafletLoaded]);

  // 2. Real-Time Fetch Incidents
  useEffect(() => {
    if (!profile?.tenantId) return;

    const q = query(
      collection(db, 'social_alerts'),
      where('tenantId', '==', profile.tenantId),
      where('type', '==', 'incident'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((item: any) => item.location && typeof item.location.lat === 'number' && typeof item.location.lng === 'number' && !isNaN(item.location.lat) && !isNaN(item.location.lng))
        .filter((item: any) => {
          if (!item.createdAt) return true;
          const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
          const diffHours = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60);
          return diffHours <= 24;
        });
      setAlerts(data);
    }, (error) => {
      console.error("IncidentMap Alerts snapshot error:", error);
    });

    return unsubscribe;
  }, [profile?.tenantId]);

  // 3. Real-Time Fetch SOS Emergencies
  useEffect(() => {
    if (!profile?.tenantId) return;

    const yesterday = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const q = query(
      collection(db, 'emergencies'),
      where('tenantId', '==', profile.tenantId),
      where('timestamp', '>=', yesterday)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter(item => typeof item.latitude === 'number' && typeof item.longitude === 'number' && !isNaN(item.latitude) && !isNaN(item.longitude))
        .filter(item => item.status !== 'resolved');
      setEmergencies(data);
    }, (error) => {
      console.error("IncidentMap SOS snapshot error:", error);
    });

    return unsubscribe;
  }, [profile?.tenantId]);

  // 4. Real-Time Fetch Active Member/Ojol Locations
  useEffect(() => {
    if (!profile?.tenantId) return;

    const q = query(
      collection(db, 'active_locations'),
      where('tenantId', '==', profile.tenantId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((item: any) => {
          return typeof item.latitude === 'number' && typeof item.longitude === 'number' && !isNaN(item.latitude) && !isNaN(item.longitude);
        });
      setActiveMembers(data);
      setLoading(false);
    }, (error) => {
      console.error("IncidentMap Active Members snapshot error:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [profile?.tenantId]);

  // 4. Initialize Leaflet Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const L = (window as any).L;
    
    // Clear existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    }

    // Default center
    const centerLat = -6.2088;
    const centerLng = 106.8456;

    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
      zoomAnimation: false,
      transform3DLimit: 0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    mapInstanceRef.current = map;
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
      if (mapInstanceRef.current) {
        try {
          const map = mapInstanceRef.current;
          if (layerGroupRef.current) {
            layerGroupRef.current.clearLayers();
            layerGroupRef.current.remove();
          }
          map.remove(); // Explicitly destroy the map instance
        } catch (err) {
          console.warn("Error cleaning up map:", err);
        }
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
        markersRef.current = {};
        setMapReady(false);
      }
    };
  }, [leafletLoaded]);

  // 5. Sync Markers to Map
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !layerGroupRef.current || !isMountedRef.current) return;
    if (isSyncingRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    // Safety check: component might be unmounting or map container might be gone
    if (!map._container) return;

    isSyncingRef.current = true;

    try {
      const activeKeys = new Set<string>();

      // Helper to get emoji for incident types
      const getIncidentEmoji = (type: string) => {
        if (type === 'traffic') return '🚧';
        if (type === 'accident') return '🚨';
        if (type === 'roadblock') return '⚠️';
        return '📍';
      };

      // Render Incidents if enabled
      if (showIncidents) {
        alerts.forEach(alert => {
          try {
            if (!isMountedRef.current || !map._container) return;
            if (!alert.location || typeof alert.location.lat !== 'number' || typeof alert.location.lng !== 'number' || isNaN(alert.location.lat) || isNaN(alert.location.lng)) return;
            
            const key = `alert_${alert.id}`;
            activeKeys.add(key);

            const emoji = getIncidentEmoji(alert.incidentType);
            const icon = L.divIcon({
              html: `
                <div class="flex flex-col items-center">
                  <div class="flex items-center justify-center w-7 h-7 rounded-full bg-rose-500 border border-white shadow-lg animate-pulse">
                    <span class="text-[11px]">${emoji}</span>
                  </div>
                  <div class="bg-slate-900 text-[8px] font-black text-white px-1 py-0.5 rounded shadow mt-0.5 whitespace-nowrap uppercase tracking-wider scale-95 origin-top">
                    ${alert.title}
                  </div>
                </div>
              `,
              className: 'custom-leaflet-marker',
              iconSize: [40, 44],
              iconAnchor: [20, 44]
            });

            const latlng = [alert.location.lat, alert.location.lng];
            const popupContent = `
              <div class="p-1 min-w-[150px] font-sans">
                <h5 class="font-extrabold text-[10px] uppercase text-rose-600 tracking-tight flex items-center gap-1">
                  ${emoji} ${alert.title}
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
          } catch (err) {
            // Silently fail for individual marker errors
          }
        });

        // Render SOS Emergencies
        emergencies.forEach(sos => {
          try {
            if (!isMountedRef.current || !map._container) return;
            if (typeof sos.latitude !== 'number' || typeof sos.longitude !== 'number' || isNaN(sos.latitude) || isNaN(sos.longitude)) return;

            const key = `sos_${sos.id}`;
            activeKeys.add(key);

            const icon = L.divIcon({
              html: `
                <div class="flex flex-col items-center">
                  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-[0_0_15px_rgba(220,38,38,0.8)] animate-bounce">
                    <span class="text-[12px]">🆘</span>
                  </div>
                  <div class="bg-red-600 text-[8px] font-black text-white px-1.5 py-0.5 rounded shadow-lg mt-0.5 whitespace-nowrap uppercase tracking-widest scale-100 origin-top">
                    SOS: ${sos.senderName}
                  </div>
                </div>
              `,
              className: 'custom-leaflet-marker',
              iconSize: [44, 48],
              iconAnchor: [22, 48]
            });

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
          } catch (err) {
            // Silently fail
          }
        });
      }

      // Render Active Members if enabled
      if (showMembers) {
        // Render current user's location
        if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number' && !isNaN(userLocation.lat) && !isNaN(userLocation.lng)) {
          try {
            if (!isMountedRef.current || !map._container) return;
            const key = 'user_location';
            activeKeys.add(key);

            const icon = L.divIcon({
              html: `
                <div class="flex flex-col items-center">
                  <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 border-2 border-white text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                    <span class="text-[14px]">📍</span>
                    <span class="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-400 border border-white animate-ping"></span>
                  </div>
                  <div class="bg-blue-600 text-[9px] font-black text-white px-2 py-0.5 rounded-md shadow-md mt-1 whitespace-nowrap tracking-wider">
                    LOKASI SAYA
                  </div>
                </div>
              `,
              className: 'custom-leaflet-marker',
              iconSize: [44, 48],
              iconAnchor: [22, 48]
            });

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
          } catch (err) {
            // Silently fail
          }
        }

        activeMembers.forEach(member => {
          try {
            if (!isMountedRef.current || !map._container) return;
            if (member.uid === profile?.uid) return; // Don't show self twice
            if (typeof member.latitude !== 'number' || typeof member.longitude !== 'number' || isNaN(member.latitude) || isNaN(member.longitude)) return;
            
            const key = `member_${member.uid}`;
            activeKeys.add(key);

            const isOjol = member.role === 'Ojol' || (member.displayName || '').toLowerCase().includes('ojol');
            const badgeEmoji = isOjol ? '🛵' : '👤';
            const roleText = member.role || 'Warga';

            const icon = L.divIcon({
              html: `
                <div class="flex flex-col items-center">
                  <div class="relative flex items-center justify-center w-7 h-7 rounded-full ${
                    isOjol 
                      ? 'bg-emerald-500 border border-white text-white' 
                      : 'bg-cyan-500 border border-white text-white'
                  } shadow-lg ring-2 ${isOjol ? 'ring-emerald-200' : 'ring-cyan-200'}">
                    <span class="text-[11px]">${badgeEmoji}</span>
                    <span class="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-green-400 border border-white animate-ping"></span>
                  </div>
                  <div class="bg-slate-950/95 text-[8px] font-black text-white px-1 py-0.5 rounded shadow-md mt-0.5 whitespace-nowrap scale-90 origin-top tracking-tighter">
                    ${member.displayName}
                  </div>
                </div>
              `,
              className: 'custom-leaflet-marker',
              iconSize: [40, 44],
              iconAnchor: [20, 44]
            });

            const latlng = [member.latitude, member.longitude];
            const popupContent = `
              <div class="p-1 min-w-[140px] font-sans">
                <div class="flex items-center gap-1">
                  <span class="text-[10px]">${badgeEmoji}</span>
                  <h5 class="font-black text-[10px] uppercase text-slate-900 leading-tight">${member.displayName}</h5>
                </div>
                <p class="text-[8px] font-mono font-bold text-slate-400 uppercase mt-0.5">${roleText}</p>
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
          } catch (err) {
            // Silently fail
          }
        });
      }

      // Remove stale markers that are no longer active
      Object.keys(markersRef.current).forEach(key => {
        if (!activeKeys.has(key)) {
          const marker = markersRef.current[key];
          if (marker) {
            try {
              layerGroup.removeLayer(marker);
            } catch (err) {
              // Ignore
            }
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


  // Handle Centering map to current location manually
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
        } else {
          showToast("❌ GPS memberikan koordinat tidak valid");
        }
      },
      () => {
        showToast("❌ Gagal menjangkau GPS Anda");
      }
    );
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200 mb-3 h-[350px] relative flex flex-col">
      {/* Map Control Header overlay */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 shadow-sm flex items-center gap-1.5 pointer-events-auto">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-wider text-green-400 font-mono">Radar GPS Aktif</span>
        </div>

        <div className="flex gap-1.5 pointer-events-auto">
          {/* Quick Filter Controls */}
          <button
            onClick={() => setShowMembers(prev => !prev)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold uppercase transition-all shadow-sm border ${
              showMembers 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-white text-slate-400 border-slate-100 line-through'
            }`}
          >
            <Users size={10} />
            <span>Anggota / Ojol ({activeMembers.length})</span>
          </button>

          <button
            onClick={() => setShowIncidents(prev => !prev)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-bold uppercase transition-all shadow-sm border ${
              showIncidents 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-white text-slate-400 border-slate-100 line-through'
            }`}
          >
            <AlertTriangle size={10} />
            <span>Laporan ({alerts.length})</span>
          </button>

          <button
            onClick={handleRecenter}
            className="flex items-center justify-center w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            title="Temukan Saya"
          >
            <Navigation size={11} className="transform rotate-45 text-cyan-600" />
          </button>
        </div>
      </div>

      {/* Leaflet DOM container */}
      <div ref={mapRef} className="w-full h-full bg-slate-50 relative z-10" />

      {/* Overlay Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-30">
          <div className="flex flex-col items-center gap-1.5 bg-white p-3 rounded-xl border border-slate-100 shadow-lg">
            <Loader2 className="animate-spin text-cyan-600" size={18} />
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest font-mono">Menghubungkan GPS...</span>
          </div>
        </div>
      )}

      {/* Footnote status overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg border border-slate-200 shadow-sm pointer-events-none">
        <span className="text-[7px] font-bold text-slate-500 uppercase tracking-wide font-mono">
          Free OpenStreetMap • Real-Time GPS Active ({activeMembers.length + alerts.length} Pins)
        </span>
      </div>
    </div>
  );
}
