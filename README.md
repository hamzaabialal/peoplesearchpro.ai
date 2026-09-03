# PeopleSearch Pro

Premium **Digital Identity & Background Intelligence** frontend. Next.js, TypeScript, Tailwind. Demonstration data only — no live provider calls, no API secrets in the UI.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account at `/signup` (email + password, stored in Postgres); `/app`, `/admin`, and `/partner` require a session. Needs `DATABASE_URL` and `AUTH_SECRET` set — see `.env.local`.

## Surfaces

- Marketing: `/` `/how-it-works` `/pricing` `/security` `/sample-report`
- Customer: `/app` investigations, reports (dossier), people, billing, settings
- Partner: `/partner`
- Admin: `/admin`

The report experience is the product centerpiece: sourced facts vs AI inference, source drawer, PDF preview.
