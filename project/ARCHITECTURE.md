# Project Architecture & File Structure

## Directory Overview

```
MAD Final Project/
│
├── project/
│   ├── backend/                      # Express.js Server
│   │   ├── config/
│   │   │   └── db.js                # MySQL connection pool
│   │   │
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # JWT authentication
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /auth endpoints
│   │   │   ├── userRoutes.js        # /users endpoints
│   │   │   └── itemRoutes.js        # /items endpoints
│   │   │
│   │   ├── queries/
│   │   │   ├── users.sql            # User table & queries
│   │   │   ├── items.sql            # Item table & queries
│   │   │   └── orders.sql           # Order table & queries
│   │   │
│   │   ├── .env                     # Environment variables
│   │   ├── .gitignore               # Git ignore rules
│   │   ├── package.json             # Dependencies
│   │   └── server.js                # Main entry point
│   │
│   ├── frontend/                    # React Native + Expo App
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── api.js           # API configuration
│   │   │   │
│   │   │   ├── context/
│   │   │   │   └── AuthContext.js   # Authentication context
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── api.js           # API service functions
│   │   │   │   └── apiClient.js     # Axios client setup
│   │   │   │
│   │   │   ├── screens/
│   │   │   │   ├── LoginScreen.js   # Login UI
│   │   │   │   ├── RegisterScreen.js# Registration UI
│   │   │   │   ├── HomeScreen.js    # Marketplace view
│   │   │   │   └── ProfileScreen.js # User profile
│   │   │   │
│   │   │   └── navigation/
│   │   │       └── RootNavigator.js # Navigation setup
│   │   │
│   │   ├── App.js                   # Main app component
│   │   ├── app.json                 # Expo config
│   │   ├── babel.config.js          # Babel config
│   │   ├── .gitignore               # Git ignore rules
│   │   ├── package.json             # Dependencies
│   │   └── README.md                # Frontend docs
│   │
│   ├── README.md                    # Main documentation
│   ├── QUICKSTART.md                # Quick setup guide
│   ├── DEPLOYMENT.md                # Render deployment guide
│   ├── API_TESTING.md               # API testing guide
│   ├── ARCHITECTURE.md              # This file
│   └── render.yaml                  # Render config
│
```

## Component Breakdown

### Backend Components

#### 1. server.js
- Express app initialization
- Middleware setup (CORS, body parser)
- Route definitions
- Error handling
- Server startup

#### 2. config/db.js
- MySQL connection pool creation
- Connection testing
- Error handling

#### 3. middleware/authMiddleware.js
- JWT verification
- Token extraction from headers
- User context attachment

#### 4. routes/authRoutes.js
- User registration with password hashing
- User login with JWT token generation
- Input validation

#### 5. routes/userRoutes.js
- Get user profile
- Update user profile
- Get user by ID
- Requires authentication for some routes

#### 6. routes/itemRoutes.js
- Get all items (marketplace)
- Get item by ID
- Create item (auth required)
- Update item (auth required)
- Delete item (auth required)
- Search items

#### 7. queries/*.sql
- Database schema definitions
- Example CRUD queries
- SQL for each entity

### Frontend Components

#### 1. App.js
- Main entry point
- AuthProvider wrapper
- Root navigator initialization

#### 2. context/AuthContext.js
- Authentication state management
- Sign up, sign in, sign out logic
- Token storage in AsyncStorage
- User data persistence

#### 3. services/apiClient.js
- Axios instance configuration
- Request interceptors (add token)
- Response interceptors (handle errors)
- Automatic token injection

#### 4. services/api.js
- Auth service functions
- User service functions
- Item service functions
- All API calls

#### 5. screens/LoginScreen.js
- Email/password input
- Login button
- Error handling
- Navigation to register

#### 6. screens/RegisterScreen.js
- User input form
- Password hashing (server-side)
- Validation
- Navigation to login

#### 7. screens/HomeScreen.js
- Marketplace item list
- FlatList rendering
- Item detail navigation
- Search functionality

#### 8. screens/ProfileScreen.js
- User information display
- Profile editing
- Logout functionality
- Navigation to my items

#### 9. navigation/RootNavigator.js
- Authentication stack (Login, Register)
- App stack (Home, Profile tabs)
- Conditional rendering based on auth state

## Data Flow

### Authentication Flow
```
1. User fills registration form
   ↓
2. Frontend sends data to /auth/register
   ↓
3. Backend hashes password & stores user
   ↓
4. Success response returned
   ↓
5. User navigates to login
   ↓
6. User fills login form
   ↓
7. Frontend sends credentials to /auth/login
   ↓
8. Backend verifies & creates JWT token
   ↓
9. Token stored in AsyncStorage
   ↓
10. User authenticated & navigated to Home
```

### Item Management Flow
```
1. User creates item with description & image
   ↓
2. Frontend sends to /items (with auth token)
   ↓
3. Backend stores item in database
   ↓
4. Item ID returned
   ↓
5. Frontend refreshes item list
   ↓
6. GET /items fetches all items
   ↓
7. Items displayed in FlatList
   ↓
8. User can tap to view details
```

## API Architecture

### Request Flow
```
Frontend → Axios Client → Add Token → Send Request → Backend
                                            ↓
                                      Authentication
                                      Middleware
                                            ↓
                                      Route Handler
                                            ↓
                                      Database Query
                                            ↓
Response ← Return JSON ← Process Data ← MySQL
```

### Database Architecture
```
MySQL Server
├── mad_project_db
│   ├── users
│   │   ├── id (PK)
│   │   ├── username
│   │   ├── email
│   │   ├── password
│   │   └── ...
│   │
│   ├── items
│   │   ├── id (PK)
│   │   ├── user_id (FK → users)
│   │   ├── title
│   │   ├── price
│   │   └── ...
│   │
│   └── orders
│       ├── id (PK)
│       ├── buyer_id (FK → users)
│       ├── seller_id (FK → users)
│       ├── item_id (FK → items)
│       └── ...
```

## Technology Stack

### Backend
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcryptjs
- **HTTP Client**: Axios
- **Environment**: dotenv

### Frontend
- **Framework**: React Native
- **State Management**: Context API
- **Navigation**: React Navigation
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Icons**: Material Icons
- **Build Tool**: Expo

## Environment Variables

### Backend
- `DB_HOST`: MySQL server host
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name
- `PORT`: Server port
- `JWT_SECRET`: Secret for JWT signing
- `NODE_ENV`: Environment type
- `CORS_ORIGIN`: Allowed origins

### Frontend
- `API_BASE_URL`: Backend API URL
- `TIMEOUT`: API request timeout

## Deployment Architecture

```
GitHub Repository
       ↓
  [Render Dashboard]
       ↓
   Build Process
       ↓
  Backend Service (on Render)
       ↓
   MySQL Database (external)
```

## Performance Considerations

1. **Database Indexing**: User email, username indexed
2. **Connection Pooling**: MySQL pool for efficiency
3. **JWT Tokens**: Stateless authentication
4. **Caching**: AsyncStorage for local data
5. **API Endpoints**: RESTful design

## Security Measures

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Token-based auth
3. **CORS**: Cross-origin resource sharing
4. **Input Validation**: Server-side checks
5. **Error Handling**: No sensitive data in errors
6. **Environment Variables**: Secrets not hardcoded

## Scalability

1. **Horizontal**: Multiple backend instances
2. **Vertical**: Database optimization
3. **Caching**: Redis for frequently accessed data
4. **Load Balancing**: Render handles automatically

---

For detailed setup instructions, see README.md
For quick start, see QUICKSTART.md
For deployment, see DEPLOYMENT.md
