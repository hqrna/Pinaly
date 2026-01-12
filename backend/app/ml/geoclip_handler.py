import torch
from PIL import Image
from geoclip import GeoCLIP
from geopy.geocoders import Nominatim
from geopy.exc import GeopyError
import httpx
from io import BytesIO
import logging

# ロガー設定
logger = logging.getLogger(__name__)

class GeoCLIPHandler:
    """
    GeoCLIPモデルを使用して画像から位置情報を推論し、
    逆ジオコーディングによって地名を取得するクラス。
    """
    
    def __init__(self):
        """
        モデルの初期化とデバイス設定。
        """
        self.device = torch.device("cpu")
        
        try:
            # GeoCLIPモデルのロード
            self.model = GeoCLIP().to(self.device)
            self.model.eval()            
            self.geolocator = Nominatim(user_agent="pinaly-app-hal")

        except Exception as e:
            logger.error(f"GeoCLIP load error: {e}")

    def get_geoname(self, lat: float, lon: float) -> str:
        """緯度経度から日本語の地名を取得"""
        try:
            location = self.geolocator.reverse((lat, lon), language='ja', timeout=10)
            return location.address if location else "不明な地点"
        except GeopyError as e:
            logger.warning(f"Geopy error for coords ({lat}, {lon}): {e}")
            return "位置情報取得エラー"

    async def predict_location(self, image_url: str, top_k: int = 3):
        """画像から位置を推論し、候補を返す"""
        
        # 画像のダウンロード
        async with httpx.AsyncClient() as client:
            resp = await client.get(image_url)
            if resp.status_code != 200:
                raise Exception("画像の取得に失敗しました")
            
            image_bytes = BytesIO(resp.content)

        # GeoCLIPによる推論
        with torch.no_grad():
            # top_k の座標と信頼度を取得
            top_pred_coords, top_pred_probs = self.model.predict(image_bytes, top_k=top_k)
            
        # 結果の整形と住所取得
        candidates = []
        for i in range(top_k):
            lat, lon = float(top_pred_coords[i][0]), float(top_pred_coords[i][1])
            candidates.append({
                "index": i + 1,
                "latitude": lat,
                "longitude": lon,
                "confidence": float(top_pred_probs[i]),
                "geoname": self.get_geoname(lat, lon)
            })
        return candidates

# インスタンス化
ml_engine = GeoCLIPHandler()