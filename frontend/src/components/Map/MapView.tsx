import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import type { Pin } from '../../types';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// 地図の中心を移動させるためのコンポーネント
const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

// ... MapEvents, createIcon などはそのまま ...
const MapEvents = ({ onMoveEnd }: { onMoveEnd: (bounds: L.LatLngBounds) => void }) => {
  const map = useMapEvents({
    moveend: () => {
      onMoveEnd(map.getBounds());
    },
  });
  return null;
};

interface MapViewProps {
  pins: Pin[];
  center: [number, number];
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}

export const MapView = ({ pins, center, onBoundsChange }: MapViewProps) => {
  const navigate = useNavigate();

  const createIcon = (thumbnailUrl: string) => {
      return L.divIcon({
          className: '',
          html: `<div class="custom-marker-icon" style="background-image: url('${thumbnailUrl}'); width: 40px; height: 40px;"></div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
      });
  };

  return (
    <MapContainer 
      center={center}
      zoom={13} 
      scrollWheelZoom={true}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* 座標が変わったら移動させる */}
      <RecenterMap center={center} />
      
      <MapEvents onMoveEnd={onBoundsChange} />

      <CircleMarker 
        center={center} 
        radius={8} // 半径
        pathOptions={{ color: 'white', fillColor: '#4285F4', fillOpacity: 1, weight: 2 }}
      >
        <Popup>現在地</Popup>
      </CircleMarker>

      {pins.map((pin) => (
        <Marker 
          key={pin.id} 
          position={[pin.latitude, pin.longitude]}
          icon={createIcon(pin.thumbnail_url)} 
        >
          <Popup>
             <div style={{ textAlign: 'center' }}>
               {pin.thumbnail_url && (
                 <img src={pin.thumbnail_url} alt="thumb" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
               )}
               <p>{pin.title || 'No Title'}</p>
               <button onClick={() => navigate(`/images/${pin.id}`)}>詳細</button>
             </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};