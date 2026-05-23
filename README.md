# Prowider – Mini Lead Distribution System

A full-stack lead generation and distribution system built with Next.js, PostgreSQL (Neon), and Prisma.

## Live Demo
[View Live →](https://prowider-leads-2plql3nqt-aaditya143chauhan-gmailcoms-projects.vercel.app)

## GitHub
[View Repository →](https://github.com/Aditya-chauhann/prowider-leads)

---

## Features

- **Customer Form** — Submit service enquiries at `/request-service`
- **Auto Lead Assignment** — Leads are automatically assigned to exactly 3 providers
- **Mandatory Assignment Rules** — Certain providers always receive specific service leads
- **Fair Round-Robin Distribution** — Remaining slots are filled fairly, persisted across restarts
- **Monthly Quota Enforcement** — Providers cannot exceed 10 leads/month
- **Duplicate Prevention** — Same phone + service combination is rejected at database level
- **Provider Dashboard** — Real-time dashboard at `/dashboard` showing assignments and quotas
- **Real-Time Updates** — Dashboard updates instantly via Server-Sent Events (SSE)
- **Webhook Simulation** — Test tools at `/test-tools` for payment webhooks and concurrency
- **Idempotent Webhooks** — Calling the same webhook multiple times has no duplicate effect
- **Concurrency Safe** — All lead creation uses database transactions to prevent race conditions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS, Lucide Icons |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Neon) |
| ORM | Prisma v7 |
| Deployment | Vercel |
| Real-time | Server-Sent Events (SSE) |

---

## Setup Instructions

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/Aditya-chauhann/prowider-leads.git
cd prowider-leads
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Set up environment variables
Create a `.env` file in the root:
\`\`\`env
DATABASE_URL="your-postgresql-connection-string"
\`\`\`

### 4. Push database schema
\`\`\`bash
npx prisma db push
\`\`\`

### 5. Seed the database
\`\`\`bash
node prisma/seeds.js
\`\`\`

### 6. Run the development server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Allocation Algorithm

Each lead is assigned to **exactly 3 providers**:

1. **Mandatory providers** are assigned first based on service type:
   - Service 1 → Provider 1 (always)
   - Service 2 → Provider 5 (always)
   - Service 3 → Provider 1 + Provider 4 (always)

2. **Remaining slots** are filled using **round-robin** from a service-specific pool:
   - Service 1 pool → Providers 2, 3, 4
   - Service 2 pool → Providers 6, 7, 8
   - Service 3 pool → Providers 2, 3, 5, 6, 7, 8

3. The **rotation index** is persisted in the database (`AllocationState` table) so fair distribution continues even after server restarts.

4. Providers who have **reached their monthly quota (10)** are skipped automatically.

---

## Concurrency Handling

All lead creation logic runs inside a **`prisma.$transaction()`** block. This ensures:
- Atomic reads and writes — no two requests can read/write the same data simultaneously
- Correct quota enforcement even when 10+ leads are created at the same moment
- No duplicate assignments to the same provider for the same lead

---

## Webhook Idempotency

Every webhook request must include an `idempotencyKey`. The system:
1. Checks if the key already exists in the `WebhookEvent` table
2. If it exists → returns early with "already processed" — **no changes made**
3. If it doesn't exist → processes the event and stores the key

This ensures quota resets happen **exactly once** per payment, even if the webhook fires multiple times.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/request-service` | Customer lead submission form |
| `/dashboard` | Real-time provider dashboard |
| `/test-tools` | Webhook simulation and testing panel |

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/leads` | Create a new lead + trigger assignment |
| GET | `/api/providers` | Fetch all providers with assignments |
| GET | `/api/sse` | Server-Sent Events stream for real-time updates |
| POST | `/api/webhook` | Idempotent webhook for quota reset |

---

## Seed Data

- **3 Services:** Service 1, Service 2, Service 3
- **8 Providers:** Provider 1 through Provider 8
- **Monthly quota:** 10 leads per provider