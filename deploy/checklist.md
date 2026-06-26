# CoxBeach Go-Live Checklist

## Pre-Deployment (Staging)

- [ ] All 16 build steps complete and passing
- [ ] Full test suite passes: `npm test`
- [ ] Pricing test confirms 5000 → 6400 (VAT 15% + platform 5% + agent 8%)
- [ ] OTP flow works end-to-end in test mode
- [ ] Booking concurrency test passes (only one winner)
- [ ] Payment sandbox round-trip works (bKash, Nagad, SSLCommerz)
- [ ] Ledger entries sum to zero for every booking
- [ ] Agent QR attribution works within 72-hour window
- [ ] Settlement CSV downloads correctly
- [ ] Admin panel: changing VAT rate updates pricing immediately
- [ ] Email/SMS notifications queued correctly
- [ ] Review moderation flow works

## Security Review (Human Gate 1 — NON-NEGOTIABLE)

- [ ] Independent penetration test completed by qualified professional
- [ ] OWASP Top 10 checked
- [ ] JWT secret is strong & rotated from dev default
- [ ] NID encryption key is strong & stored securely
- [ ] Rate limiting in place
- [ ] SQL injection tested (Prisma parameterized queries used)
- [ ] XSS headers in place (Helmet.js)
- [ ] Webhook idempotency keys prevent replay attacks
- [ ] .env with real secrets NEVER committed to git

## Financial Review (Human Gate 2 — NON-NEGOTIABLE)

- [ ] Senior developer reviewed ledger code
- [ ] Double-entry verified: every transaction sums to zero
- [ ] 1,000-user load test on real infrastructure
- [ ] Settlement reconciliation verified manually
- [ ] VAT calculation verified by accountant

## Production Setup

- [ ] Real bKash merchant account + production API keys
- [ ] Real Nagad merchant account + production API keys
- [ ] Real SSLCommerz account + production API keys
- [ ] SMS provider account with approved sender ID
- [ ] Email provider (SES/Mailgun) configured
- [ ] Domain name & SSL certificate
- [ ] Cloud server provisioned (AWS/DigitalOcean)
- [ ] Daily backup script running
- [ ] Monitoring & alerting set up
- [ ] Production .env never committed to git

## Both gates must pass before switching to real money.
