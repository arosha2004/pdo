# SecuGuard: Security Awareness & Compliance Platform

## Setup and Run

### Prerequisites
- Node.js (v18+)

### Environment Setup
1. Clone the repository or navigate to the project directory.
2. The project has two folders: `client` and `server`.

### Server
1. Navigate to the `server` directory: `cd server`
2. Install dependencies: `npm install`
3. Generate Prisma and push schema: `npx prisma generate && npx prisma db push`
4. Seed the database: `node prisma/seed.js`
5. Start the server (runs on port 3000): `node src/server.js` or `npm run dev`

### Client
1. Navigate to the `client` directory: `cd client`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

### Seeded Credentials
- **Admin**: `admin@acme.com` / `password`
- **Manager**: `manager1@acme.com` / `password`
- **Employee**: `emp1@acme.com` / `password`

### Assumptions & Notes
- Contribution 1 services (Auth, Emails, Audits) are mock stand-ins in `server/src/shared`.
- Background jobs run via `node-cron` inline with the server for development.
- SQLite is used via Prisma, easily swappable to Postgres.
- Authentication uses a simple JWT strategy without refresh tokens for demonstration.
