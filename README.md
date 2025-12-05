# TravelBuddy Backend [Travel Planning & Collaboration Platform]

TravelBuddy Backend is a comprehensive RESTful API built for a travel planning and collaboration platform. This backend enables users to create, manage, and collaborate on travel plans with friends, family, or groups. The platform offers AI-powered trip planning, real-time chat, expense tracking, meetup coordination, media sharing, and subscription-based premium features. Built with modern technologies including Express.js, TypeScript, Prisma ORM, and PostgreSQL, TravelBuddy provides a robust, scalable, and secure foundation for travel planning applications.

The platform supports various travel types (solo, couple, family, friends, group) and includes features like itinerary management, trip member collaboration with role-based permissions, AI-powered travel planning with usage quotas, expense splitting and settlement tracking, meetup scheduling with RSVP functionality, real-time chat for travel plans, media gallery for trip photos, user and trip reviews with ratings, subscription management with Stripe integration, and comprehensive payment tracking. The backend implements JWT-based authentication with cookie storage, role-based access control (USER/ADMIN), and secure API endpoints with input validation using Zod schemas.

## 🛠️ Tech Stack

### Backend Framework & Runtime
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x

### Database & ORM
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 6.x

### Authentication & Security
- **Authentication**: JWT (JSON Web Tokens)
- **Token Storage**: Cookie-based (httpOnly, secure)
- **Password Hashing**: bcryptjs

### File Storage & Media
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary

### AI & Machine Learning
- **AI Provider**: OpenAI + OpenRouter
- **Model**: Google Gemini 2.0 Flash (configurable)

### Payment Processing
- **Payment Gateway**: Stripe
- **Webhook Integration**: Stripe Webhooks

### Email Service
- **Email Provider**: Resend

### Validation & Utilities
- **Validation**: Zod
- **HTTP Status**: http-status
- **UUID**: uuid

## ✨ Features

### 🌐 Public Features
- View public travel plans (if visibility is set to PUBLIC)
- View public itinerary items
- Access public travel plan information

### 👤 User Features

#### Travel Planning
- Create, update, and delete travel plans
- Set plan visibility (PUBLIC, PRIVATE, UNLISTED)
- Add travel type, budget, dates, and descriptions
- AI-powered travel planning with interactive sessions
- Create and manage detailed itineraries with day-by-day activities
- Add locations, timings, and descriptions to itinerary items

#### Collaboration
- Invite users to travel plans
- Manage trip members with role-based permissions (OWNER, ADMIN, EDITOR, VIEWER)
- Real-time chat within travel plans
- Create and manage chat threads
- Send, edit, and delete messages

#### Expense Management
- Create and track expenses for travel plans
- Split expenses equally, by percentage, or custom amounts
- Mark expenses as settled
- View expense summaries and settlement reports
- Track who paid and who owes what

#### Meetups & Events
- Create meetups for travel plans
- Schedule meetups with location and time
- RSVP to meetups (ACCEPTED/DECLINED)
- Update meetup status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- Enforce maximum participants limit

#### Media & Photos
- Upload multiple images (up to 10 files per request)
- Associate media with travel plans, meetups, or itinerary items
- View media galleries
- Delete uploaded media
- Support for JPEG, PNG, and WebP formats

#### Reviews & Ratings
- Review other users (USER_TO_USER)
- Review travel plans (USER_TO_TRIP)
- Rate with 1-5 stars
- Add comments to reviews
- Edit and delete own reviews
- View review statistics

#### Subscriptions & Payments
- Subscribe to monthly or yearly plans
- View subscription status
- Manage subscription (cancel, update)
- View payment history
- Access payment summaries and statistics
- Unlimited AI usage with active subscription

#### Profile Management
- Update profile information
- Upload and update profile photo
- View own travel plans
- View given and received reviews

#### Notifications
- Receive real-time notifications
- Mark notifications as read
- Filter notifications by type
- View unread notification count

### 🔐 Admin Features
- View all users with pagination and filters
- Update user status (ACTIVE, SUSPENDED, DELETED)
- Verify users
- Update user roles
- Soft delete users
- View all travel plans
- View all subscriptions
- View all payments
- Access payment statistics
- View all reviews
- Full access to all modules

## 📁 Folder Structure

