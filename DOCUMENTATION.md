# LingkodHub - Comprehensive Project Documentation

LingkodHub is a modern, full-stack local services marketplace designed to connect skilled service providers with clients in need of professional assistance. Built with a focus on speed, security, and user experience, it serves as a bridge for the local gig economy.

---

## 1. Project Overview

LingkodHub facilitates the entire lifecycle of local service procurement—from posting a job and bidding to real-time communication and final review. It supports two primary user roles:
- **Clients**: Users who need tasks performed (e.g., home repairs, cleaning, errands).
- **Providers**: Professionals or workers who offer their skills and apply for posted jobs.

---

## 2. Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/) (formerly Framer Motion)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Execution**: [TSX](https://tsx.is/) (TypeScript Execution)
- **Validation**: [Zod](https://zod.dev/)

### Database & Security
- **Database**: [SQLite](https://www.sqlite.org/) via `better-sqlite3`
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcryptjs

---

## 3. Project Structure

```text
├── src/                # Frontend Application
│   ├── components/     # Reusable UI components
│   │   ├── dashboard/  # Role-specific dashboard parts (Client/Provider/Shared)
│   │   └── Navbar.tsx  # Global Navigation
│   ├── pages/          # Main page views (Landing, Login, Dashboards, etc.)
│   ├── services/       # API integration layer
│   ├── App.tsx         # Main Routing and Layout
│   └── main.tsx        # Frontend Entry Point
├── routes/             # Backend API Routes
│   ├── auth.ts         # Login/Signup/Token management
│   ├── jobs.ts         # Job posting and management
│   ├── users.ts        # User profile and service settings
│   └── ...             # Notifications, Messages, Applications
├── middleware/         # Express Middleware (Auth guards, error handling)
├── server.ts           # Unified Server (Express + Vite Middleware)
├── db.ts               # Database Schema & Initialization
├── database.sqlite     # Local SQLite Database file
└── package.json        # Dependencies and Scripts
```

---

## 4. Key Features

### User Management
- **Secure Auth**: JWT-based authentication with refresh token rotation.
- **Profile Customization**: Users can update bio, location, contact info, and avatar.
- **Service Specialization**: Providers can select specific categories (e.g., Plumbing, Electrical, Cleaning) they specialize in.

### Job Lifecycle
- **Job Posting**: Clients can post jobs with descriptions, budget, and location.
- **Applications**: Providers can apply for jobs with custom messages.
- **Status Tracking**: Jobs move through states: `pending` → `in_progress` → `completed` or `cancelled`.

### Communication & Feedback
- **Messaging**: Integrated chat system for clients and providers to discuss job details.
- **Notifications**: Real-time alerts for new messages, application updates, and job milestones.
- **Reviews**: Mutual feedback system where clients rate providers upon job completion.

---

## 5. Database Schema

The system uses a relational schema managed in `db.ts`:

- **`users`**: Stores credentials, roles, and profile data.
- **`services`**: Master list of available service categories.
- **`provider_services`**: Link table for providers and their skills.
- **`jobs`**: Core entity for task details and status.
- **`applications`**: Tracks bids from providers on specific jobs.
- **`messages`**: Peer-to-peer communication logs.
- **`notifications`**: User-specific alerts.
- **`reviews`**: Ratings and comments for completed work.
- **`refresh_tokens`**: Manages persistent sessions.

---

## 6. Development & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`.
   - Set a secure `JWT_SECRET`.

### Running Locally
To start both the backend API and the Vite frontend in development mode:
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

### Building for Production
```bash
npm run build
npm start
```

---

## 7. API Reference (Core Endpoints)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and get tokens |
| `GET` | `/api/jobs` | List all available jobs |
| `POST` | `/api/jobs` | Post a new job (Client only) |
| `GET` | `/api/me` | Get current authenticated user profile |
| `POST` | `/api/applications` | Apply for a job (Provider only) |
| `GET` | `/api/messages` | Fetch conversation history |

---

## 8. Deployment

The project is designed to be container-ready. It can be deployed using Docker or orchestrated via Kubernetes (manifests previously defined in `k8s/` directory). The server automatically handles static asset serving in production environments.
