# Deploy Vercel + Neon PostgreSQL

## 1. GitHub
Upload this project to your GitHub repository.

## 2. Vercel
Import the GitHub repository in Vercel.

Build settings:
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

## 3. Database
Use the Neon PostgreSQL integration from the Vercel Marketplace, or create a Neon database directly. Neon provides a Free Plan and has a native Vercel integration.

Set these Vercel environment variables:
- `DATABASE_URL` = PostgreSQL connection string
- `SUPER_ADMIN_USERNAME` = admin username
- `SUPER_ADMIN_PASSWORD` = a strong admin password

Do NOT put the real `DATABASE_URL` into GitHub.

## 4. First deploy
Redeploy after adding environment variables. The API automatically creates the required tables on first database connection.

Check:
`https://YOUR-APP.vercel.app/api/health`

Expected:
`database: postgres`

## 5. Important
The old in-memory storage is now replaced by PostgreSQL for:
- teacher accounts
- classes and students
- submissions/results
- student presence/heartbeat
- login sessions

The browser's local storage is still used by the frontend as a local fallback/cache.