```
travel-buddy-backend/
├── src/
│   ├── app/
│   │   ├── modules/              # Feature modules
│   │   │   ├── auth/             # Authentication (register, login, refresh token)
│   │   │   ├── user/             # User management (profile, admin)
│   │   │   ├── travelPlan/       # Travel plan CRUD operations
│   │   │   ├── tripMember/       # Trip member management
│   │   │   ├── itinerary/        # Itinerary item management
│   │   │   ├── planner/          # AI-powered travel planner
│   │   │   ├── chat/             # Real-time chat system
│   │   │   ├── notification/     # Notification system
│   │   │   ├── meetup/           # Meetup scheduling
│   │   │   ├── expense/          # Expense tracking and splitting
│   │   │   ├── subscription/     # Subscription management (Stripe)
│   │   │   ├── payment/          # Payment transaction tracking
│   │   │   ├── media/            # Media upload and management
│   │   │   └── review/           # Reviews and ratings
│   │   ├── middlewares/          # Express middlewares
│   │   │   ├── auth.ts           # JWT authentication middleware
│   │   │   ├── validateRequest.ts # Request validation middleware
│   │   │   ├── upload.ts         # File upload middleware (Multer)
│   │   │   ├── globalErrorHandler.ts # Global error handler
│   │   │   └── notFound.ts       # 404 handler
│   │   ├── shared/               # Shared utilities
│   │   │   ├── prisma.ts         # Prisma client instance
│   │   │   ├── catchAsync.ts     # Async error wrapper
│   │   │   └── sendResponse.ts   # Response formatter
│   │   ├── helper/               # Helper functions
│   │   │   ├── jwtHelper.ts      # JWT token utilities
│   │   │   ├── paginationHelper.ts # Pagination utilities
│   │   │   ├── cloudinary.ts     # Cloudinary configuration
│   │   │   └── aiUsageHelper.ts  # AI usage quota management
│   │   ├── errors/               # Error classes
│   │   │   └── ApiError.ts       # Custom API error class
│   │   └── routes/               # Route definitions
│   │       └── index.ts          # Main router (registers all modules)
│   ├── config/                   # Configuration
│   │   ├── index.ts             # Environment variables
│   │   └── stripe.ts             # Stripe configuration
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # Server entry point
├── prisma/
│   └── schema/                   # Prisma schema files
│       ├── enum.prisma           # Enums (Role, TravelType, etc.)
│       ├── user.prisma           # User model
│       ├── travelPlan.prisma     # TravelPlan model
│       ├── tripMember.prisma     # TripMember model
│       ├── itineraryItem.prisma # ItineraryItem model
│       ├── plannerSession.prisma # PlannerSession model
│       ├── chatThread.prisma     # ChatThread model
│       ├── message.prisma        # Message model
│       ├── notification.prisma    # Notification model
│       ├── meetup.prisma         # Meetup model
│       ├── expense.prisma        # Expense model
│       ├── subscription.prisma   # Subscription model
│       ├── paymentTransaction.prisma # PaymentTransaction model
│       ├── media.prisma          # Media model
│       └── review.prisma         # Review model
└── uploads/                      # Temporary upload directory
```

## 🔐 Authentication & Authorization

TravelBuddy Backend uses **JWT (JSON Web Tokens)** for authentication with the following implementation:

### Authentication Flow
1. **Registration/Login**: User registers or logs in with email and password
2. **Token Generation**: Server generates JWT access token and refresh token
3. **Cookie Storage**: Access token is stored in httpOnly cookie for security
4. **Token Validation**: Each protected route validates the token from cookies
5. **Role-Based Access**: Tokens contain user role (USER/ADMIN) for authorization

### Token Structure
- **Access Token**: Contains `userId`, `email`, and `role`
- **Refresh Token**: Used to generate new access tokens
- **Cookie Settings**: httpOnly, secure (in production), sameSite protection

### Authorization Levels
- **Public**: No authentication required (limited endpoints)
- **USER**: Authenticated users can access user-specific features
- **ADMIN**: Administrators have full access to all features

### Protected Routes
All routes except authentication endpoints require valid JWT token in cookies. The `auth()` middleware validates tokens and enforces role-based access control.

## 📡 API Endpoints

**Base URL**: `/api/v1`

### 🔑 Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh-token` - Refresh access token
- `GET /me` - Get current user info

### 👤 Users (`/api/v1/users`)
- `GET /me` - Get my profile
- `PATCH /me` - Update my profile
- `PATCH /me/photo` - Update profile photo
- `GET /me/travel-plans` - Get my travel plans
- `GET /me/reviews` - Get my reviews (given/received)
- `GET /admin` - Get all users (admin only)
- `PATCH /admin/:id/status` - Update user status (admin only)
- `PATCH /admin/:id/verify` - Verify user (admin only)
- `PATCH /admin/:id/role` - Update user role (admin only)
- `DELETE /admin/:id` - Soft delete user (admin only)

### 🗺️ Travel Plans (`/api/v1/travel-plans`)
- `POST /` - Create travel plan
- `GET /` - Get my travel plans
- `GET /:id` - Get single travel plan
- `PATCH /:id` - Update travel plan
- `DELETE /:id` - Delete travel plan

### 👥 Trip Members (`/api/v1/trip-members`)
- `POST /` - Add member to travel plan
- `GET /:planId` - Get all members of a plan
- `PATCH /:id/role` - Update member role
- `DELETE /:id` - Remove member from plan

### 📅 Itinerary (`/api/v1/itinerary`)
- `POST /` - Create itinerary item
- `GET /:planId` - Get all items for a plan (grouped by day)
- `GET /item/:id` - Get single itinerary item
- `PATCH /:id` - Update itinerary item
- `DELETE /:id` - Delete itinerary item
- `POST /bulk` - Bulk upsert items (for AI Planner)
- `PATCH /reorder` - Reorder itinerary items

### 🤖 AI Planner (`/api/v1/planner`)
- `POST /` - Create planner session
- `POST /:id/step` - Add step to session
- `POST /:id/complete` - Complete session and create travel plan
- `GET /:id` - Get single session
- `GET /` - Get my sessions (with pagination)

### 💬 Chat (`/api/v1/chat`)
- `POST /threads` - Create chat thread
- `GET /threads/:id` - Get thread by ID
- `GET /threads` - Find thread by plan ID
- `POST /threads/:id/members` - Add member to thread
- `GET /threads/:id/messages` - Get messages (cursor pagination)
- `POST /threads/:id/messages` - Send message
- `PATCH /messages/:id` - Edit message
- `DELETE /messages/:id` - Delete message

### 🔔 Notifications (`/api/v1/notifications`)
- `GET /` - Get notifications (with pagination and filters)
- `PATCH /:id/read` - Mark notification as read
- `PATCH /read-all` - Mark all notifications as read
- `GET /unread-count` - Get unread notification count

### 📍 Meetups (`/api/v1/meetups`)
- `POST /` - Create meetup
- `GET /` - Get meetups (with filters)
- `GET /:id` - Get single meetup
- `PATCH /:id` - Update meetup
- `PATCH /:id/status` - Update meetup status
- `POST /:id/rsvp` - RSVP to meetup
- `DELETE /:id` - Delete meetup

### 💰 Expenses (`/api/v1/expenses`)
- `POST /` - Create expense
- `GET /` - Get expenses (with pagination and filters)
- `GET /:id` - Get single expense
- `PATCH /:id` - Update expense
- `DELETE /:id` - Delete expense
- `PATCH /:id/settle/:participantId` - Settle expense participant
- `GET /summary` - Get expense summary for plan

### 💳 Subscriptions (`/api/v1/subscriptions`)
- `GET /status` - Get current subscription status
- `POST /` - Create subscription
- `GET /` - Get all subscriptions (admin only)
- `GET /:id` - Get single subscription
- `PATCH /:id` - Update subscription
- `DELETE /:id` - Cancel subscription
- `POST /webhook` - Stripe webhook endpoint

### 💵 Payments (`/api/v1/payments`)
- `GET /:id` - Get single payment
- `GET /my-payments` - Get user's payment history
- `GET /summary` - Get payment summary
- `GET /` - Get all payments (admin only)
- `GET /statistics` - Get payment statistics (admin only)

### 📸 Media (`/api/v1/media`)
- `POST /` - Upload media (multiple files)
- `GET /:id` - Get single media
- `GET /` - Get media list (with filters)
- `DELETE /:id` - Delete media

### ⭐ Reviews (`/api/v1/reviews`)
- `POST /` - Create review
- `GET /statistics` - Get review statistics
- `GET /:id` - Get single review
- `GET /` - Get reviews list (with filters)
- `PATCH /:id` - Update review
- `DELETE /:id` - Delete review

## 📦 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd travel-buddy-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@host:port/database?schema=public

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d
RESET_PASS_TOKEN=your_reset_password_secret_here
RESET_PASS_TOKEN_EXPIRES_IN=1h
RESET_PASS_LINK=http://localhost:3000/reset-password

# Password Hashing
SALT_ROUND=10

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL_NAME=google/gemini-2.0-flash-exp:free

# AI Configuration (uses OpenRouter if provided)
AI_MODEL_NAME=google/gemini-2.0-flash-exp:free
AI_API_KEY=your_ai_api_key

# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 5. Start the Server

#### For Development

```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

#### For Production

```bash
# Build the project
npm run build

# Start the production server
npm start
```

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 📫 Author

**Hamza Aryan Sapnil**  
📍 Bangladesh  
🌐 [LinkedIn](https://linkedin.com/in/hamza-aryan-sapnil)  
💻 Full Stack Developer

## 📄 License

This project is licensed for educational purposes under MIT.
