# InfinityBudget API

Production-ready Node.js, Express, MongoDB Atlas backend for the InfinityBudget student finance app.

## What It Includes

- JWT access tokens and refresh-token rotation
- Google OAuth ID-token login for mobile/web clients
- Password hashing with bcrypt
- Protected REST routes
- MongoDB Atlas schemas with Mongoose indexes
- Expenses with filtering, search, pagination, and date ranges
- Budget tracking with remaining amount and warnings
- Savings goals with progress/completion detection
- Achievement unlock system
- Analytics aggregation pipelines
- Security middleware: Helmet, CORS, rate limits, HPP, Mongo sanitize
- Render and Railway deployment files

## Folder Structure

```txt
src/
  app.js
  server.js
  config/
  controllers/
  middlewares/
  models/
  routes/
  services/
  utils/
  validators/
```

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `GOOGLE_CLIENT_ID` in `.env`.

## Core Routes

```txt
GET    /api/health

POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/google
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/users/me
PATCH  /api/users/me
PATCH  /api/users/onboarding

GET    /api/expenses
POST   /api/expenses
GET    /api/expenses/:id
PATCH  /api/expenses/:id
DELETE /api/expenses/:id

GET    /api/budgets/current
GET    /api/budgets/history
POST   /api/budgets
PUT    /api/budgets
PATCH  /api/budgets/:id

GET    /api/goals
POST   /api/goals
GET    /api/goals/:id
PATCH  /api/goals/:id
DELETE /api/goals/:id
POST   /api/goals/:id/contributions

GET    /api/analytics/summary
GET    /api/analytics/monthly-summary
GET    /api/analytics/category-breakdown
GET    /api/analytics/weekly-comparison
GET    /api/analytics/daily-average
GET    /api/analytics/savings-trend
GET    /api/analytics/top-category
GET    /api/analytics/heatmap
GET    /api/analytics/snapshots/latest
POST   /api/analytics/snapshots

GET    /api/achievements
POST   /api/achievements/recalculate
```

All routes except `/api/health` and `/api/auth/*` require:

```txt
Authorization: Bearer <accessToken>
```

## Expense Query Examples

```txt
GET /api/expenses?page=1&limit=20&category=Food
GET /api/expenses?startDate=2026-05-01&endDate=2026-05-31
GET /api/expenses?search=cafe&sort=amount_desc
```

## MongoDB Collections

- `users`
- `expenses`
- `budgets`
- `goals`
- `achievements`
- `analyticssnapshots`
- `refreshtokens`

`refreshtokens` is an internal security collection used for refresh-token rotation and revocation.

## Deployment Notes

### Render

Use `render.yaml`, or create a Web Service:

- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

### Railway

Railway can use `railway.json`. Add the same environment variables from `.env.example`.

## Future-Ready Hooks

The service layer is designed for future additions:

- AI spending coach service under `src/services/ai.service.js`
- Notification service for budget alerts
- WebSocket or SSE gateway for live sync
- Shared wallets and friend groups
- Premium plans and payment integration
