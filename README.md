# InfinityBudget

Deploy-ready Node.js, Express, MongoDB Atlas app for InfinityBudget.

## Project Structure

```txt
server.js
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
scripts/
infinitybudget.html
package.json
package-lock.json
render.yaml
railway.json
Procfile
```

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and optional `GOOGLE_CLIENT_ID` in `.env`.

## Production Environment Variables

Required:

```txt
MONGODB_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
```

Optional:

```txt
GOOGLE_CLIENT_ID
CLIENT_URL
API_BASE_URL
DNS_SERVERS
JWT_ACCESS_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
RATE_LIMIT_WINDOW_MS
RATE_LIMIT_MAX
AUTH_RATE_LIMIT_MAX
LOG_LEVEL
```

## Deployment

### Render

Use `render.yaml`, or create a Web Service with:

```txt
Build command: npm ci && npm run check
Start command: npm start
Health check path: /api/health
```

Required Render environment variable:

```txt
MONGODB_URI
```

The blueprint generates `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` automatically. If you create the service manually instead of using the blueprint, add both JWT secrets yourself.

### GitHub Upload Checklist

Upload these files and folders to GitHub:

```txt
.gitignore
.env.example
README.md
package.json
package-lock.json
render.yaml
server.js
infinitybudget.html
scripts/
src/
```

Do not upload:

```txt
.env
node_modules/
*.log
```

### Railway

Railway can use `railway.json`.

```txt
Start command: npm start
Health check path: /api/health
```

## Routes

```txt
GET    /
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
