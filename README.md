# IT Dashboard & Help Desk

A full-stack IT service management and help desk system for tracking support tickets, hardware assets, inventory supplies, and stockroom parts.

## 🚀 Features

- **📊 Command Center**: Comprehensive overview of support queue metrics, asset status, and inventory alerts.
- **🎫 Ticket Management**: Triage, prioritize, assign, and resolve user requests and IT issues.
- **💻 Asset Registry**: Detailed device tracking, hardware assignments, specifications, and lifecycle management.
- **📦 Inventory & Supply Control**: Monitor stock thresholds and consumables to ensure team readiness.
- **🏢 Stockroom**: Manage spare parts and equipment across storage locations.
- **🔐 Secure access**: Register and sign in with email/password before accessing help-desk data.

---

## 🛠️ Tech Stack

- **Backend**: [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), PostgreSQL
- **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Lucide React](https://lucide.dev/)
- **Database**: PostgreSQL (supports local instances or cloud providers such as Supabase)

---

## 📁 Project Structure

```
.
├── backend/            # NestJS API application
│   ├── src/            # Controllers, services, entities, migrations
│   └── package.json
├── frontend/           # Vite + React single-page application
│   ├── src/            # Components, API client, types
│   └── package.json
├── package.json        # Root scripts
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **PostgreSQL**: Local instance or hosted database (e.g., Supabase)

### 1. Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Update `DATABASE_URL` in `.env` with your PostgreSQL credentials:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/it_dashboard"
   DATABASE_SSL="false"
   JWT_SECRET="replace-with-at-least-32-random-characters"
   PORT="3000"
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run database migrations:

   ```bash
   npm run migration:run
   ```

5. Start the backend server:
   ```bash
   npm run start:dev
   ```
   The backend API will run on `http://localhost:3000`.

---

### 2. Frontend Setup

1. In a new terminal, navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser. API requests are proxied to the backend.

---

## 🔌 API Endpoints

| Method | Endpoint         | Description                                   |
| ------ | ---------------- | --------------------------------------------- |
| `GET`  | `/api`              | Health check                                  |
| `POST` | `/api/auth/register` | Create an account and receive an access token |
| `POST` | `/api/auth/login`    | Sign in and receive an access token           |
| `GET`  | `/api/auth/me`       | Return the signed-in user                     |
| `GET`  | `/api/tickets`       | List all support tickets                      |
| `POST` | `/api/tickets`       | Create a new ticket                           |
| `GET`  | `/api/assets`        | List registered IT assets                     |
| `POST` | `/api/assets`        | Register an IT asset                          |
| `GET`  | `/api/inventory`     | List inventory supplies                       |
| `POST` | `/api/inventory`     | Add or update inventory items                 |
| `GET`  | `/api/stockroom`     | List stockroom items                          |
| `POST` | `/api/stockroom`     | Add stockroom items                           |

All endpoints except the health check, registration, and login require an
`Authorization: Bearer <token>` header. Access tokens expire after eight hours.

---

## 📄 License

MIT
