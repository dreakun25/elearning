# Self-Hosting vs Online Hosting — Setup & Costs

---

## Overview

For an e-learning platform (Next.js + PostgreSQL + Prisma + Stripe) as described in the project plan, here is a detailed comparison of self-hosting vs online/cloud hosting.

---

## Option 1: Self-Hosting

### What You Need

| Component | Requirement |
|-----------|-------------|
| **Server** | Dedicated machine or VPS (Virtual Private Server) |
| **OS** | Ubuntu 22.04 LTS (recommended) |
| **Database** | PostgreSQL (self-installed) |
| **Storage** | Additional HDD/SSD for video files |
| **Domain** | Custom domain + SSL certificate |
| **Static IP** | Required for DNS + email delivery |
| **Backup** | External drive or separate VPS for backups |
| **Maintenance** | Regular updates, security patches, monitoring |

### Recommended Hardware

| Scale | Students | RAM | CPU | Storage | Approx Monthly Cost |
|-------|----------|-----|-----|---------|-------------------|
| **Small** | < 500 | 4 GB | 2 vCPU | 80 GB SSD | €10–€15 |
| **Medium** | 500–5,000 | 8 GB | 4 vCPU | 160 GB SSD | €25–€40 |
| **Large** | 5,000–20,000 | 16 GB | 6 vCPU | 320 GB SSD | €50–€80 |

### Setup Steps

