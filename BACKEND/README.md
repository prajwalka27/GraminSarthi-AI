# GraminSarthi-AI Backend

The backend is available as a standalone server in `server.ts`. The same API is
also available through the existing Next.js App Router project.

## Run

```bash
cd ../FRONTEND
npm install
npm run dev
```

To run the standalone server:

```bash
cd BACKEND
npm install
npm run dev
```

It listens on `http://localhost:4000` by default. Set `PORT` to change it.

Create `FRONTEND/.env.local` or `BACKEND/.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the database setup from:

```text
BACKEND/schema.sql
```

## API Routes

```text
GET  /

POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/session

GET  /api/merchant
PUT  /api/merchant

GET  /api/business
POST /api/business
PUT  /api/business/:id
DELETE /api/business/:id

GET  /api/ledger
POST /api/ledger
PUT  /api/ledger/:id
DELETE /api/ledger/:id
POST /api/ledger/calculate

POST /api/finance/calculate-loan
POST /api/finance/feasibility
GET  /api/schemes
POST /api/advisory
```

Ledger filtering supports `business_id`, `date`, `month=YYYY-MM`, and
`entry_type` query parameters.

Check the server before running it:

```bash
npm run typecheck
```

Authentication uses Supabase phone OTP. Database access is protected by Supabase Row Level Security, so users can only access their own merchant, business, ledger, and expense data.
