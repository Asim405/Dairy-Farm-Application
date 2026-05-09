# Commands Quick Reference

## Backend Commands

### Setup
```bash
cd backend
npm install
npm install -g nodemon  # for auto-reload
```

### Running
```bash
npm run dev      # Development with auto-reload
npm start        # Production mode
npm test         # Run tests (when added)
```

### Database (MySQL)
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE mad_project_db;
USE mad_project_db;

# Run SQL files
mysql -u root -p mad_project_db < queries/users.sql
mysql -u root -p mad_project_db < queries/items.sql
mysql -u root -p mad_project_db < queries/orders.sql

# Check tables
SHOW TABLES;
DESCRIBE users;
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"pass123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Get items
curl http://localhost:5000/api/items
```

---

## Frontend Commands

### Setup
```bash
cd frontend
npm install
npm install -g expo-cli  # One-time setup
```

### Running
```bash
npm start              # Start Expo development server
npm run android        # Run on Android emulator/device
npm run ios           # Run on iOS simulator
npm run web           # Run in web browser
npm run eject         # Eject from Expo (caution!)
```

### Clearing Cache
```bash
npm start -- -c       # Clear cache on start
expo start -c         # Using Expo CLI
expo start --clear    # Full cache clear
```

### Publishing
```bash
expo login            # Login to Expo account
expo publish          # Publish to Expo
expo publish --release-channel=prod  # Release channel
```

---

## Git Commands

### Initial Setup
```bash
cd project
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/repo.git
git push -u origin main
```

### Regular Usage
```bash
git status                      # Check status
git add .                       # Stage all changes
git commit -m "message"         # Commit changes
git push                        # Push to GitHub
git pull                        # Pull from GitHub
git log --oneline              # View commit history
```

### Branching
```bash
git branch feature-name         # Create branch
git checkout feature-name       # Switch branch
git checkout -b feature-name    # Create & switch
git merge feature-name          # Merge branch
git branch -d feature-name      # Delete branch
```

---

## Environment Setup

### Windows

#### Install Node.js
```bash
# Using Chocolatey
choco install nodejs

# Or download from nodejs.org
```

#### Install MySQL
```bash
# Using Chocolatey
choco install mysql

# Or download from mysql.com
```

#### Start MySQL Service
```bash
# Open Services and start MySQL
# Or use command line
net start MySQL80
```

#### Install Expo CLI
```bash
npm install -g expo-cli
```

### Mac

#### Install Node.js
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

#### Install MySQL
```bash
brew install mysql
brew services start mysql
```

#### Install Expo CLI
```bash
npm install -g expo-cli
```

### Linux

#### Install Node.js
```bash
sudo apt-get install nodejs npm
```

#### Install MySQL
```bash
sudo apt-get install mysql-server
sudo service mysql start
```

#### Install Expo CLI
```bash
npm install -g expo-cli
```

---

## Configuration

### Backend .env Template
```bash
# Copy and fill these values
cp backend/.env.example backend/.env

# Edit with your values
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mad_project_db
JWT_SECRET=your_very_long_secure_secret_key_here
```

### Frontend API Config
```bash
# Edit frontend/src/config/api.js
# For local development
API_BASE_URL=http://192.168.X.X:5000/api

# For production (after Render deployment)
API_BASE_URL=https://your-app.onrender.com/api
```

---

## Useful Tools

### REST Client Options
```bash
# Using curl
curl -X GET http://localhost:5000/api/items

# Using Postman
# Download from postman.com

# Using VS Code REST Client
# Install extension, create .rest file
```

### Database Tools
```bash
# MySQL Command Line
mysql -u root -p

# MySQL Workbench (GUI)
# Download from mysql.com

# DBeaver (free)
# Download from dbeaver.io
```

### Code Editor
```bash
# VS Code (recommended)
# Download from code.visualstudio.com

# Extensions
# - ES7+ React/Redux/React-Native snippets
# - Thunder Client (API testing)
# - SQLTools (database)
```

---

## Troubleshooting Commands

### Check Ports
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

### Kill Process
```bash
# Windows
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

### Clear Node Modules
```bash
# Remove and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Check Versions
```bash
node --version          # Node version
npm --version          # NPM version
mysql --version        # MySQL version
expo --version         # Expo version
git --version          # Git version
```

### Test Connectivity
```bash
# Ping database
mysql -h localhost -u root -p -e "SELECT 1"

# Ping API
curl http://localhost:5000/api/health

# Ping network
ping 8.8.8.8
```

---

## Deployment Commands

### Prepare for Render
```bash
cd backend
git add .
git commit -m "Deployment prep"
git push origin main
```

### Render CLI (Optional)
```bash
npm install -g @render/cli
render deploy --help
```

### Expo Publish
```bash
cd frontend
expo login
expo publish
```

---

## Common Workflows

### Complete Local Setup
```bash
# Backend
cd backend
npm install
# Configure .env
# Create database
mysql -u root -p < queries/users.sql
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

### Deploy to Production
```bash
# Backend to Render
cd backend
git push origin main
# Configure on Render dashboard

# Frontend to Expo
cd frontend
# Update API_BASE_URL in src/config/api.js
expo publish
```

### Test Specific Endpoint
```bash
curl -X GET http://localhost:5000/api/items
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

---

## Backup & Recovery

### Backup Database
```bash
# Backup all databases
mysqldump -u root -p --all-databases > backup.sql

# Backup specific database
mysqldump -u root -p mad_project_db > mad_backup.sql
```

### Restore Database
```bash
# Restore from backup
mysql -u root -p < backup.sql

# Restore specific database
mysql -u root -p mad_project_db < mad_backup.sql
```

### Backup Project
```bash
git push origin main  # Push to GitHub
zip -r backup.zip project/  # Zip files
```

---

## Performance Commands

### Monitor Backend
```bash
# Real-time logs (Render)
# Use Render dashboard → Logs tab

# Local server logs
npm run dev  # View output in terminal
```

### Database Optimization
```sql
-- Check table sizes
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb 
FROM information_schema.tables 
WHERE table_schema = 'mad_project_db';

-- Optimize tables
OPTIMIZE TABLE users, items, orders;
```

### Frontend Performance
```bash
# Check app bundle size
npm run build  # (if configured)

# Analyze dependencies
npm ls  # List all dependencies
```

---

## Security Commands

### Generate Secure JWT Secret
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

### Hash Password Test (Node)
```bash
node
const bcrypt = require('bcryptjs');
bcrypt.hash('password123', 10).then(h => console.log(h));
```

---

## Documentation Reference

| File | Purpose | Command |
|------|---------|---------|
| README.md | Full guide | `cat README.md` |
| QUICKSTART.md | 5-min setup | `cat QUICKSTART.md` |
| API_TESTING.md | API tests | See endpoints |
| DEPLOYMENT.md | Deploy info | Follow steps |
| ARCHITECTURE.md | Structure | Study design |
| CHECKLIST.md | Progress | Track items |

---

**Save this file for quick reference during development!**

Last Updated: May 4, 2026
