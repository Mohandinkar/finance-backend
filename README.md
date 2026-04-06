# Finance Dashboard API

This repository contains the backend service for the Finance Dashboard, an enterprise-level financial ledger application. It exposes a robust RESTful API designed to handle secure user authentication, role-based access control (RBAC), and comprehensive financial record management.

## 🎯 Architecture & Core Technologies

The backend is built following a modular architecture (Controllers, Routes, Models, Middlewares) to ensure scalability and clean code separation.

- **Runtime Environment:** Node.js
- **Web Framework:** Express.js
- **Database:** MongoDB
- **ODM / ORM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcryptjs
- **Validation:** Zod (for strict schema validation of incoming requests)

## 🗄️ Database Models & Schema

The database relies on two primary collections, `Users` and `Records`, with a relational mapping established via Mongoose references.

### 1. User Model (`User.js`)
Handles system access and role definitions.
- `name` (String, Required)
- `email` (String, Required, Unique)
- `password` (String, Required, Select: false)
- `role` (Enum: `['Viewer', 'Analyst', 'Admin']`, Default: `Viewer`)
- `status` (Enum: `['Active', 'Inactive']`, Default: `Active`)
- *Timestamps enabled (createdAt, updatedAt)*

### 2. Record Model (`Record.js`)
Manages individual financial entries.
- `amount` (Number, Required)
- `type` (Enum: `['Income', 'Expense']`, Required)
- `category` (String, Required)
- `date` (Date, Default: `Date.now`)
- `notes` (String, Optional)
- `createdBy` (ObjectId referencing `User`, Required)
- *Timestamps enabled (createdAt, updatedAt)*

## 🔒 Security & RBAC (Role-Based Access Control)

The API enforces strict security implementations using custom middleware:
- **Authentication (`protect` middleware):** Validates the `Authorization: Bearer <token>` header to ensure the user is logged in.
- **Authorization (`authorize` middleware):** Validates the user's `role`. E.g., only explicitly authorized roles (like `Admin`) can perform destructive actions (like deleting users or modifying core records).
- **Password Security:** All passwords are one-way hashed using `bcryptjs` before entering the database.

## 🛣️ RESTful API Endpoints

The system routes are grouped logically by resource:

### Auth Endpoints (`/api/auth`)
- `POST /api/auth/register` - Register a new user account.
- `POST /api/auth/login` - Authenticate a user and receive a JWT.

### Record Endpoints (`/api/records`)
- `GET /api/records` - Retrieve financial records (Supports filtering/sorting query params) (Protected).
- `POST /api/records` - Create a new financial record (Protected, Role: Admin/Analyst).
- `PUT /api/records/:id` - Update an existing record (Protected, Role: Admin/Analyst).
- `DELETE /api/records/:id` - Delete a record (Protected, Role: Admin).

### Dashboard Endpoints (`/api/dashboard`)
- `GET /api/dashboard/summary` - Aggregates data for KPI cards and dashboard charts (Protected).

### User Management Endpoints (`/api/users`)
- `GET /api/users` - Retrieve a list of all users in the system (Protected, Role: Admin).
- `PUT /api/users/:id/role` - Modify a user's access role (Protected, Role: Admin).

## 📄 Server-Side Pagination

The `GET /api/records` endpoint does not dump the entire database to the client. Instead, it uses a high-performance pagination system:

- **Query Parameters:** Supports `page` and `limit` (e.g., `?page=1&limit=50`).
- **Performance:** Optimized using Mongoose `.skip()` and `.limit()` methods to reduce memory overhead.

## 🔑 Demo Credentials

To test the **Role-Based Access Control (RBAC)** features, please use the following pre-configured accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `adminpassword123` | Full CRUD, User Management, Dashboard |
| **Analyst** | `vinit@theledger.com` | `12345678` | Analyse,  Dashboard View |
| **Viewer** | `viewer@theledger.com` | `123456` | Read-Only Dashboard |

> **Note:** New registrations via the "Create Account" page are assigned the **Viewer** role by default for security.

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB connection string (Local or MongoDB Atlas)

### Steps
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root of the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=your_secure_jwt_secret_key
   ```
4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000` executing via `nodemon`.*

## 🧪 Testing the API

You can test the system locally using tools like **Postman**.

**Test Workflow:**
1. Start the server (`npm run dev`).
2. Make a `POST` request to `http://localhost:5000/api/auth/register` with `{ "name": "Test", "email": "test@test.com", "password": "password123", "role": "Admin" }` in the JSON body.
3. Make a `POST` request to `http://localhost:5000/api/auth/login` with the same email and password. Copy the `token` from the response.
4. Make a `POST` request to `http://localhost:5000/api/records` to create a record. Ensure you attach the token as an **Authorization header** (`Bearer <your_token>`).
5. Query `GET http://localhost:5000/api/dashboard/summary` to ensure your data logic aggregates properly.
