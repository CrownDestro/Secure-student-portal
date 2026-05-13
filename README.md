# Secure Student Portal
### 23CSE313 – Foundations of Cyber Security Project

A full-stack web application demonstrating OWASP Top 10 defences with an interactive Attack Simulation Dashboard.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

---

### 1. Clone & navigate
```bash
cd secure-student-portal
```

### 2. Setup Backend
```bash
cd backend

# Copy and edit environment variables
cp .env.example .env
# Edit .env — set your MONGODB_URI and JWT_SECRET

# Install dependencies
npm install

# Seed demo users (run once)
npx ts-node src/seed.ts

# Start dev server
npm run dev
```
Backend runs on: **http://localhost:5000**

### 3. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```
Frontend runs on: **http://localhost:3000**

---

## Demo Credentials

| Role    | Email              | Password     |
|---------|--------------------|--------------|
| Student | student@demo.com   | Student@123  |
| Teacher | teacher@demo.com   | Teacher@123  |
| Admin   | admin@demo.com     | Admin@1234   |

---

## Project Structure

```
secure-student-portal/
├── frontend/                    # Next.js 14 + TypeScript
│   ├── app/
│   │   ├── login/               # Login page
│   │   ├── register/            # Register page
│   │   ├── dashboard/
│   │   │   ├── student/         # Student dashboard
│   │   │   ├── teacher/         # Teacher dashboard (file upload)
│   │   │   └── admin/           # Admin dashboard (user management)
│   │   ├── attack-simulator/    # Attack demo index
│   │   │   ├── sqli/            # SQL/NoSQL Injection demo
│   │   │   ├── xss/             # XSS demo
│   │   │   ├── csrf/            # CSRF demo
│   │   │   └── upload/          # Malicious upload demo
│   │   ├── admin/audit/         # Audit logs (admin only)
│   │   └── profile/             # User profile + password change
│   ├── components/
│   │   ├── auth/                # AuthGuard, PasswordStrength
│   │   ├── attack/              # AttackCard, CodeBlock, ResultPanel
│   │   └── layout/              # Sidebar, DashboardLayout
│   ├── hooks/useAuth.ts         # Authentication hook
│   ├── lib/
│   │   ├── api.ts               # Typed API client
│   │   ├── validators.ts        # Zod schemas
│   │   └── utils.ts             # cn() helper
│   └── types/index.ts           # Shared TypeScript types
│
└── backend/                     # Node.js + Express
    └── src/
        ├── config/              # DB, logger
        ├── controllers/         # Auth, Users, Files, Audit, Attack
        ├── middleware/          # auth (JWT), rbac, rateLimiter, upload, auditLogger
        ├── models/              # User, AuditLog, FileUpload
        ├── routes/              # auth, users, files, audit, attack
        ├── validators/          # express-validator schemas
        ├── seed.ts              # Demo user seeder
        └── index.ts             # App entry point
```

---

## Security Features Implemented

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with cost factor 12 |
| Authentication | JWT in HTTP-only + SameSite=Strict cookie |
| Authorization | RBAC middleware (student / teacher / admin) |
| Session Timeout | 15-minute JWT expiry |
| Brute Force Prevention | Rate limiting (5 attempts / 15 min) + account lockout |
| NoSQL Injection | Mongoose ORM + express-mongo-sanitize |
| XSS Prevention | React auto-escaping + html-entities + Content-Security-Policy |
| CSRF Prevention | SameSite=Strict cookies |
| File Upload Security | MIME allowlist, 5MB limit, UUID rename, outside web root |
| Security Headers | Helmet.js (HSTS, X-Frame-Options, nosniff, CSP) |
| Audit Logging | Every action logged with IP, user, status, timestamp |
| Input Validation | Zod (frontend) + express-validator (backend) |

---

## API Endpoints

| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| POST | /api/auth/register | No | Public |
| POST | /api/auth/login | No | Public |
| POST | /api/auth/logout | Yes | All |
| GET | /api/auth/me | Yes | All |
| GET | /api/users | Yes | Admin |
| PATCH | /api/users/:id/role | Yes | Admin |
| DELETE | /api/users/:id | Yes | Admin |
| POST | /api/files/upload | Yes | All |
| GET | /api/files | Yes | Teacher/Admin |
| GET | /api/files/:id | Yes | Owner/Admin |
| GET | /api/audit | Yes | Admin |
| POST | /api/attack/sqli-demo | Yes | All |
| POST | /api/attack/xss-demo | Yes | All |
| POST | /api/attack/csrf-demo | Yes | All |
| POST | /api/attack/upload-demo | Yes | All |
