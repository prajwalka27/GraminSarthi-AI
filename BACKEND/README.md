# GraminSarthi-AI Backend

The backend is an independent Node.js and TypeScript service using an in-memory
store. Data is cleared whenever the server restarts. No database is required.

The server uses Node's built-in HTTP module and `tsx`; Express and database
packages are not required.

## Run

To run the standalone server:

```bash
cd BACKEND
npm install
npm run dev
```

It listens on `http://localhost:5000` by default. Set `PORT` to change it.

Create `BACKEND/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

No database setup is required.

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

The store is process-local and resets when the server restarts. Business and ledger operations verify merchant ownership before returning or changing records.
