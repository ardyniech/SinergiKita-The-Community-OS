import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';

interface MapContainerProps {
  leafletLoaded: boolean;
  onMapReady: (map: any, layerGroup: any) => void;
}

export const MapContainer = forwardRef<HTMLDivElement, MapContainerProps>(({ leafletLoaded, onMapReady }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  useImperativeHandle(ref, () => mapRef.current as HTMLDivElement);

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    const L = (window as any).L;
    
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

    onMapReady(map, layerGroup);

    return () => {
      if (mapInstanceRef.current) {
        try {
          const map = mapInstanceRef.current;
          if (layerGroupRef.current) {
            layerGroupRef.current.clearLayers();
            layerGroupRef.current.remove();
          }
          map.remove();
        } catch (err) {
          console.warn("Error cleaning up map:", err);
        }
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, [leafletLoaded, onMapReady]);

  return <div ref={mapRef} className="w-full h-full bg-slate-50 relative z-10" />;
});
