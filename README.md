# Smart Tourism Recommendation & Planning System

A full-stack AI-powered tourism discovery and trip planning platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, TailwindCSS 4, shadcn/ui, React Router v7 |
| Icons | Tabler Icons |
| Charts | Recharts |
| Backend | Node.js, Express.js |
| Database | MySQL + Sequelize ORM |
| HTTP Client | Axios |

## Project Structure

```
smart/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── components/       # UI components (shadcn-style)
│       ├── pages/            # Home, Destinations, Recommendations, TripPlanner, Analytics
│       ├── services/         # API service (axios)
│       ├── layouts/          # MainLayout with Sidebar
│       └── lib/              # Utilities (cn)
│
└── server/                   # Express backend
    ├── config/               # database.js (Sequelize)
    ├── controllers/          # destinationController, tripController, analyticsController
    ├── routes/               # destinations, trips, analytics
    └── models/               # Destination, Trip, Recommendation (Sequelize)
```

## Setup & Run

### Prerequisites
- Node.js 20.19+
- MySQL 8+

### Frontend (Client)
```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

### Backend (Server)

1. Edit `server/.env` — set your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=smart_tourism_db
   DB_USER=root
   DB_PASSWORD=your_password
   ```

2. Create the database in MySQL:
   ```sql
   CREATE DATABASE smart_tourism_db;
   ```

3. Start the server:
   ```bash
   cd server
   npm install
   npm run dev
   # → http://localhost:5000
   ```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/destinations` | List destinations (query: search, category, budget) |
| POST | `/api/destinations` | Create destination |
| GET | `/api/destinations/:id` | Get destination by ID |
| GET | `/api/trips` | List all trips |
| POST | `/api/trips` | Create a trip |
| PUT | `/api/trips/:id` | Update a trip |
| DELETE | `/api/trips/:id` | Delete a trip |
| GET | `/api/analytics` | Get analytics data |

## Pages

- **/** — Home: Hero, Stats, Feature modules, Trending destinations
- **/destinations** — Search & filter destinations with cards
- **/recommendations** — AI preference panel with match-scored results
- **/planner** — Multi-day timeline trip planner with activity management
- **/analytics** — Dashboard with charts, KPIs, and activity feed
