# frontend/Dockerfile

# Node.jsの安定版を使用
FROM node:20-alpine

# 作業ディレクトリの設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# ソースコードのコピー
COPY . .

# React開発サーバーの起動 (Viteの場合は "npm run dev" などに合わせて変更)
CMD ["npm", "run", "dev", "--", "--host"]