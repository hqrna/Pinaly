# --------------------
# Build Stage
# --------------------
# 依存関係のビルドに必要なツールを含むイメージ
FROM python:3.10-slim AS builder

WORKDIR /app

# 1. システム依存関係のインストール (build-essential, libgl1 など)
# - build-essentialはインストール後にすぐ削除する（不要な場合はこのRUN自体を削除）
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# 2. requirements.txt のコピーとインストール
# - このステップを独立させることで、requirements.txtが変更されない限りキャッシュが効く
COPY requirements.txt .
# --no-cache-dir はイメージサイズ削減のため維持
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# --------------------
# Final / Runtime Stage
# --------------------
# 最終実行環境。Build Stageでインストールしたライブラリのみを引き継ぐ
FROM python:3.10-slim AS runner

# 1. Build Stageでインストールしたシステム依存関係の再インストール
#    (libgl1など、実行時に必要なランタイムライブラリのみ)
#    build-essentialは不要なので含めない
RUN apt-get update && apt-get install -y \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Build StageからPython環境をコピー
#    インストール済みのライブラリ (.venvやsite-packagesなど) を引き継ぐ
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# 3. アプリケーションコードのコピー
COPY . .

# 4. エントリーポイント
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]