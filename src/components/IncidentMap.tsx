import React, { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef, useMap } from '@vis.gl/react-google-maps';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, AlertTriangle, Construction, Map as MapIcon, Loader2, Layers, MapPin as MapPinIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const INCIDENT_ICONS: Record<string, any> = {
  traffic: Construction,
  accident: AlertCircle,
  roadblock: AlertTriangle,
};

const SEVERITY_COLORS: Record<string, string> = {
  high: '#ef4444', // rose-500
  medium: '#f59e0b', // amber-500
  low: '#3b82f6', // blue-500
};

// Heatmap Layer Component
function HeatmapLayer({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !(window as any).google?.maps?.visualization) return;

    const google = (window as any).google;
    const heatmapData = points.map(
      (p) => new google.maps.LatLng(p.lat, p.lng)
    );

    const layer = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map,
      radius: 30,
      opacity: 0.8,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)',
      ],
    });

    return () => {
      layer.setMap(null);
    };
  }, [map, points]);

  return null;
}

function MarkerWithInfo({ alert }: { alert: any }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [isOpen, setIsOpen] = useState(false);
  const Icon = INCIDENT_ICONS[alert.incidentType] || AlertCircle;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={alert.location}
        onClick={() => setIsOpen(true)}
      >
        <Pin 
          background={SEVERITY_COLORS[alert.severity] || '#3b82f6'} 
          glyphColor="#fff"
          borderColor="#fff"
        />
      </AdvancedMarker>
      {isOpen && (
        <InfoWindow anchor={marker} onCloseClick={() => setIsOpen(false)}>
          <div className="p-1 max-w-[200px]">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={14} className="text-gray-900" />
              <h4 className="text-[10px] font-black uppercase tracking-tight">{alert.title}</h4>
            </div>
            <p className="text-[9px] text-gray-500 leading-tight mb-1">{alert.description}</p>
            <div className="flex items-center justify-between border-t border-gray-50 pt-1 mt-1">
              <span className="text-[8px] font-bold text-gray-400 uppercase">Oleh: {alert.userName}</span>
              <span className="text-[8px] font-bold text-gray-400 uppercase">
                {alert.createdAt?.toDate ? new Date(alert.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
              </span>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function IncidentMap() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');
  const [filterType, setFilterType] = useState<string>('all');
  const [center, setCenter] = useState({ lat: -6.2088, lng: 106.8456 }); // Default Jakarta

  useEffect(() => {
    if (!profile?.tenantId) return;

    // Fetch alerts from last 24 hours with location
    const q = query(
      collection(db, 'social_alerts'),
      where('tenantId', '==', profile.tenantId),
      where('type', '==', 'incident'),
      orderBy('createdAt', 'desc'),
      limit(100) // Increase limit for better heatmap visualization
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .filter((item: any) => item.location && item.location.lat && item.location.lng);
      
      setAlerts(data);
      
      // Update center to last alert if available
      if (data.length > 0) {
        setCenter(data[0].location);
      } else {
        // Try to get user current position for center
        navigator.geolocation.getCurrentPosition(
          (pos) => setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => {}
        );
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [profile?.tenantId]);

  const filteredAlerts = useMemo(() => {
    if (filterType === 'all') return alerts;
    return alerts.filter(a => a.incidentType === filterType);
  }, [alerts, filterType]);

  const heatmapPoints = useMemo(() => {
    return filteredAlerts.map(a => a.location);
  }, [filteredAlerts]);

  if (!hasValidKey) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center mb-4">
        <MapIcon size={32} className="mx-auto text-gray-300 mb-2" />
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Peta Pantauan Jalan</h3>
        <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">Fitur peta memerlukan Google Maps API Key untuk diaktifkan.</p>
        <div className="text-left bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
          <p className="text-[10px] font-bold text-gray-700 uppercase">Cara Aktivasi:</p>
          <ol className="text-[10px] text-gray-500 space-y-1 list-decimal ml-4">
            <li>Dapatkan API Key di Google Cloud Console.</li>
            <li>Buka <strong>Settings</strong> (ikon gear) → <strong>Secrets</strong>.</li>
            <li>Tambah <code>GOOGLE_MAPS_PLATFORM_KEY</code> dan simpan.</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4 h-[350px] relative">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-100 shadow-sm flex items-center gap-1.5">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-tight text-gray-900">Radar Pantauan Aktif</span>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-100 shadow-sm flex gap-1 pointer-events-auto">
          <button
            onClick={() => setViewMode('markers')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
              viewMode === 'markers' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <MapPinIcon size={10} />
            <span className="text-[9px] font-black uppercase">Pin</span>
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${
              viewMode === 'heatmap' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Layers size={10} />
            <span className="text-[9px] font-black uppercase">Heatmap</span>
          </button>
        </div>
      </div>

      {/* Map Footer Filtering */}
      <div className="absolute bottom-3 left-3 z-10 flex gap-1.5 pointer-events-auto">
        <button 
          onClick={() => setFilterType('all')}
          className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${filterType === 'all' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-500 shadow-sm'}`}
        >
          Semua
        </button>
        {Object.entries(INCIDENT_ICONS).map(([id, Icon]) => (
          <button 
            key={id}
            onClick={() => setFilterType(id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${filterType === id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-500 shadow-sm'}`}
          >
            <Icon size={10} />
            {id}
          </button>
        ))}
      </div>

      <APIProvider apiKey={API_KEY} libraries={['visualization']}>
        <Map
          defaultCenter={center}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          disableDefaultUI={true}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {viewMode === 'markers' ? (
            filteredAlerts.map(alert => (
              <MarkerWithInfo key={alert.id} alert={alert} />
            ))
          ) : (
            <HeatmapLayer points={heatmapPoints} />
          )}
        </Map>
      </APIProvider>

      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-20">
          <Loader2 className="animate-spin text-blue-600" size={24} />
        </div>
      )}

      {alerts.length === 0 && !loading && (
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-center shadow-lg animate-bounce">
          Belum ada laporan di sekitar. Klik tombol di atas untuk melapor!
        </div>
      )}

      <div className="absolute bottom-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Data 24 Jam Terakhir</span>
      </div>
    </div>
  );
}

