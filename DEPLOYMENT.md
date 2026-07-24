# QuickShare Production Deployment Guide

This guide describes how to deploy QuickShare on a cloud virtual server (AWS EC2, DigitalOcean Droplet, Hetzner, Linode) using Docker and Nginx.

---

## Prerequisites

- Ubuntu 22.04 LTS or 24.04 LTS server with root or sudo privileges
- Minimum 2 GB RAM, 20 GB Disk Space
- Docker & Docker Compose installed
- Domain name pointed to your server IP (e.g. `quickshare.yourdomain.com`)

---

## 1. Clone Repository & Setup Environment

```bash
git clone https://github.com/your-username/quickshare.git
cd quickshare

# Create production environment configuration
cp .env.example .env
nano .env
```

Set your Google OAuth Credentials:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=1//your-refresh-token
GOOGLE_DRIVE_FOLDER_NAME=QuickShare Uploads
ADMIN_API_KEY=your_secure_random_admin_key
```

---

## 2. Launch Container Environment with Docker Compose

```bash
docker-compose up --build -d
```

Verify containers are healthy:
```bash
docker-compose ps
```

You should see 4 running containers:
- `quickshare-postgres`
- `quickshare-backend`
- `quickshare-frontend`
- `quickshare-nginx`

---

## 3. Enable HTTPS (SSL / TLS) with Let's Encrypt Certbot

To enable HTTPS for your domain:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL Certificate
sudo certbot --nginx -d quickshare.yourdomain.com
```

---

## 4. Maintenance & Log Monitoring

- View combined logs:
  ```bash
  docker-compose logs -f
  ```
- View backend logs:
  ```bash
  docker-compose logs -f backend
  ```
- Trigger manual cleanup:
  ```bash
  curl -X DELETE http://localhost/api/cleanup
  ```
