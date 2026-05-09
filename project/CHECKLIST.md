# Project Setup Checklist

## Backend Setup ✓

### Prerequisites
- [ ] Node.js installed (v14+)
- [ ] MySQL Server installed
- [ ] Git installed

### Database Setup
- [ ] Create MySQL database: `mad_project_db`
- [ ] Run users.sql query
- [ ] Run items.sql query
- [ ] Run orders.sql query
- [ ] Verify tables created: `SHOW TABLES;`

### Backend Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Update DB_HOST, DB_USER, DB_PASSWORD
- [ ] Update JWT_SECRET with secure random string
- [ ] Verify .env file is in `.gitignore`

### Dependencies
- [ ] Run `npm install` in backend folder
- [ ] Verify all packages installed

### Backend Testing
- [ ] Start server: `npm run dev`
- [ ] Check console for "Server running on port 5000"
- [ ] Test health endpoint: `curl http://localhost:5000/api/health`

### API Routes Verification
- [ ] POST /auth/register works
- [ ] POST /auth/login works
- [ ] GET /items works
- [ ] POST /items works (with token)

---

## Frontend Setup ✓

### Prerequisites
- [ ] Node.js installed
- [ ] npm or yarn installed
- [ ] Expo CLI installed: `npm install -g expo-cli`
- [ ] Expo app installed on phone

### Frontend Configuration
- [ ] Copy `.env.example` to `.env` (if using)
- [ ] Update API_BASE_URL in `src/config/api.js`
- [ ] For local: use your machine's local IP
- [ ] For production: use Render backend URL

### Dependencies
- [ ] Run `npm install` in frontend folder
- [ ] Verify all packages installed
- [ ] Verify expo is working: `expo --version`

### Frontend Testing
- [ ] Start Expo: `npm start`
- [ ] QR code should display
- [ ] Scan with Expo app on phone
- [ ] App should load

### Feature Testing
- [ ] Register screen displays correctly
- [ ] Login screen displays correctly
- [ ] Can submit registration form
- [ ] Can submit login form
- [ ] Navigation works between screens
- [ ] Marketplace items load
- [ ] Profile screen displays user info

---

## Local Testing Checklist ✓

### Authentication Flow
- [ ] Register new user
- [ ] Get success message
- [ ] Login with registered credentials
- [ ] Token stored in AsyncStorage
- [ ] User navigated to home screen

### Marketplace Features
- [ ] View all items
- [ ] See item details
- [ ] Search functionality works
- [ ] Items show seller name
- [ ] Items show prices

### User Features
- [ ] View user profile
- [ ] Profile shows correct user data
- [ ] Can edit profile
- [ ] Logout functionality works
- [ ] Returns to login screen after logout

### Error Handling
- [ ] Wrong password shows error
- [ ] Invalid email shows error
- [ ] Network errors handled gracefully
- [ ] Missing fields validation works

---

## Deployment to Render ✓

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] All tests passing locally
- [ ] No hardcoded credentials in code
- [ ] .env not committed to repo

### Render Setup
- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] MySQL database accessible from internet
- [ ] Database credentials verified

### Backend Deployment
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Add all environment variables
- [ ] Deploy successful
- [ ] Test API health endpoint

### Database on Production
- [ ] Run SQL queries on production database
- [ ] Verify tables created
- [ ] Test user registration on deployed API

### Frontend Deployment
- [ ] Update API_BASE_URL to Render URL
- [ ] Test login with deployed API
- [ ] Publish to Expo
- [ ] Test on phone with Expo app
- [ ] Marketplace loads from live API

---

## Final Verification ✓

### Backend Verification
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] All endpoints accessible
- [ ] Error handling working
- [ ] CORS enabled

### Frontend Verification
- [ ] App loads without errors
- [ ] Can login to app
- [ ] Can browse marketplace
- [ ] Can view user profile
- [ ] All screens render correctly

### End-to-End Verification
- [ ] User can register
- [ ] User can login
- [ ] User can see marketplace items
- [ ] User can view profile
- [ ] User can logout
- [ ] App works on multiple devices
- [ ] No console errors

---

## Troubleshooting Done ✓

### Database Issues Resolved
- [ ] Database connection errors fixed
- [ ] Tables verified created
- [ ] Credentials verified

### Backend Issues Resolved
- [ ] Port conflicts resolved
- [ ] Environment variables set correctly
- [ ] API routes responding correctly

### Frontend Issues Resolved
- [ ] Expo cache cleared if needed
- [ ] API URL correctly configured
- [ ] Network requests working

### Deployment Issues Resolved
- [ ] GitHub push successful
- [ ] Render deployment complete
- [ ] Environment variables on Render correct
- [ ] Production database accessible

---

## Documentation ✓

- [ ] README.md reviewed
- [ ] QUICKSTART.md completed
- [ ] API_TESTING.md tested endpoints
- [ ] DEPLOYMENT.md followed for Render
- [ ] ARCHITECTURE.md understood structure

---

## Ready for Production ✓

- [ ] All checklists completed
- [ ] No bugs found
- [ ] All features working
- [ ] Deployed successfully
- [ ] Documented thoroughly

---

## Maintenance Notes

- [ ] Database backups scheduled
- [ ] Monitor Render logs
- [ ] Update dependencies quarterly
- [ ] Security updates applied
- [ ] User feedback collected

---

**Project Status**: Ready for Release ✓

**Last Updated**: May 4, 2026

**Notes**: 
_Use this checklist to track project progress and ensure nothing is missed._

For help, refer to:
- README.md - Full documentation
- QUICKSTART.md - Quick setup
- API_TESTING.md - Test endpoints
- DEPLOYMENT.md - Deploy to Render
- ARCHITECTURE.md - Understand structure
