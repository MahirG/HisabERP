# Hisab ERP — Next.js

Hisab ERP now runs as a Next.js App Router project with TypeScript.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Current migration architecture

The original standalone ERP remains unchanged in `hisab-erp-enterprise-v9-9-9-2.html` so all existing styles and browser-side functionality are preserved. A Next.js route serves that source at `/legacy`, and the root App Router page presents it in a full-screen application shell.

This is the safe first migration step. Individual screens, state, storage, and business logic can now be moved incrementally into React components without breaking the existing ERP.
