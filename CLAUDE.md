# CoxBeach — Hotel Booking Platform

A full-stack hotel booking platform for Cox's Bazar, Bangladesh.

## Architecture

- **apps/api** — Express.js + TypeScript backend (port 4000)
- **apps/web** — Next.js 14 frontend (port 3000)
- **PostgreSQL** via Docker (port 5432)
- **Redis** via Docker (port 6379)

## Quick Start

```bash
# 1. Start databases
docker-compose up -d

# 2. Copy env
cp .env.example apps/api/.env

# 3. Install dependencies
npm install

# 4. Generate Prisma client & migrate
cd apps/api && npx prisma migrate dev --name init && npx ts-node prisma/seed.ts

# 5. Start both apps
npm run dev
```

## Demo Accounts (after seeding)

| Role | Phone | Password |
|------|-------|----------|
| Admin | +8801700000001 | Admin@123 |
| Manager | +8801700000002 | Manager@123 |
| Agent | +8801700000003 | Agent@123 |
| Customer | +8801700000004 | Customer@123 |

## Key Features

1. **Phone-first OTP auth** — Bangladeshi phone numbers (+8801XXXXXXXXX)
2. **Hotel management** — Managers create hotels, admins approve
3. **Transparent pricing** — 5000 BDT base → 6400 BDT total (VAT 15% + platform fee 5% + agent 8%)
4. **Booking engine** — Pessimistic locking prevents double-booking
5. **Payment sandbox** — bKash, Nagad, Rocket, SSLCommerz (no real money)
6. **Agent QR system** — Agents get QR codes; 72-hour attribution window; 8% commission
7. **Double-entry ledger** — Every payment creates balanced ledger entries
8. **Admin panel** — KPIs, config management (VAT rates etc), user/review moderation

## Pricing Model (from Build Plan 4.3)

```
Base room price:    5,000 BDT
+ VAT (15%):         +750 BDT
+ Platform fee (5%): +250 BDT
+ Agent comm (8%):   +400 BDT
─────────────────────────────
Grand total:        6,400 BDT
```

Rates are admin-configurable via `/admin` panel (no code change needed).

## Test

```bash
cd apps/api && npm test
```

## API Base URL

`http://localhost:4000/api`

## Go-Live Gates (per Build Plan)

1. Professional security review & penetration test
2. Independent developer review of financial/ledger code + load test

**Never flip to real payment keys until both gates pass.**
