# Render Deployment Guide

## Step-by-Step Backend Deployment

### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 2. Create Render Account

1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize Render to access your GitHub repositories

### 3. Create PostgreSQL Database (Optional - use MySQL instead if you prefer)

For this project, we recommend using MySQL:

**Option A: MySQL on External Host**
- Use AWS RDS, DigitalOcean, or other MySQL hosting
- Update `.env` with connection details

**Option B: Use Local/Cloud MySQL**
- Ensure your MySQL instance is accessible from internet
- Configure firewall rules to allow Render IP

### 4. Create Web Service

1. Click "New +" → "Web Service"
2. Select your repository
3. Configure the service:

   **Name**: mad-project-backend
   
   **Environment**: Node
   
   **Build Command**: 
   ```
   npm install
   ```
   
   **Start Command**: 
   ```
   npm start
   ```
   
   **Plan**: Free (recommended for testing)

4. Add Environment Variables:

   Click "Environment" and add:
   
   ```
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=mad_project_db
   DB_PORT=3306
   PORT=10000
   NODE_ENV=production
   JWT_SECRET=your_very_secure_jwt_secret_here
   API_URL=https://your-app.onrender.com
   CORS_ORIGIN=*
   ```

5. Click "Create Web Service"

### 5. Deploy

- Render will automatically deploy your app
- Monitor deployment in the Logs tab
- Once deployed, you'll get your API URL

### 6. Update Frontend

After backend is deployed, update the frontend:

**frontend/src/config/api.js**
```javascript
export const API_BASE_URL = 'https://your-app-name.onrender.com/api';
```

### 7. Database Setup on Production

1. SSH into your Render service or connect directly to your MySQL host
2. Run the SQL scripts:

```bash
mysql -h your_host -u your_user -p your_database < backend/queries/users.sql
mysql -h your_host -u your_user -p your_database < backend/queries/items.sql
mysql -h your_host -u your_user -p your_database < backend/queries/orders.sql
```

## Continuous Deployment

- Every push to main branch automatically triggers deployment
- View deployment history in Render dashboard
- Rollback to previous versions if needed

## Monitoring

### View Logs
1. Go to Render Dashboard
2. Click your service
3. View real-time logs in "Logs" tab

### Common Issues

**502 Bad Gateway**
- Backend crashed
- Check logs for errors
- Verify environment variables

**Database Connection Error**
- Check DB_HOST, DB_USER, DB_PASSWORD
- Ensure database is accessible from Render IP
- Verify firewall rules

**Timeout Issues**
- Increase database timeout in config
- Check database query performance

## Cost Considerations

- Free tier: ~$7/month for persistent disk (if needed)
- Database: Cost depends on provider
- Scaling: Manual or automatic based on traffic

## Helpful Commands

### View Service Status
```bash
# Access Render CLI
npm install -g render
render services
```

### Manual Restart
Via Render Dashboard → Service Settings → Restart Service

### Update Environment Variables
Via Render Dashboard → Environment → Edit variables → Save and redeploy

---

For more details, visit https://render.com/docs
