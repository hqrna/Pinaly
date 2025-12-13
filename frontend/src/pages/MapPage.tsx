import { useState, useCallback, useEffect } from 'react';
import { MapView } from '../components/Map/MapView';
import { UploadModal } from '../components/Upload/UploadModal';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';
import type { Pin } from '../types';
import L from 'leaflet';

// ------------------------------------------------------------------
// MapPage：地図表示、ピンの取得、投稿モーダルの管理を行うメイン画面
// ------------------------------------------------------------------

export const MapPage = () => {

  // --- Hooks & States ---
  const { logout } = useAuth();

  // 地図データ
  const [pins, setPins] = useState<Pin[]>([]);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([35.681236, 139.767125]);  // 初期位置は東京駅
  const [currentBounds, setCurrentBounds] = useState<L.LatLngBounds | null>(null);

  // UI状態
  const [isLoadingLocation, setIsLoadingLocation] = useState(!!navigator.geolocation);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Effects ---
  // 現在地を取得
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 成功: 現在地をセット、ローディング終了
        const { latitude, longitude } = position.coords;
        setCurrentLocation([latitude, longitude]);
        setIsLoadingLocation(false);
      },
      (error) => {
        // 失敗: デフォルト位置のままローディング終了
        console.warn("現在地の取得に失敗:", error);
        setIsLoadingLocation(false);
      }
    );
  }, []);

  // --- Handlers ---
  // 地図範囲内のピン画像を取得
  const fetchPins = useCallback(async (bounds: L.LatLngBounds) => {
    setCurrentBounds(bounds);
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

  // アップロード完了時のリフレッシュ処理
  const handleUploadSuccess = () => {
    if (currentBounds) {
      fetchPins(currentBounds);
    }
  };

  // --- Render ---
  // ロケーション取得中は待機画面
  if (isLoadingLocation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>現在地を取得中...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>

      {/* Header Controls (ログアウト等) */}
      <div style={{
        position: 'absolute', top: 10, right: 10, zIndex: 1000,
        background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        <button onClick={logout}>ログアウト</button>
      </div>
      <MapView 
        pins={pins} 
        center={currentLocation}
        onBoundsChange={fetchPins} 
      />

      {/* 投稿ボタン (FAB) */}
      <button 
        className="fab-button" 
        onClick={() => setIsModalOpen(true)}
      >
        +
      </button>

      {/* アップロードモーダル */}
      <UploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUploadSuccess={handleUploadSuccess} 
      />

    </div>
  );
};