```bash
# 1. Provision VPS (e.g., Hetzner, Netcup, OVHcloud — Greek-friendly EU providers)
ssh root@your-server-ip

# 2. System updates
apt update && apt upgrade -y

# 3. Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 4. Install PostgreSQL
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# 5. Install Nginx (reverse proxy)
apt install -y nginx certbot python3-certbot-nginx
systemctl start nginx

# 6. Clone & build app
git clone https://github.com/your-org/elearning.git /var/www/elearning
cd /var/www/elearning
npm install
npm run build

# 7. Set up PM2 (process manager)
npm install -g pm2
pm2 start npm --name "elearning" -- start
pm2 startup systemd
pm2 save

# 8. Configure Nginx reverse proxy
cat > /etc/nginx/sites-available/elearning << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 9. Enable site & SSL
ln -s /etc/nginx/sites-available/elearning /etc/nginx/sites-enabled/
certbot --nginx -d yourdomain.com

# 10. Set up firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### Ongoing Maintenance (Monthly)

| Task | Frequency | Time |
|------|-----------|------|
| Security updates (`apt upgrade`) | Weekly | 10 min |
| PostgreSQL vacuum/analyze | Weekly | 5 min |
| SSL renewal (auto via certbot) | Every 60 days | Automatic |
| Log rotation check | Monthly | 5 min |
| Backup verification | Monthly | 15 min |
| Node.js/package updates | Monthly | 30 min |
| Server monitoring check | Weekly | 5 min |
| **Total monthly maintenance** | | **~2 hours** |

### Estimated Monthly Cost Breakdown (Medium Scale)

| Item | Cost (€/month) |
|------|---------------|
| VPS (Hetzner CX31 — 8 GB, 4 vCPU, 160 GB) | ~€25 |
| Domain name (annual, amortized) | ~€1 |
| SMTP service (for transactional emails) | ~€5 |
| Backup storage (separate VPS or S3) | ~€5 |
| SSL certificate | Free (Let's Encrypt) |
| **Total** | **~€36/month** |

---

## Option 2: Online/Cloud Hosting

### Recommended Stack

| Component | Service | Free Tier | Paid Starting At |
|-----------|---------|-----------|-----------------|
| **Frontend + API** | Vercel | ✅ Yes | €20/month (Pro) |
| **Database** | Supabase | ✅ Yes (500 MB) | €25/month (Pro) |
| **File/Video Storage** | Cloudflare R2 | ✅ Yes (10 GB) | €0.015/GB/month |
| **Email** | Resend | ✅ Yes (100/day) | €10/month |
| **Monitoring** | Sentry | ✅ Yes | €26/month (Team) |
| **CDN** | Cloudflare | ✅ Yes (free plan) | Free |
| **Total (Pro, no free tier)** | | | **~€55–€80/month** |

### Vercel Setup (Frontend + API)

```
1. Push code to GitHub repository
2. Go to https://vercel.com → Import Git repo
3. Set environment variables:
   - DATABASE_URL (Supabase connection string)
   - STRIPE_SECRET_KEY
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
4. Deploy — Vercel auto-detects Next.js
5. Configure custom domain in Vercel Dashboard
6. Enable HTTPS (automatic with Vercel)
```

### Supabase Setup (Database)

```
1. Go to https://supabase.com → Create project
2. Choose region: Frankfurt (eu-central-1) — closest to Greece
3. Run migration scripts in Supabase SQL Editor
4. Copy connection string to Vercel env vars
```

### Cloudflare R2 Setup (File Storage)

```
1. Create Cloudflare account → R2 → Create bucket
2. Generate API token with read/write permissions
3. Configure CORS rules for your domain
4. Use S3-compatible SDK to upload files
5. No egress fees (unlike AWS S3)
```

---

## Comparison: Self-Hosted vs Cloud

| Factor | Self-Hosted (VPS) | Cloud (Vercel + Supabase) |
|--------|-------------------|--------------------------|
| **Monthly cost (small)** | ~€15 | Free |
| **Monthly cost (medium)** | ~€36 | ~€55–€80 |
| **Monthly cost (large)** | ~€70 | ~€150–€250 |
| **Setup time** | 4–8 hours | 30–60 minutes |
| **Maintenance time** | ~2 hours/month | ~15 min/month |
| **Scaling** | Manual (resize VPS) | Automatic |
| **Uptime SLA** | Your responsibility | 99.99% (platform guarantee) |
| **Security patches** | You handle | Handled by provider |
| **Backups** | You configure | Built-in (Supabase PITR) |
| **DDoS protection** | Manual (fail2ban, etc.) | Built-in (Cloudflare) |
| **Learning curve** | Steep | Low |
| **Full control** | ✅ Yes | ⚠️ Limited |
| **Vendor lock-in** | None | Moderate |

---

## Hybrid Approach (Recommended)

For a Greek e-learning platform starting out, this hybrid model offers the best balance:

```
Frontend (Next.js)  →  Vercel (free tier → €20 Pro)
Database            →  Supabase (free tier → €25 Pro)  
File Storage        →  Cloudflare R2 (free 10 GB)
Email               →  Resend (free 100/day → €10)
Domain              →  any .gr domain (~€15/year)
Payments            →  Stripe (free to integrate)
Monitoring          →  Sentry (free tier)
CDN                 →  Cloudflare (free)
```

**Starting cost: ~€0–€5/month** (within free tiers)
**Scaling to medium: ~€55–€80/month** (paid tiers)

### When to Switch to Self-Hosting

| Scenario | Action |
|----------|--------|
| Cloud costs exceed €150/month | Evaluate self-hosting |
| Need PCI-DSS Level 1 compliance | Self-host or enterprise cloud |
| Custom infrastructure requirements | Self-host |
| High video bandwidth (>5 TB/month) | Self-host with dedicated storage |
| Team has DevOps expertise | Self-host |

---

## Summary Cost Projection (First Year)

### Cloud (Recommended Start)

| Month(s) | Tier | Monthly Cost | Year Total |
|----------|------|-------------|------------|
| 1–3 (MVP/Testing) | Free tiers | €0 | €0 |
| 4–6 (Beta, < 100 users) | Mix free + entry | ~€10 | ~€30 |
| 7–12 (Growth, < 1000 users) | Paid tiers | ~€55 | ~€330 |
| **Year 1 Total (Cloud)** | | | **~€360** |

### Self-Hosted

| Month(s) | Tier | Monthly Cost | Year Total |
|----------|------|-------------|------------|
| 1 (Setup) | VPS + setup time | ~€25 | ~€25 |
| 2–12 (Running) | VPS + maintenance | ~€36 | ~€396 |
| **Year 1 Total (Self-Hosted)** | | | **~€421** |

> **Verdict**: Start with cloud (Vercel + Supabase). The free tiers let you validate the idea at zero cost, and the time saved on maintenance is better spent on building features and getting users. Migrate to self-hosting only when cloud costs exceed ~€150/month.
