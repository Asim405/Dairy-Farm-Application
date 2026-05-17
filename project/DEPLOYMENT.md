# Dairy Farm Application - Deployment & APK Troubleshooting Guide

This guide will help you resolve the **Network Error** when running your Android APK, and walk you through deploying your backend and database to the cloud for free so that your app works on **any device, anywhere in the world**!

---

## 🔍 Part 1: Why does your APK show "Network Error"?

When you run your built APK on a physical Android device, a **"Network Error"** means your phone cannot reach your local backend server running on your PC. Here are the 4 main reasons why this happens:

### 1. PC and Phone are on Different Networks
* **The Cause:** Your phone and PC must be connected to the exact same local Wi-Fi router. 
* **The Fix:** If your phone is on cellular data (3G/4G/5G) or a different Wi-Fi network, it cannot reach your PC's private IP (like `192.168.100.9`). Make sure both are connected to the same Wi-Fi.

### 2. Your PC's Local IP Address Changed
* **The Cause:** Routers assign local IP addresses dynamically. If your PC restarted or reconnected to the Wi-Fi, its IP might have changed (e.g., from `192.168.100.9` to `192.168.100.15`).
* **The Fix:**
  1. Open Command Prompt on Windows and run `ipconfig`.
  2. Find your **IPv4 Address** (e.g., `192.168.100.X`).
  3. Verify it matches the IP in `frontend/src/config/api.js` exactly. If not, update it, rebuild the APK, and install it.

### 3. Windows Firewall is Blocking the Connection (Most Common!)
* **The Cause:** Windows Firewall blocks incoming network traffic on port `5000` (your backend port) by default. Your phone tries to talk to port `5000`, but your PC blocks it.
* **The Fix:**
  1. Open the Windows Start menu, type **Windows Defender Firewall with Advanced Security** and open it.
  2. Click **Inbound Rules** in the left sidebar.
  3. Click **New Rule...** in the right sidebar.
  4. Select **Port** and click Next.
  5. Select **TCP** and enter `5000` in **Specific local ports**. Click Next.
  6. Select **Allow the connection** and click Next.
  7. Keep all profiles checked (Domain, Private, Public) and click Next.
  8. Name it `Dairy Farm Backend Port 5000` and click **Finish**.

### 4. The Backend Server is Not Running on your PC
* **The Cause:** The APK depends on your backend to log in and fetch data. If the backend server isn't running, the app fails.
* **The Fix:** Ensure you opened a terminal in your backend directory and ran `npm start` (or `npm run dev`).

---

## 🚀 Part 2: Cloud Deployment (Make your APK work Everywhere!)

To make your mobile app production-ready so you don't have to keep your PC running or stay on the same Wi-Fi, you should deploy the database and backend to the cloud.

We will use **Render** (free hosting for Node.js backend) and **Clever Cloud** or **Aiven** (free hosting for MySQL).

```
[React Native APK on Phone] ---> (Render Node.js Backend) ---> (Clever Cloud / Aiven MySQL Database)
```

---

### Step 1: Create a Free Cloud MySQL Database

Since Render's free tier only includes PostgreSQL, we will use a dedicated free MySQL hosting provider. **Clever Cloud** is highly recommended because it is 100% free, requires no credit card, and is extremely fast to set up.

