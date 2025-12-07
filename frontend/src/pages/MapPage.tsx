import { useState, useCallback, useEffect } from 'react';
import { MapView } from '../components/Map/MapView';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import type { Pin } from '../types/pin';
import L from 'leaflet';

export const MapPage = () => {
  const { logout } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  
  // 初期値は東京駅にしておくが、isLoadingでガードするので一瞬見えることはない
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([35.681236, 139.767125]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // 現在地を取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 成功: 現在地をセット
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setIsLoadingLocation(false);
        },
        (error) => {
          // 失敗: 東京のまま (エラーログだけ出す)
          console.warn("現在地の取得に失敗:", error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      // 非対応ブラウザ
      setIsLoadingLocation(false);
    }
  }, []);

  const fetchPins = useCallback(async (bounds: L.LatLngBounds) => {
    try {
      const params = {
        min_lat: bounds.getSouth(),
        max_lat: bounds.getNorth(),
        min_lon: bounds.getWest(),
        max_lon: bounds.getEast(),
      };
      const res = await api.get<Pin[]>('/pin/images', { params });
      setPins(res.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // ★位置情報取得中はローディング画面を出す
  if (isLoadingLocation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>現在地を取得中...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 1000,
        background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        <button onClick={logout}>ログアウト</button>
      </div>

      <MapView 
        pins={pins} 
        center={currentLocation} // ★取得済みの座標を渡す
        onBoundsChange={fetchPins} 
      />
    </div>
  );
};