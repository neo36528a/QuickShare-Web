# QuickShare - Production-Ready Temporary File Sharing Platform (Google Drive Storage)

![QuickShare Banner](https://img.shields.io/badge/QuickShare-Google%20Drive%20API-6366f1?style=for-the-badge&logo=googledrive)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?style=for-the-badge&logo=typescript)
![Express](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?style=for-the-badge&logo=docker)

**QuickShare** is a secure, high-capacity temporary file sharing web application. Users can upload files up to **5 GB**, which are stored directly in a designated **Google Drive** folder (`QuickShare Uploads`) using the official Google Drive API. Every upload generates a secure download link with a strictly enforced **30-minute expiration**. A background worker automatically purges expired files from Google Drive and PostgreSQL every 60 seconds.

---

## Key Features

- 📁 **Files Up to 5 GB**: Support for large files including Videos, ZIPs, ISOs, Documents, APKs, and Images.
- ☁️ **Google Drive Storage**: Files stored in an isolated `QuickShare Uploads` folder using OAuth 2.0.
- ⏱️ **30-Minute Expiration**: Live ticking countdown timer and automated 60-second background cleanup cron worker.
- 🔄 **Resumable Chunked Uploads**: Progress tracking (MB/s speed, ETA, percentage) with Pause, Resume, and Cancel capabilities.
- 🔒 **Security Controls**: Optional bcrypt password protection, Download-Once auto-destruct links, Helmet security headers, SQL injection protection, and rate limiting.
- 📱 **QR Code Sharing**: Instant QR code modal for mobile camera scanning.
- 📊 **Admin Dashboard**: Storage quota progress bar, active/expired file explorer, search, manual deletion, and cleanup execution logs.
- 🎨 **Glassmorphic UI**: Vibrant dark/light theme designed with Tailwind CSS, Framer Motion, and Lucide icons.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, Google Drive API (`googleapis`), `node-cron`, Winston |
| **Database** | PostgreSQL 16 (`pg`) |
| **Infrastructure** | Docker, Docker Compose, Nginx |

---

## Getting Started Locally

### 1. Prerequisites
- Node.js (v20+)
- PostgreSQL installed locally OR Docker Desktop

### 2. Environment Setup
Copy the template `.env.example` to `.env`:

```bash
cp .env.example .env
```

To configure Google Drive API integration, follow our step-by-step guide in [`GOOGLE_DRIVE_SETUP.md`](./GOOGLE_DRIVE_SETUP.md).

### 3. Run Development Mode

**Backend**:
```bash
cd backend
npm install
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Docker One-Command Setup

To spin up the entire production environment with Postgres, Backend, Next.js Frontend, and Nginx:

```bash
docker-compose up --build
```

Access the app at `http://localhost`.

---

## API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/upload` | Upload single file up to 5 GB to Google Drive |
| `POST` | `/api/upload/resumable-init` | Initiate resumable chunk upload session |
| `GET` | `/api/download/:token` | Fetch file metadata & expiration status |
| `POST` | `/api/download/:token/verify-password` | Verify link password |
| `GET` | `/api/download/:token/file` | Stream file content directly from Google Drive |
| `DELETE` | `/api/cleanup` | Manually trigger 30-min expired file purge |
| `GET` | `/api/stats` | Fetch storage quota & system metrics |
| `GET` | `/api/admin/overview` | Fetch admin dashboard analytics & cleanup logs |
| `DELETE` | `/api/admin/files/:id` | Admin file deletion |
| `GET` | `/api/health` | Health check endpoint |

---

## Documentation Links

- [Google Drive Setup Guide](GOOGLE_DRIVE_SETUP.md)
- [System Architecture & Design](ARCHITECTURE.md)
- [Production Deployment Guide](DEPLOYMENT.md)

---

## License

MIT License. Built for production-ready temporary cloud file distribution.
