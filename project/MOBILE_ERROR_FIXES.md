# Mobile App Setup Guide - Error Fixes

## Errors Fixed ✅

### 1. Asset Resolution Error - FIXED ✅
**Problem:** "Unable to resolve asset './assets/icon.png'"

**Solution Applied:**
- Created `/frontend/assets` directory
- Generated placeholder PNG files:
  - `icon.png`
  - `splash.png`
  - `adaptive-icon.png`
  - `favicon.png`

---

## API 400 Error - Troubleshooting Guide

### Why You're Getting Status Code 400

The 400 error means the backend received an invalid request. This could be due to:

1. **Backend not running** - Most likely issue
2. **Wrong server IP address** - API URL doesn't match your backend
3. **Network connectivity** - Phone can't reach the server

---

## Step-by-Step Fix

### Step 1: Ensure Backend is Running

1. Open a terminal in the backend folder:
   ```bash
   cd project/backend
   npm install
   npm start
   ```
   You should see: `🚀 Server running on http://localhost:5000`

2. Test if backend is working:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"message": "Server is running", ...}`

---

### Step 2: Update API URL in Frontend

The API URL needs to match your backend server.

**For Android Emulator:**
```javascript
// frontend/src/config/api.js
export const API_BASE_URL = 'http://10.0.2.2:5000/api';
```

**For Real Android Device (same network):**
1. Find your PC's local IP:
   - Windows: Open cmd and run `ipconfig`
   - Look for IPv4 Address (e.g., 192.168.1.10)

2. Update the API URL:
   ```javascript
   // frontend/src/config/api.js
   export const API_BASE_URL = 'http://192.168.YOUR.IP:5000/api';
   ```

3. Make sure:
   - PC and phone are on **same WiFi**
   - Firewall allows port 5000 (or whitelist it)

**For iPhone Simulator:**
```javascript
// frontend/src/config/api.js
export const API_BASE_URL = 'http://localhost:5000/api';
```

---

### Step 3: Clear App Cache and Restart

1. **Stop the app** on your mobile device

2. **Clear cache (optional):**
   ```bash
   cd project/frontend
   npm start
   # Press 'c' to clear cache
   ```

3. **Reload the app:**
   - Press 'r' to reload
   - Or manually restart the app

---

### Step 4: Verify API Calls Work

Try these test credentials:

**Register (Sign Up):**
- Email: `test@example.com`
- Password: `password123`
- Full Name: `Test User`
- Phone: `1234567890` (optional)

**Login:**
- Email: `test@example.com`
- Password: `password123`

---

## Debugging Tips

Check the console logs in your mobile app:

1. **Bad API URL:**
   ```
   API Error: {status: undefined, message: 'Network Error'}
   ```
   → Fix: Check API_BASE_URL is correct

2. **Backend not running:**
   ```
   API Error: {status: undefined, message: 'connect ECONNREFUSED'}
   ```
   → Fix: Start the backend server

3. **Invalid request payload:**
   ```
   API Error: {status: 400, data: {error: "..."}}
   ```
   → Fix: Check request fields match backend expectations

4. **Successful response:**
   ```
   API Response Success: 200
   ```
   → Working correctly! ✅

---

## Current API Configuration

**Updated Files:**
- ✅ `frontend/src/config/api.js` - Added comments for easy configuration
- ✅ `frontend/src/services/apiClient.js` - Added debug logging
- ✅ `frontend/src/context/AuthContext.js` - Added error handling for guest session
- ✅ `frontend/assets/` - Created with placeholder images

---

## Quick Reference

| Issue | Solution |
|-------|----------|
| Asset errors | ✅ Fixed - assets created |
| 400 error | Update API_BASE_URL to your server IP |
| Can't connect | Check backend is running + same WiFi |
| Wrong IP | Run `ipconfig` on Windows to find local IP |
| Still not working | Check firewall allows port 5000 |

---

## Next Steps

1. ✅ Run backend: `npm start` (in backend folder)
2. ✅ Update API_BASE_URL with correct IP
3. ✅ Restart app and test login
4. ✅ Check console logs for any remaining errors

If you still get errors, share the exact error message from the console and I'll help debug!
