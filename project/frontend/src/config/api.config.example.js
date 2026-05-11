/**
 * API Configuration for Mobile Testing
 * 
 * Update the API_BASE_URL based on your testing environment:
 */

// ========================================
// ANDROID EMULATOR
// ========================================
// export const API_BASE_URL = 'http://10.0.2.2:5000/api';

// ========================================
// ANDROID REAL DEVICE
// ========================================
// STEPS:
// 1. Run: ipconfig (on Windows) to find your PC's IPv4 address
// 2. Replace 192.168.1.10 with your actual IP
// export const API_BASE_URL = 'http://192.168.1.10:5000/api';

// ========================================
// iOS SIMULATOR
// ========================================
// export const API_BASE_URL = 'http://localhost:5000/api';

// ========================================
// iOS REAL DEVICE
// ========================================
// Same as Android Real Device - use your PC's local IP
// export const API_BASE_URL = 'http://192.168.1.10:5000/api';

// ========================================
// CURRENT CONFIGURATION
// ========================================
// Update this IP address to match your backend server
export const API_BASE_URL = 'http://192.168.100.9:5000/api';
export const TIMEOUT = 10000; // 10 seconds

/**
 * TROUBLESHOOTING:
 * 
 * If you get a 400 error:
 * 1. Make sure the backend is running: npm start (in the backend folder)
 * 2. Check the API_BASE_URL is correct
 * 3. Ensure your phone and PC are on the same WiFi network
 * 4. Check Windows Firewall allows port 5000
 * 
 * To find your PC's IP on Windows:
 * - Open Command Prompt
 * - Type: ipconfig
 * - Look for "IPv4 Address" under your WiFi adapter
 * - Example: 192.168.1.10
 */
