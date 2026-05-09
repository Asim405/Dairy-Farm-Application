# Quick Setup Guide

## Backend Quick Start

### 1. Setup (One-time)
```bash
cd backend
npm install
```

### 2. Database Setup (One-time)
```bash
# Connect to MySQL
mysql -u root -p
# Then run these commands:

CREATE DATABASE mad_project_db;
USE mad_project_db;

-- Copy and paste content from backend/queries/users.sql
-- Copy and paste content from backend/queries/items.sql
-- Copy and paste content from backend/queries/orders.sql
```

### 3. Configure .env
Edit `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mad_project_db
JWT_SECRET=your_secret_key_12345
```

### 4. Start Backend
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

---

## Frontend Quick Start

### 1. Install Expo CLI
```bash
npm install -g expo-cli
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Start Expo
```bash
npm start
```

### 4. Choose Platform
- Press `a` for Android
- Press `i` for iOS
- Press `w` for Web
- Scan QR code with Expo app

✅ App running on your device

---

## Testing the App

### 1. Test Register
- Open app → Register screen
- Enter username, email, password
- Click Register

### 2. Test Login
- Go to Login screen
- Enter email and password
- Click Login

### 3. Test Marketplace
- Browse items on Home screen
- View item details
- Search for items

### 4. Test Profile
- View your profile
- Edit profile information
- Logout

---

## API Testing with Curl

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Items
```bash
curl http://localhost:5000/api/items
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### MySQL Connection Error
```bash
# Check MySQL is running
mysql --version

# Start MySQL service
# Windows: Services → Start MySQL
# Mac: brew services start mysql
# Linux: sudo service mysql start
```

### Expo Connection Issues
```bash
# Clear cache and restart
expo start -c

# Update Expo
npm install -g expo@latest
```

---

## File Locations

```
project/
├── backend/
│   ├── .env ← Edit database credentials here
│   ├── server.js ← Main backend file
│   ├── package.json ← Dependencies
│   └── queries/ ← SQL files
│
└── frontend/
    ├── App.js ← Main app file
    ├── package.json ← Dependencies
    └── src/config/api.js ← Edit API URL here
```

---

## Next Steps

1. ✅ Setup backend and frontend
2. ✅ Test locally
3. ✅ Deploy to Render (see DEPLOYMENT.md)
4. ✅ Update API URL in frontend
5. ✅ Deploy frontend to Expo

---

For detailed setup, see README.md
For deployment, see DEPLOYMENT.md
