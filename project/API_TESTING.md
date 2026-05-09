# API Testing Guide

## Using Postman

### 1. Import Collection
- Create new collection "MAD Project API"
- Add the following requests

### 2. Set Up Environment Variables

Create an environment with:
```
base_url: http://localhost:5000/api
token: (will be filled after login)
```

## API Endpoints

### 1. Authentication

#### Register User
```
POST /auth/register

Body (raw JSON):
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "message": "User registered successfully"
}
```

#### Login User
```
POST /auth/login

Body (raw JSON):
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Save the token for authenticated requests**

---

### 2. User Endpoints

#### Get User Profile
```
GET /users/profile

Headers:
Authorization: Bearer {{token}}

Response:
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": null,
  "profile_picture": null,
  "bio": null
}
```

#### Update User Profile
```
PUT /users/profile

Headers:
Authorization: Bearer {{token}}

Body (raw JSON):
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "bio": "I love selling items!"
}

Response:
{
  "message": "Profile updated successfully"
}
```

#### Get User by ID
```
GET /users/1

Response:
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "profile_picture": null,
  "bio": "I love selling items!"
}
```

---

### 3. Item Endpoints

#### Get All Items
```
GET /items

Response:
[
  {
    "id": 1,
    "user_id": 1,
    "title": "iPhone 12",
    "description": "Excellent condition",
    "category": "electronics",
    "price": "499.99",
    "quantity": 1,
    "image_url": "https://...",
    "status": "available",
    "username": "john_doe",
    "profile_picture": null,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
]
```

#### Get Item by ID
```
GET /items/1

Response:
{
  "id": 1,
  "user_id": 1,
  "title": "iPhone 12",
  "description": "Excellent condition",
  "category": "electronics",
  "price": "499.99",
  "quantity": 1,
  "image_url": "https://...",
  "status": "available",
  "username": "john_doe",
  "profile_picture": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

#### Create Item
```
POST /items

Headers:
Authorization: Bearer {{token}}

Body (raw JSON):
{
  "title": "iPhone 12",
  "description": "Excellent condition, no scratches",
  "category": "electronics",
  "price": 499.99,
  "quantity": 1,
  "imageUrl": "https://example.com/iphone.jpg"
}

Response:
{
  "message": "Item created successfully",
  "itemId": 1
}
```

#### Update Item
```
PUT /items/1

Headers:
Authorization: Bearer {{token}}

Body (raw JSON):
{
  "title": "iPhone 12 Pro",
  "description": "Updated description",
  "category": "electronics",
  "price": 599.99,
  "quantity": 1
}

Response:
{
  "message": "Item updated successfully"
}
```

#### Delete Item
```
DELETE /items/1

Headers:
Authorization: Bearer {{token}}

Response:
{
  "message": "Item deleted successfully"
}
```

#### Search Items
```
GET /items/search/iphone

Response:
[
  {
    "id": 1,
    "title": "iPhone 12",
    "description": "Excellent condition",
    ...
  }
]
```

---

## Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request |
| 401 | Unauthorized (invalid token) |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |

---

## Error Responses

### Missing Required Field
```json
{
  "error": "Email and password required"
}
```

### Invalid Credentials
```json
{
  "error": "Invalid email or password"
}
```

### Database Error
```json
{
  "error": "Internal server error"
}
```

---

## Testing Workflow

1. **Register** → Create new user
2. **Login** → Get authentication token
3. **Get Profile** → Verify user account
4. **Create Items** → Add items to marketplace
5. **Get Items** → View all items
6. **Search Items** → Test search functionality
7. **Update Item** → Modify item details
8. **Delete Item** → Remove item

---

## Tips

- Always copy the token after login
- Include Authorization header for protected endpoints
- Use json format for request bodies
- Check response status codes
- Test error cases (wrong password, etc.)

For more details, see README.md
