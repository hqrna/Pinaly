# --------------------
# Build Stage
# --------------------
FROM python:3.10-slim AS builder

WORKDIR /app

ENV GIT_TERMINAL_PROMPT=0

# 1. システム依存関係のインストール
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# 2. requirements.txt のコピーとインストール
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# --------------------
# Final / Runtime Stage
# --------------------
FROM python:3.10-slim AS runner

# 1. Build Stageでインストールしたシステム依存関係の再インストール
RUN apt-get update && apt-get install -y \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Build StageからPython環境をコピー
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# 3. アプリケーションコードのコピー
COPY . .

# 4. エントリーポイント
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]