#### Option A: Clever Cloud (Recommended)
1. Go to [Clever Cloud](https://www.clever-cloud.com/) and Sign Up.
2. On your dashboard, click **Create...** -> **An add-on**.
3. Choose **MySQL** from the list of services.
4. Select the **Shared / Silly** plan (this is the **100% Free** plan, giving you up to 10MB which is perfect for this project).
5. Select a region (e.g., Paris or Montreal) and click **Next**.
6. Do not link it to an application yet—just name your database (e.g., `dairy-farm-db`) and click **Create**.
7. Once created, click on your MySQL add-on in the sidebar. You will see your database credentials:
   * **Host** (e.g., `u823hsdfhsd-mysql.services.clever-cloud.com`)
   * **Database Name** (e.g., `bl8238asdja`)
   * **User** (e.g., `u823hsdfhsd`)
   * **Password**
   * **Port** (`3306`)

#### Option B: Aiven.io
1. Go to [Aiven.io](https://aiven.io/) and register a free account.
2. Click **Create Service** and select **MySQL**.
3. Select the **Free Tier** plan.
4. Select a cloud provider region (e.g., AWS us-east-1 or Frankfurt) and click **Create Service**.
5. Wait a few minutes for it to initialize, then copy the Connection Parameters (Host, Port, User, Password, Database Name).

---

### Step 2: Import your Database Schema

You need to create your tables inside your new cloud database.

1. Download and open a free database client like [DBeaver](https://dbeaver.io/) or [HeidiSQL](https://www.heidisql.com/).
2. Create a new MySQL connection using the Host, User, Password, Database Name, and Port you obtained in **Step 1**.
3. Once connected to your cloud database, open the SQL Editor.
4. Copy the entire contents of your local database schema file:
   👉 `project/backend/queries/schema.sql`
5. Paste it into your database client's SQL Editor and **Execute All**.
6. (Optional) Run the seed script to populate demo data:
   👉 `project/backend/queries/seed.sql`

Your cloud database is now fully set up and ready! 🎉

---

### Step 3: Deploy your Backend on Render

1. Go to [Render.com](https://render.com) and log in using your **GitHub account**.
2. Click the blue **New +** button in the top right and select **Web Service**.
3. You will see a list of your GitHub repositories. Find and select your repository:
   👉 `Dairy-Farm-Application`
4. Configure the Web Service settings exactly like this:
   * **Name:** `dairy-farm-backend`
   * **Region:** (Choose the region closest to you, e.g., Singapore, Oregon, or Frankfurt)
   * **Branch:** `main`
   * **Root Directory:** `project/backend` ⚠️ *(CRITICAL! Since your backend folder is inside a subfolder, you MUST specify `project/backend` here so Render knows where to build and run your backend!)*
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Instance Type:** `Free`
5. Scroll down and click **Advanced** -> **Environment Variables**. Add these key-value pairs using the credentials from your cloud MySQL database:
   * `DB_HOST` = *(Your Cloud Database Host)*
   * `DB_USER` = *(Your Cloud Database User)*
   * `DB_PASSWORD` = *(Your Cloud Database Password)*
   * `DB_NAME` = *(Your Cloud Database Name)*
   * `DB_PORT` = `3306`
   * `PORT` = `10000`
   * `NODE_ENV` = `production`
   * `JWT_SECRET` = `asim_dairy_farm_secret_key_9988` *(Choose any long, random security string)*
   * `CORS_ORIGIN` = `*`
6. Click **Create Web Service**.

Render will now build your Express app and start the server. You can monitor the progress in the **Logs** console. 
Once successfully deployed, copy your public backend URL from the top of the Render dashboard (it will look like `https://dairy-farm-backend.onrender.com`).

---

### Step 4: Update Frontend and Rebuild APK

Now that your backend is live on the internet, let's point your mobile app to it!

1. Open `project/frontend/src/config/api.js` on your computer.
2. Update the `API_BASE_URL` to point to your new Render backend URL (make sure it ends with `/api`):
   ```javascript
   // Set your backend URL here.
   // Production URL: pointing to Render cloud backend!
   export const API_BASE_URL = 'https://dairy-farm-backend.onrender.com/api';
   export const TIMEOUT = 15000; // Increased timeout for free tier spin-ups
   ```
3. Save the file.
4. Commit and push the changes to your GitHub repository:
   ```bash
   git add project/frontend/src/config/api.js
   git commit -m "Update API URL to production Render endpoint"
   git push origin main
   ```
5. **Re-build your Android APK**! 
   * Now that your APK points to a public HTTPS cloud URL, it will connect instantly from **any phone, anywhere, on any internet connection (Wi-Fi or cellular data)**!
   * There are no firewall settings to worry about on your local PC anymore!

*Note: Render's Free Tier web services automatically go to "sleep" after 15 minutes of inactivity. When you open your app for the first time in a while, logging in might take **30-40 seconds** because the server is spinning back up. Once it is awake, all subsequent requests will respond instantly (under 1 second).*

---

## 🛠️ Verification & Troubleshooting Checklist

* [ ] **Verify Cloud DB Connection:** Ensure you can connect to your Clever Cloud/Aiven database via DBeaver/HeidiSQL.
* [ ] **Verify Table Schema:** Ensure all tables (`users`, `animals`, etc.) exist in the cloud database.
* [ ] **Verify Render Backend Health:** Open `https://dairy-farm-backend.onrender.com/api/health` in your web browser. It should return `{"message": "Server is running", ...}`.
* [ ] **Verify Login / Registration:** Register a new user in the app, then check your cloud database's `users` table to confirm the new record appears.
