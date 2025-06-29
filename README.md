# Cleaning Duty Manager

A web application to manage weekly cleaning duties. Built with Next.js, TypeScript, Tailwind CSS and Prisma.

## Features

- View weekly cleaning duty assignments
- Rotate assignments automatically each week
- Manage members and cleaning places

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Database

This project uses Prisma with a SQLite database by default. To switch to Postgres, update `provider` and `DATABASE_URL` in `.env` and `prisma/schema.prisma`.

You can open Prisma Studio for managing data:

```bash
npx prisma studio
```

See `prisma/README.md` for more details.

## Testing

Run lint and tests with:

```bash
npm run lint
npm run test
```
