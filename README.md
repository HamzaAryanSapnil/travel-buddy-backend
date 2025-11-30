# Travel Buddy Backend

Travel Buddy Backend is an Express.js backend application built with TypeScript, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (Cookie-based)
- **File Upload**: Multer + Cloudinary
- **Email**: Resend
- **AI**: OpenAI + OpenRouter

## Project Structure

```
travel-buddy-backend/
├── src/
│   ├── app/
│   │   ├── modules/          # Feature modules
│   │   ├── middlewares/      # Express middlewares
│   │   ├── shared/           # Shared utilities
│   │   ├── helper/           # Helper functions
│   │   ├── errors/           # Error classes
│   │   └── routes/           # Route definitions
│   ├── config/               # Configuration
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server entry point
├── prisma/
│   └── schema/               # Prisma schema files
└── uploads/                  # Upload directory
```

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all required environment variables

3. **Database Setup**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate

   # Run migrations
   npm run prisma:migrate
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## API Endpoints

All API endpoints are prefixed with `/api/v1`

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT

