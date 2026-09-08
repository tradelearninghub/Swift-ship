# Deploying Swift Ship Courier to Hostinger Node.js Hosting

Complete, step-by-step guide to deploying the **Swift Ship Courier & Multi-Courier Tracking Platform** to Hostinger Node.js Hosting with automated database creation and zero-touch setup.

---

## 🌟 Automated Database Features

1. **Standalone SQL Schema & Seed File ([`database.sql`](file:///c:/Users/aloks/Work/LMS/Delivery_web/database.sql))**:
   - Contains all table definitions (`CREATE TABLE IF NOT EXISTS`), indices, foreign keys, and initial seed data (roles, permissions, default Super Admin, courier partners, and company settings).
   - Can also be imported directly via **Hostinger phpMyAdmin** in 1 click if desired.

2. **Automated One-Command Build Initialization ([`scripts/init-db.js`](file:///c:/Users/aloks/Work/LMS/Delivery_web/scripts/init-db.js))**:
   - When Hostinger runs `npm run build`, `scripts/init-db.js` runs automatically.
   - It checks if tables exist. If not, it creates them and seeds initial data.
   - It is completely **idempotent** (safe to run repeatedly without duplicate data errors).
   - If the database is not accessible during the build phase, it gracefully proceeds with `next build` and runs the initialization automatically when `server.js` starts.

---

## Prerequisites

1. **Hostinger Hosting Plan**: Business Web Hosting, Cloud Hosting, or VPS with Node.js support.
2. **Node.js**: Version 18.x or 20.x selected in hPanel.
3. **MySQL Database**: Created in Hostinger hPanel.
4. **Git**: Installed locally.

---

## Step 1: Create Local MySQL Database in Hostinger hPanel

1. Log into your **Hostinger hPanel**.
2. Navigate to **Databases** → **MySQL Databases**.
3. Create a new MySQL database:
   - **MySQL Database name**: `swiftship` (hPanel will prefix this, e.g. `u123456789_swiftship`)
   - **MySQL Username**: `swiftuser` (hPanel will prefix this, e.g. `u123456789_swiftuser`)
   - **Password**: Generate a strong password.
4. Note down the full credentials:
   - **Host**: `localhost` (or `127.0.0.1`)
   - **Port**: `3306`
   - **Database Name**: `u123456789_swiftship`
   - **Username**: `u123456789_swiftuser`
   - **Password**: `<your-strong-password>`

---

## Step 2: Configure Environment Variables

In **hPanel** → **Advanced** → **Environment Variables** (or create a `.env` file in the project root):

```env
# Server Configuration
NODE_ENV="production"
PORT=3000
HOSTNAME="0.0.0.0"

# Local Hostinger MySQL Database URL
DATABASE_URL="mysql://u123456789_swiftuser:YOUR_PASSWORD@localhost:3306/u123456789_swiftship?connection_limit=5"

# Domain URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
APP_URL="https://yourdomain.com"

# Application Security Keys
AUTH_SECRET="generate-32-char-random-string"
JWT_SECRET="generate-32-char-random-string"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Hostinger SMTP Email Configuration (Optional but recommended)
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_USER="support@yourdomain.com"
SMTP_PASS="your-email-password"
SMTP_FROM_EMAIL="support@yourdomain.com"
SMTP_FROM_NAME="Swift Ship Courier"
```

---

## Step 3: Git Commit & Hostinger Deployment

1. Commit and push everything to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure Hostinger deployment with automated database initialization"
   git push origin main
   ```

2. In Hostinger hPanel:
   - Go to **Advanced** → **Git**
   - Connect your GitHub repository URL and branch (`main`)
   - Click **Deploy**

3. In **hPanel** → **Node.js**:
   - **Node.js Version**: `18.x` or `20.x`
   - **Application Root**: Project directory (e.g. `/domains/yourdomain.com/public_html`)
   - **Application Startup File**: `server.js`
   - **Build Command**: `npm run build`
   - Click **Start / Restart Application**

The build command will automatically run `node scripts/init-db.js` and `next build`, creating all tables and seeding default data in your local MySQL database.

---

## Default Login Credentials

- **Primary Super Admin Email**: `admin@sscourierservice.in`
- **Mobile Identifier**: `8000151117`
- **Fallback Email**: `admin@swiftship.com`
- **Default Password**: `Admin@12345`
- **Admin Portal URL**: `https://sscourierservice.in/admin/login`
- **Customer Portal URL**: `https://sscourierservice.in/login`

*(Please change the default password after your first login via the Admin Settings)*

---

## Manual Database Setup (Optional Fallback)

If you prefer to import the database manually via phpMyAdmin:
1. Open **hPanel** → **Databases** → **phpMyAdmin** for your database.
2. Click **Import** tab.
3. Select the file [`database.sql`](file:///c:/Users/aloks/Work/LMS/Delivery_web/database.sql) from this project root.
4. Click **Go / Import**.
