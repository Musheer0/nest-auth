

# 🔐 Auth Service (NestJS + Prisma + Redis)

A secure and production-ready **authentication & user management backend** built with **NestJS**, **Prisma**, and **PostgreSQL**, with optional **MFA support**, **refresh tokens**, **password reset**, **session management**, and **rate limiting**.

---

## 🚀 Features

* **User Registration (Email/Password)**
* **Email Verification** with token system
* **Login with Credentials**
* **Multi-Factor Authentication (MFA)** enable/disable
* **Session Management**

  * View active session
  * Logout (single session)
  * Logout from all devices
* **Refresh Token** endpoint
* **Edit Profile**

  * Basic info (name, profile picture)
  * Change email (with verification)
* **Password Management**

  * Reset while logged in
  * Forgot password (reset without being logged in)
* **Security**

  * Throttling / rate limiting
  * Guards for route protection (JWTGuard, PublicOnlyGuard)
  * Prisma schema with relations + enums
* **Redis Session Caching** (recommended for scalability)

---

## 🛠 Tech Stack

* **NestJS** – scalable Node.js framework
* **Prisma** – ORM for PostgreSQL
* **PostgreSQL** – relational DB
* **Upstash Redis** – serverless caching (for sessions/tokens)
* **class-validator** – DTO validation
* **@nestjs/throttler** – rate limiting

---

## ⚡ Getting Started

### 1️⃣ Clone & Install

```bash
git clone https://github.com/your-username/auth-service.git
cd auth-service
npm install
```

### 2️⃣ Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/authdb"
JWT_SECRET="super-secret-jwt-key"
REDIS_URL="redis://default:password@host:port"
```

### 3️⃣ Prisma Setup

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4️⃣ Run the App

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## 📡 API Endpoints

### 🔑 Auth Routes (`/api/auth`)

#### 1. **Sign Up (Email)**

```http
POST /api/auth/sign-up/email
```

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### 2. **Verify Email**

```http
POST /api/auth/verify/email
```

```json
{
  "code": "123456",
  "userId": "uuid",
  "tokenId": "uuid",
  "email": "john@example.com"
}
```

#### 3. **Resend Verification Email**

```http
POST /api/auth/resend/verify/email
```

#### 4. **Sign In (Credentials + optional MFA)**

```http
POST /api/auth/sign-in/email
```

```json
{
  "email": "john@example.com",
  "password": "securePassword123",
  "code": "123456",
  "token": "uuid"
}
```

---

### 🔒 User & MFA Routes

#### 5. **Enable MFA**

```http
POST /api/auth/enable/mfa
```

#### 6. **Disable MFA**

```http
POST /api/auth/disable/mfa
```

```json
{
  "code": "123456",
  "token": "uuid"
}
```

#### 7. **Edit Basic Info**

```http
PATCH /api/auth/edit/basic
```

```json
{
  "name": "John Updated",
  "image_url": "https://example.com/avatar.png"
}
```

#### 8. **Edit Email**

```http
PATCH /api/auth/edit/email
```

```json
{
  "email": "new@example.com",
  "tokenId": "uuid",
  "code": "123456"
}
```

#### 9. **Edit Password (Authorized User)**

```http
PATCH /api/auth/edit/password
```

```json
{
  "email": "john@example.com",
  "password": "newSecurePassword123",
  "tokenId": "uuid",
  "code": "123456"
}
```

#### 10. **Forgot Password (Unauthenticated Flow)**

```http
PATCH /api/auth/forgot/password
```

```json
{
  "email": "john@example.com",
  "password": "newSecurePassword123",
  "tokenId": "uuid",
  "code": "123456"
}
```

---

### 🧑 Session Management

#### 11. **Get Current Session**

```http
POST /api/auth/user/me
```

#### 12. **Logout (current session)**

```http
DELETE /api/auth/user/logout
```

#### 13. **Logout from All Devices**

```http
DELETE /api/auth/user/logout-all
```

#### 14. **Refresh Token**

```http
PATCH /api/auth/user/refresh
```

*(Requires JWT token, refreshes session token)*

---

## 🗂 Database Schema (Prisma)

### User

* `id`, `name`, `email`, `phone_number`
* `hashed_password`
* `is_email_verified`, `status`, `mfa_enabled`
* `sessions[]`, `verification_tokens[]`

### Session

* `id`, `ip`, `user_agent`, `expires_at`
* `user_id` → relation to User

### VerificationToken

* `id`, `secret`, `scope (enum)`
* `user_id` → relation to User

---

## 🔐 Security Highlights

* **Throttling** on all routes (limits brute force attacks).
* **JWTGuard** protects private routes.
* **PublicOnlyGuard** prevents logged-in users from hitting public routes.
* **DTO Validation** ensures request payloads are strict and safe.

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e
```

---

## 📌 Future Improvements

* Add OAuth (Google, GitHub) providers
* Add refresh token rotation & blacklist
* Add password reset email flow
* Add audit logs for session activity
