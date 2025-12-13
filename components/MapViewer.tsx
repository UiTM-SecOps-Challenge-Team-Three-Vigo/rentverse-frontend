'use client';

import React, { useRef, useEffect, useCallback, memo, useState } from 'react';
import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

interface MapViewerProps {
  center?: { lng: number; lat: number };
  zoom?: number;
  // ✅ FIX: Allow style to be string OR object (any) to match maptilersdk.MapStyle.STREETS
  style?: string | any; 
  className?: string;
  height?: string;
  width?: string;
  markers?: Array<{
    lng: number;
    lat: number;
    popup?: string;
    color?: string;
  }>;
  onMapLoad?: (map: maptilersdk.Map) => void;
  onMapClick?: (coordinates: { lng: number; lat: number }) => void;
  interactive?: boolean;
}

const MapViewer = memo(function MapViewer({
  center = { lng: 101.6869, lat: 3.1390 }, // Default to KL
  zoom = 10,
  style = maptilersdk.MapStyle.STREETS, // Now compatible with the interface
  className = '',
  height = '100%',
  width = '100%',
  markers = [],
  onMapLoad,
  onMapClick,
  interactive = true,
}: MapViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maptilersdk.Map | null>(null);
  const markersRef = useRef<maptilersdk.Marker[]>([]);
  const isMapLoaded = useRef(false);
  const [apiKey] = useState(process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '');

  // 1. Set API Key
  useEffect(() => {
    if (apiKey) {
      maptilersdk.config.apiKey = apiKey;
    }
  }, [apiKey]);

  // 2. Clear Markers Helper
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  }, []);

  // 3. Add Markers Helper
  const addMarkers = useCallback(
    (mapInstance: maptilersdk.Map, markersData: typeof markers) => {
      clearMarkers();

      markersData.forEach((markerData) => {
        const marker = new maptilersdk.Marker({
          color: markerData.color || '#3B82F6',
        })
          .setLngLat([markerData.lng, markerData.lat])
          .addTo(mapInstance);

        if (markerData.popup) {
          const popup = new maptilersdk.Popup({ offset: 25 }).setHTML(
            markerData.popup
          );
          marker.setPopup(popup);
        }

        markersRef.current.push(marker);
      });
    },
    [clearMarkers]
  );

  // 4. Initialize Map (Run ONCE)
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maptilersdk.Map({
        container: mapContainer.current,
        style: style,
        center: [center.lng, center.lat],
        zoom: zoom,
        interactive: interactive,
      });

      map.current.on('load', () => {
        isMapLoaded.current = true;
        if (map.current && onMapLoad) {
          onMapLoad(map.current);
        }
        // Initial markers load
        if (map.current) {
             addMarkers(map.current, markers);
        }
      });

      if (onMapClick) {
        map.current.on('click', (e) => {
          onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      clearMarkers();
      if (map.current) {
        map.current.remove();
        map.current = null;
        isMapLoaded.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array = Only runs once on mount

  // 5. Reactive Updates
  useEffect(() => {
    if (map.current && isMapLoaded.current) {
      addMarkers(map.current, markers);
    }
  }, [markers, addMarkers]);

  useEffect(() => {
    if (map.current && isMapLoaded.current) {
      map.current.flyTo({
        center: [center.lng, center.lat],
        zoom: zoom,
      });
    }
  }, [center.lng, center.lat, zoom]);

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {!apiKey && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100 font-bold text-red-500">
          Missing MapTiler API Key
        </div>
      )}
      <div
        ref={mapContainer}
        className="h-full w-full overflow-hidden rounded-xl shadow-lg"
      />
    </div>
  );
});

export default MapViewer;