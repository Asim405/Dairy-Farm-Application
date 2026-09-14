# Dairy Farm Manager (React Native + MySQL)

This is a full‑stack **Dairy Farm Manager** app based on your Figma screenshots (Sign in/Sign up, Home dashboard, Live Stock, Health, Production & Sales, Finance & Operations, Staff, Inventory, Crops, Settings).

## Tech stack

- **Frontend**: React Native (Expo)
- **Backend**: Node.js + Express
- **Database**: MySQL

## Project structure

```
project/
├── backend/
│   ├── config/db.js
│   ├── middleware/authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── animalsRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── productionRoutes.js
│   │   ├── financeRoutes.js
│   │   ├── staffRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── cropsRoutes.js
│   │   └── settingsRoutes.js
│   ├── queries/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── App.js
    ├── package.json
    └── src/
        ├── config/api.js
        ├── context/AuthContext.js
        ├── navigation/RootNavigator.js
        ├── services/apiClient.js
        └── screens/ (all app screens)
```

---

## Prerequisites

- Node.js **18+** recommended
- MySQL 8+
- Expo Go app (Android/iOS) or Android Studio Emulator

---

## Backend setup (Express + MySQL)

### 1) Install dependencies

```bash
cd project/backend
npm install
```

### 2) Create database + tables

Open MySQL and run:

```sql
CREATE DATABASE dairy_farm_manager;
USE dairy_farm_manager;
SOURCE queries/schema.sql;
-- Optional sample data:
SOURCE queries/seed.sql;
```

### 3) Configure environment variables

Copy example env:

```bash
copy .env.example .env
```

Update `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dairy_farm_manager
DB_PORT=3306
PORT=5000
JWT_SECRET=make_this_long_and_random_at_least_32_chars

# Cloudinary image upload configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4) Install the new Cloudinary dependency

```bash
npm install
```

This project now includes `cloudinary` and a `POST /api/uploads` endpoint that accepts an image file, uploads it to Cloudinary, and returns a public image URL.

### 5) Cloudinary setup

If you do not already have a Cloudinary account, follow the separate guide here:

- [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md)

### 6) Run backend

```bash
npm run dev
```

Backend runs at `http://localhost:5000` and health check at `GET /api/health`.

---

## Web deployment guide (new database + backend)

If your old database trial has expired, you can move the app to a new MySQL host and deploy the backend on Render.

### 1) Create a new MySQL database

Use a hosting service such as Railway, PlanetScale, or any MySQL provider that gives you:

- host
- port
- username
- password
- database name

Recommended free option: Railway MySQL.

### 2) Create the database schema

Open the SQL editor in your new database provider and run:

```sql
CREATE DATABASE dairy_farm_manager;
USE dairy_farm_manager;
```

Then import the project files:

- `backend/queries/schema.sql`
- `backend/queries/seed.sql`

If your provider does not support `SOURCE`, paste the contents of those files directly into the SQL editor.

### 3) Update backend environment variables

Create or update `backend/.env` with the new database details:

```env
DB_HOST=your_new_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=dairy_farm_manager
DB_PORT=3306
PORT=5000
NODE_ENV=production
JWT_SECRET=your_long_random_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CORS_ORIGIN=*
```

### 4) Deploy backend on Render

This project already includes a Render config in `render.yaml`.

1. Push the project to GitHub
2. Open Render
3. Create a new Web Service
4. Connect your GitHub repository
5. Render should detect `render.yaml`

The current config uses:

```yaml
buildCommand: cd backend && npm install
startCommand: cd backend && npm start
```

### 5) Add environment variables in Render

In the Render dashboard, add these variables:

```env
DB_HOST=your_new_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=dairy_farm_manager
DB_PORT=3306
PORT=10000
NODE_ENV=production
JWT_SECRET=your_long_random_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=*
```

> `PORT` should be `10000` on Render.

### 6) Test the deployed backend

After deployment, open:

```text
https://your-render-service-name.onrender.com/api/health
```

If it returns success, the backend and database are connected correctly.

### 7) Update frontend API URL

Update `frontend/.env` with your new public backend URL:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-render-service-name.onrender.com/api
```

Then rebuild the APK or Expo app.

### 8) Rebuild the Android app

After changing the backend URL:

```bash
cd project/frontend
npm install
npx expo start
```

Or rebuild the APK for distribution.

---

## Frontend setup (Expo)

### 1) Install dependencies

```bash
cd project/frontend
npm install
```

### 2) Point the app to your backend

Edit `frontend/src/config/api.js`:

- **Android emulator**: `http://10.0.2.2:5000/api`
- **Real phone**: `http://<YOUR_PC_LAN_IP>:5000/api`

### 3) Start Expo

```bash
npm start
```

Then:
- Android emulator: press `a`
- Expo Go on phone: scan QR in terminal/browser

---

## Main API endpoints

### Auth

- `POST /api/auth/register` `{ fullName, email, phoneNumber, password }`
- `POST /api/auth/login` `{ email, password }`
- `POST /api/auth/guest` (continue as guest)

### User

- `GET /api/users/me`
- `PUT /api/users/me` with optional fields like `avatarUrl`, `farmName`, `farmLocation`, `totalLandAcres`

### Uploads

- `POST /api/uploads` with `multipart/form-data` field named `image`

The backend uploads the image to Cloudinary and stores the returned public URL in `users.avatar_url`, `animals.photo_url`, or `staff.photo_url`.

### Livestock

- `GET /api/animals?category=All&q=COW`
- `POST /api/animals`

### Health

- `GET /api/health/vaccinations`
- `POST /api/health/vaccinations`
- `GET /api/health/checkups`
- `POST /api/health/checkups`

### Production & Sales

- `GET /api/production/overview`
- `GET /api/production/entries`
- `POST /api/production/entries`
- `GET /api/production/sales`
- `POST /api/production/sales`
- `GET /api/production/compare`

### Finance

- `GET /api/finance/overview`
- `GET /api/finance/expenses`
- `POST /api/finance/expenses`
- `GET /api/finance/pl`

### Staff

- `GET /api/staff`
- `POST /api/staff`

### Inventory

- `GET /api/inventory?category=All`
- `POST /api/inventory`

### Crops

- `GET /api/crops`
- `POST /api/crops`

### Settings

- `GET /api/settings`
- `PUT /api/settings`

---

## Notes (important)

- **All API routes require a token**. After login/guest, the app stores the JWT in AsyncStorage and automatically sends it.
- **Guest mode** uses a guest JWT (no DB user record). Updating profile is blocked for guests.

