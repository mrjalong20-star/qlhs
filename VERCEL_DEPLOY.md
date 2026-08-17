# Deploy Quản lý học sinh lên Vercel

## 1. GitHub
Push the entire project to a GitHub repository.

## 2. Vercel
Import the GitHub repository in Vercel and deploy.

Vercel will use:
- Build command: `npm run build`
- Output directory: `dist`
- API function: `api/index.ts`

## 3. Environment Variables
In Vercel -> Project -> Settings -> Environment Variables, set:
- `SUPER_ADMIN_USERNAME`
- `SUPER_ADMIN_PASSWORD`
- `GEMINI_API_KEY` (optional)
- `GOOGLE_APPS_SCRIPT_URL` (optional)

Do not commit a real `.env` file.

## 4. Important limitation
The current Express API stores teachers, classes, sessions, submissions and presence in memory.
This is suitable for testing/demo deployment, but it is NOT durable production storage on a serverless platform.
For permanent data, connect the API to a real database (PostgreSQL/Supabase/Neon, etc.).

Google Apps Script can continue to be used for exam-result synchronization if configured in the app.
