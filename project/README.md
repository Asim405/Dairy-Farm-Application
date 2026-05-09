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
```

### 4) Run backend

```bash
npm run dev
```

Backend runs at `http://localhost:5000` and health check at `GET /api/health`.

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
- `PUT /api/users/me`

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

