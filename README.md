# Pinaly
**AIによる位置推定機能を搭載した、思い出を地図に残すフォトギャラリーアプリ**

[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

## 概要
**Pinaly**は、撮影した写真を地図上にマッピングし、思い出を場所とともに振り返ることができるWebアプリケーションです。

GPS情報がある写真は自動でマッピングされ、**位置情報がない写真はAI（GeoCLIP）が風景から撮影場所を推定**してピン留めします。「いつ、どこで撮ったか」を地図上で直感的に管理できる新しいアルバム体験を提供します。

## 背景
写真を振り返る時、「どこで撮った写真だったか？」と疑問に思う瞬間があります。

しかし、撮影場所を確認するために地図アプリに移動して照らし合わせたり、そもそも位置情報が付いていない写真の場合は手がかりを探して画像検索をしなければならず、それが小さなストレスでした。

**「もっと手軽に、場所の記憶を補完したい」**。この課題を解決するために開発したのがPinalyです。

## 実装済み機能
現在のバージョンでは、以下のコア機能が利用可能です。

* **ユーザーアカウント管理** (Supabase Auth)
    * ユーザーごとのデータ分離とログイン機能の強化
* **フォトマップ**
    * GPS情報付きの写真は自動的に地図上にピン留めされます。
* **写真アップロード**
    * ローカル端末から写真をアップロードし、アプリ内に保存・表示します。

## 今後のロードマップ
現在、以下の機能を開発中です。

* [ ] **AI位置推定 (GeoCLIP)**
    * 位置情報を持たない写真をアップロードすると、AIが画像解析を行い、撮影場所（座標）を推定します。
* [ ] **ギャラリー・アルバム表示**
    * 地図上だけでなく、時系列やフォルダ分けした一覧表示モードの実装
* [ ] **撮影情報の詳細編集**
    * 撮影日時やメモなどを後から編集・追記する機能
* [ ] **フィルタリング機能**
    * 「2024年の写真」「東京の写真」などでピンを絞り込む機能

## 技術スタック

### Frontend
* **Framework:** React (Vite)
* **Language:** TypeScript
* **Map Library:** Leaflet (React-Leaflet)
* **Styling:** CSS Modules
* **HTTP Client:** Axios

### Backend & AI
* **Framework:** FastAPI (Python)
* **AI Model:** GeoCLIP (PyTorch) - 画像からの座標推定
* **Database / Auth:** Supabase (PostgreSQL)
* **Image Processing:** Pillow

### Infrastructure
* **Container:** Docker / Docker Compose

## 実行手順

Docker環境があれば、コマンド一つでローカル環境の構築が可能です。

### 前提条件
* Docker / Docker Compose がインストールされていること
* Supabase のプロジェクトを作成済みであること（URLとAnon Keyが必要です

### 1. リポジトリのクローン
```bash
git clone https://github.com/hqrna/pinaly.git
cd pinaly-app
```

### 2. 環境変数の設定
バックエンド・フロントエンドそれぞれのディレクトリに .env ファイルが必要です。 同梱されている見本ファイル（.env.example）をコピーして作成してください。

**Backend (.env) の作成**
```bash
cd backend
cp .env.example .env
```

**Frontend (.env) の作成**
```bash
cd frontend
cp .env.example .env
```

### 3. アプリケーションの起動

Docker Composeを使用して、フロントエンドとバックエンドを一括で起動します。
```bash
docker-compose up --build
```

起動後、以下のURLでアクセスできます。
* **Frontend:** http://localhost:5173
* **Backend API Docs:** http://localhost:8000/docs
