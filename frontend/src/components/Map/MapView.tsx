import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import type { Pin } from '../../types';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

// ------------------------------------------------------------------
// Helper Components
// ------------------------------------------------------------------

// --- RecenterMap：props.centerが変更された時に、地図の視点を自動的に移動させるコンポーネント ---
const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

// --- MapEvents：地図のドラッグやズーム終了等のイベントを検知し、現在の表示範囲(bounds)を親へ通知する ---
const MapEvents = ({ onMoveEnd }: { onMoveEnd: (bounds: L.LatLngBounds) => void }) => {
  const map = useMapEvents({
    moveend: () => {
      onMoveEnd(map.getBounds());
    },
  });
  return null;
};

// ------------------------------------------------------------------
// Main Components
// ------------------------------------------------------------------

interface MapViewProps {
  pins: Pin[];
  center: [number, number];
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}

// ------------------------------------------------------------------
// MainView：Leafletを使用した地図表示、ピンの描画、現在地の表示を行う
// ------------------------------------------------------------------

export const MapView = ({ pins, center, onBoundsChange }: MapViewProps) => {

  // --- Hooks ---
  const navigate = useNavigate();

  // --- Helpers ---
  // カスタムマーカーアイコンの生成（L.divIconを使用して、CSSでスタイリング可能なHTMLマーカーを作成）
  const createIcon = (thumbnailUrl: string) => {
      return L.divIcon({
          className: '',
          html: `<div class="custom-marker-icon" style="background-image: url('${thumbnailUrl}'); width: 40px; height: 40px;"></div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
      });
  };

  // --- Render ---
  return (
    <MapContainer 
      center={center}
      zoom={13} 
      scrollWheelZoom={true}
      style={{ height: '100vh', width: '100%' }}
    >
      {/* ベース地図レイヤー (OpenStreetMap) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* 制御コンポーネント */}
      <RecenterMap center={center} />
      <MapEvents onMoveEnd={onBoundsChange} />

      {/* 現在地マーカー (青い丸) */}
      <CircleMarker 
        center={center} 
        radius={8}
        pathOptions={{ color: 'white', fillColor: '#4285F4', fillOpacity: 1, weight: 2 }}
      >
        <Popup>現在地</Popup>
      </CircleMarker>

      {/* 投稿ピンの描画 */}
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