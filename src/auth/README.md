# Authentication API Documentation
## Table of Contents
1. [Endpoints](#endpoints)
	- [POST /auth/signup](#post-authsignup)
	- [POST /auth/login](#post-authlogin)
	- [POST /auth/logout](#post-authlogout)
2. [DTOs](#dtos)
	- [SignupDto](#signupdto)
	- [LoginDto](#logindto)
3. [Response Examples](#response-examples)
4. [Swagger Integration](#swagger-integration)

## Endpoints
### POST /auth/signup
#### Description:
Registers a new user in the system. The route expects a valid SignupDto and returns the newly created user.
#### Request Body:
- **email**: The user's email (unique).
- **username**: The user's username (unique).
- **password**: The user's password.
#### Response:
- **201 Created**: Returns the created user.
- **400 Bad Request**: Returns an error if the input is invalid.
#### Example:
```bash
curl -X POST http://localhost:8000/auth/signup \
-H "Content-Type: application/json" \
-d '{
	"email": "john@doe.com",
	"username": "johnDoe",
	"password": "StrongPassword123!"
}'
```
#### Sample Response:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john@doe.com",
  "username": "johnDoe",
  "role": "USER",
  "accountState": "ACTIVE"
}
```
---
### POST /auth/login
#### Description: 
Logs in an existing user using email and password. The route uses the `LocalAuthGuard` and returns a JWT token if the credentials are valid.
#### Request Body:
- **email**: The user's email.
- **password**: The user's password.
#### Response:
- **200 OK**: Returns an access token.
- **403 Forbidden**: Returns an error if credentials are invalid.
#### Example: 
```bash
curl -X POST http://localhost:8000/auth/login \
-H "Content-Type: application/json" \
-d '{
	"email": "john@doe.com",
	"password": "StrongPassword123!"
}'
```
#### Sample Response:
```json
{
	"access_token": "your_jwt_token"
}
```
---
### POST /auth/logout
#### Description:
Logs out the authenticated user by blacklisting their JWT token.

#### Headers:	
- **Authorization**: Bearer token (JWT).

#### Response:
-   **200 OK**: Returns a success message indicating the user has logged out.
-   **401 Unauthorized**: Returns an error if the JWT token is missing or invalid.

#### Example:
```bash
curl -X POST http://localhost:3000/auth/logout \
-H "Authorization: Bearer your_jwt_token"
```
#### Sample Response:
```json
{ 
	"message": "Successfully logged out" 
}
```
----------

## DTOs

### SignupDto

This DTO is used for registering a new user.

-   **email**: A string representing the user's email.
-   **password**: A string representing the user's password.
-   **username**: A string representing the user's username.
```json
{
  "email": "john@doe.com",
  "password": "StrongPassword123!",
  "username": "johnDoe"
}
```
### LoginDto

This DTO is used for logging in an existing user.

-   **email**: A string representing the user's email.
-   **password**: A string representing the user's password.
```json
{
	"email": "john@doe.com", 
	"password": "StrongPassword123!" 
}
```
## Response Examples

### 201 Created (Signup)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john@doe.com",
  "username": "johnDoe",
  "role": "USER",
  "accountState": "ACTIVE"
}
```
### 200 OK (Login)
```json
{ 
	"access_token": "your_jwt_token" 
}
```
### 200 OK (Logout)
```json
{
	"message": "Successfully logged out"
}
```
### 401 Unauthorized (Login or Logout Failure)
```json
{ 
	"statusCode": 401, "message": "Unauthorized" 
}
```
---
## Swagger Integration

This API is fully documented using Swagger. To access the Swagger UI and view all routes and request/response details, navigate to:
```bash
http://localhost:8000/api-docs
```
### JWT Authentication in Swagger

To access protected routes (such as `logout`), you need to authenticate via Swagger UI:

1.  Click the **Authorize** button in the top right corner.
2.  Input your JWT token in the format: `Bearer your_jwt_token`.
3.  Once authenticated, you can call any secured endpoints.

---

This `README.md` provides comprehensive documentation for the `AuthController` in your NestJS application, making it easy for developers to understand the API structure, expected inputs, outputs, and how to interact with the authentication system.
