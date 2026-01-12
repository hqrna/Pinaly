from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

def _get_decimal_from_dms(dms, ref):
    degrees = dms[0]
    minutes = dms[1]
    seconds = dms[2]
    decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
    if ref in ['S', 'W']:
        decimal = -decimal
    return decimal

def extract_exif_data(image: Image.Image):
    """画像から緯度・経度・撮影日時を抽出する純粋なユーティリティ"""
    exif_data = image._getexif()
    if not exif_data:
        return None, None, None
    gps_info = {}
    taken_at = None
    for tag, value in exif_data.items():
        tag_name = TAGS.get(tag, tag)
        if tag_name == "DateTimeOriginal":
            try:
                taken_at = datetime.strptime(value, "%Y:%m:%d %H:%M:%S")
            except:
                pass
        if tag_name == "GPSInfo":
            for t in value:
                sub_tag = GPSTAGS.get(t, t)
                gps_info[sub_tag] = value[t]
    lat, lon = None, None
    if gps_info:
        if "GPSLatitude" in gps_info and "GPSLatitudeRef" in gps_info:
            lat = _get_decimal_from_dms(gps_info["GPSLatitude"], gps_info["GPSLatitudeRef"])
        if "GPSLongitude" in gps_info and "GPSLongitudeRef" in gps_info:
            lon = _get_decimal_from_dms(gps_info["GPSLongitude"], gps_info["GPSLongitudeRef"])
    return lat, lon, taken_at
