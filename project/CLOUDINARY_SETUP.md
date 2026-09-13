# Cloudinary Setup Guide

This project uses Cloudinary to store uploaded user, animal, and staff images.

## 1) Create a Cloudinary account

1. Go to https://cloudinary.com/
2. Sign up for a free account
3. After login, open your Cloudinary Dashboard

## 2) Get your Cloudinary credentials

From the Cloudinary dashboard, copy these values:

- Cloud name
- API key
- API secret

These are the three values you need in your backend `.env` file.

## 3) Update your backend `.env`

Open `project/backend/.env` and add:

```env
CLOUDINARY_CLOUD_NAME=your_real_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Example:

```env
CLOUDINARY_CLOUD_NAME=myfarmcloud
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcde12345xyz67890
```

Important:
- `CLOUDINARY_CLOUD_NAME` must be your actual Cloudinary cloud name
- It is not the same as your website name or username
- If you do not have a Cloudinary project yet, create one first

## 4) Restart the backend

After changing `.env`, restart the backend:

```bash
cd project/backend
npm run dev
```

## 5) Verify Cloudinary is working

Run this command from `project/backend`:

```bash
node -e "require('dotenv').config(); const { v2: cloudinary } = require('cloudinary'); cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET, secure: true }); cloudinary.api.ping().then(()=>console.log('Cloudinary ping success')).catch((err)=>{ console.error('Cloudinary ping failed'); console.error(err.message || err); process.exit(1); });"
```

If it prints `Cloudinary ping success`, your credentials are valid.

## 6) How this app uses Cloudinary

The app sends uploaded image files to:

```text
POST /api/uploads
```

The backend then uploads the file to Cloudinary and saves the returned public URL in the database.

## 7) Common error

If you see this error:

```text
Cloudinary is not configured
```

then check:

- `.env` exists in `project/backend`
- the three variables are present
- the backend has been restarted
- `CLOUDINARY_CLOUD_NAME` is the real cloud name from Cloudinary

## 8) Notes

- You do not need to store raw image files inside the app folder
- Cloudinary stores the image and returns a public URL
- The app stores only that URL in your database

## 9) Useful Cloudinary link

After you create your account, open:

- Dashboard
- Media Library
- Account Details

From there you can see your cloud name and manage uploaded files.
