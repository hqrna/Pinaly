# backend/Dockerfile

# PyTorchなどの重いライブラリを扱うため、slim版推奨（必要に応じてfull版に変更）
FROM python:3.10-slim

# 作業ディレクトリの設定
WORKDIR /app

# システム依存関係のインストール (OpenCV等が必要な場合に備えて)
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# 依存関係ファイルのコピーとインストール
COPY requirements.txt .
# GeoCLIPやPyTorchはインストールに時間がかかるため、キャッシュを活用
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ソースコードのコピー
COPY . .

# FastAPIサーバーの起動 (開発用: reloadあり, 本番用はreloadなし推奨)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]