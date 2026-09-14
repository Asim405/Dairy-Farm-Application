// Set your backend URL here.
// For Android emulator: http://10.0.2.2:5000/api
// For real device: use your PC LAN IP, e.g. http://192.168.1.10:5000/api
// For production / standalone APK builds, set EXPO_PUBLIC_API_BASE_URL in frontend/.env and rebuild.
const DEFAULT_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.9:5000/api';

export const API_BASE_URL = DEFAULT_URL;
export const TIMEOUT = 15000; // 15 seconds for free tier spin-up

