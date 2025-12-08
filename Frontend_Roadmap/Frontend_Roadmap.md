# TravelBuddy Frontend Implementation Roadmap

Complete implementation guide for building the TravelBuddy frontend application. This roadmap provides detailed specifications for every page, component, form, and feature.

---

## Table of Contents

1. [Project Overview & Tech Stack](#1-project-overview--tech-stack)
2. [Navigation Structure](#2-navigation-structure)
3. [Public Routes](#3-public-routes)
4. [Authentication Pages](#4-authentication-pages)
5. [Dashboard - Complete Structure](#5-dashboard---complete-structure)
6. [Form Validation & Error Handling](#6-form-validation--error-handling)
7. [Loading States & Empty States](#7-loading-states--empty-states)
8. [Responsive Design Guidelines](#8-responsive-design-guidelines)
9. [Implementation Order](#9-implementation-order)

---

## 1. Project Overview & Tech Stack

### 1.1 Recommended Technology Stack

**Core Framework:**

- **React.js** (v18+) or **Next.js** (v14+) - Choose based on SSR needs
- **TypeScript** (v5+) - For type safety
- **Tailwind CSS** (v3+) - For styling

**State Management:**

- **React Query** or **SWR** - For server state management
- **Context API** or **Zustand** - For global client state
- **React Hook Form** - For form state management

**Form Handling & Validation:**

- **React Hook Form** - Form library
- **Zod** - Schema validation (matches backend)

**HTTP Client:**

- **Axios** or native **Fetch API** - For API calls

**Payment Integration:**

- **@stripe/stripe-js** - Stripe JavaScript SDK
- **@stripe/react-stripe-js** - React Stripe components

**File Upload:**

- **Cloudinary** - For image upload and optimization

**Routing:**

- **React Router** (if using React) or **Next.js Router** (if using Next.js)

**UI Components:**

- **Headless UI** or **Radix UI** - Accessible component primitives
- **React Icons** or **Lucide React** - Icon library

**Date Handling:**

- **date-fns** or **Day.js** - Date manipulation

**Build Tools:**

- **Vite** (if using React) or **Next.js** built-in (if using Next.js)
- **ESLint** + **Prettier** - Code quality

### 1.2 Project Structure

```
travel-buddy-frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Buttons, Inputs, Cards, etc.
│   │   ├── layout/         # Navbar, Footer, Sidebar
│   │   └── features/       # Feature-specific components
│   ├── pages/              # Page components
│   │   ├── public/         # Public pages
│   │   ├── auth/           # Auth pages
│   │   └── dashboard/      # Dashboard pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service functions
│   ├── store/              # State management
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   ├── constants/          # Constants and enums
│   └── App.tsx             # Main app component
├── public/                 # Static assets
└── package.json
```

### 1.3 Design System Guidelines

**Color Palette:**

- Primary: Blue (#3B82F6)
- Secondary: Teal (#14B8A6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Gray Scale: Gray-50 to Gray-900

**Typography:**

- Headings: Inter or Poppins (Bold)
- Body: Inter (Regular)
- Font Sizes: 12px, 14px, 16px, 18px, 24px, 32px, 48px

**Spacing:**

- Use Tailwind spacing scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

**Component Library:**

- Create reusable components: Button, Input, Card, Modal, Dropdown, etc.
- Follow consistent naming: PascalCase for components

---

## 2. Navigation Structure

### 2.1 Public Navbar (Not Logged In)

**Layout:**

```
[Logo]  [Home] [All Plans] [About Us] [Contact]  [Login] [Register]
```

**Components:**

- **Logo** (left): Clickable, links to `/`
- **Navigation Links** (center):
  - Home (`/`)
  - All Plans (`/plans`)
  - About Us (`/about`)
  - Contact (`/contact`)
- **Auth Buttons** (right):
  - Login Button → `/login`
  - Register Button → `/register`

**Styling:**

- Sticky navbar (stays at top on scroll)
- Mobile: Hamburger menu, collapsible navigation

### 2.2 Private Navbar (Logged In)

**Layout:**

```
[Logo]  [Home] [All Plans] [About Us] [Contact]  [Dashboard] [User Menu ▼]
```

**Components:**

- **Logo** (left): Clickable, links to `/dashboard`
- **Navigation Links** (center): Same as public navbar
- **User Menu** (right, dropdown):
  - Dashboard → `/dashboard`
  - Profile → `/dashboard/profile`
  - Notifications → `/dashboard/notifications` (with unread badge)
  - Logout Button

**User Menu Dropdown:**

- User avatar/name at top
- Menu items with icons
- Divider before logout
- Logout confirmation (optional)

---

## 3. Public Routes

### 3.1 Homepage (`/`)

#### Navbar

- Use public navbar (section 2.1)

#### Hero Section

**Layout:** Full-width section with background image/gradient

**Content:**

- **Headline:** "Plan Your Perfect Trip with TravelBuddy"
- **Subheadline:** "Create, collaborate, and explore the world with friends. AI-powered travel planning made simple."
- **CTA Buttons:**
  - Primary: "Get Started" → `/register`
  - Secondary: "Explore Plans" → `/plans`

**Visual:** Background image of travel destination or animated illustration

**Styling:**

- Large, bold headline (48px+)
- Centered content
- Gradient overlay on background image
- CTA buttons: Primary (blue), Secondary (outline)

---

#### Section 1 - Key Features

**Title:** "Why Choose TravelBuddy?"

**Subtitle:** "Everything you need to plan and enjoy your perfect trip"

**Features Grid** (4 features in 2x2 or 1x4 layout):

**Feature 1: AI-Powered Planning**

- **Icon:** Brain/AI icon (Sparkles or Brain icon)
- **Title:** "AI-Powered Planning"
- **Description:** "Get personalized travel itineraries powered by advanced AI. Just answer a few questions and let our AI create the perfect plan for you."

**Feature 2: Collaborate with Friends**

- **Icon:** Users/Group icon
- **Title:** "Collaborate with Friends"
- **Description:** "Invite friends to your travel plans, share ideas, and plan together. Real-time chat and notifications keep everyone in sync."

**Feature 3: Smart Expense Tracking**

- **Icon:** Dollar/Chart icon
- **Title:** "Smart Expense Tracking"
- **Description:** "Split expenses easily, track who paid what, and settle up with friends. Never worry about money management during trips."

**Feature 4: Organize Everything**

- **Icon:** Calendar/Checklist icon
- **Title:** "Organize Everything"
- **Description:** "Manage your itinerary, meetups, media, and reviews all in one place. Stay organized and never miss a detail."

**Styling:**

- Card layout with icon, title, description
- Hover effects
- Responsive grid (1 column mobile, 2 columns tablet, 4 columns desktop)

---

#### Section 2 - How It Works

**Title:** "How It Works"

**Subtitle:** "Plan your trip in three simple steps"

**Steps** (3 steps with icons, horizontal or vertical layout):

**Step 1: Create Your Plan**

- **Icon:** Plus/Create icon
- **Title:** "Create Your Plan"
- **Description:** "Sign up and create your travel plan. Set destination, dates, budget, and travel type. Or use our AI planner for instant suggestions."

**Step 2: Invite & Collaborate**

- **Icon:** Users/Invite icon
- **Title:** "Invite & Collaborate"
- **Description:** "Invite friends to join your plan. Collaborate on itinerary, share expenses, schedule meetups, and chat in real-time."

**Step 3: Travel & Enjoy**

- **Icon:** Plane/Travel icon
- **Title:** "Travel & Enjoy"
- **Description:** "Follow your itinerary, track expenses, share photos, and create memories. Review your trip and plan your next adventure!"

**Styling:**

- Numbered steps or icon-based
- Visual flow (arrows connecting steps)
- Responsive layout

---

#### Section 3 - Testimonials/Statistics

**Title:** "Join Thousands of Happy Travelers"

**Content Options:**

**Option A - Statistics:**

- Display 4 stat cards:
  - "10,000+ Travel Plans Created"
  - "50,000+ Active Users"
  - "100+ Countries Explored"
  - "4.8/5 Average Rating"

**Option B - Testimonials:**

- Display 3 testimonial cards:

**Testimonial 1:**

- **Quote:** "TravelBuddy made planning our group trip so easy! The expense tracking feature saved us so much time."
- **Author:** "Sarah M."
- **Location:** "New York, USA"

**Testimonial 2:**

- **Quote:** "The AI planner suggested amazing places we never would have found. Best travel app ever!"
- **Author:** "John D."
- **Location:** "London, UK"

**Testimonial 3:**

- **Quote:** "Collaborating with friends on the itinerary was seamless. Highly recommend!"
- **Author:** "Emily R."
- **Location:** "Sydney, Australia"

**Styling:**

- Card layout with quote, author, location
- Star ratings (if testimonials)
- Responsive grid

---

#### Footer

**Layout:** 4 columns (desktop), stacked (mobile)

**Column 1 - Company:**

- **Title:** "Company"
- **Links:**
  - About Us → `/about`
  - Contact → `/contact`
  - Blog (if exists)
  - Careers (if exists)

**Column 2 - Features:**

- **Title:** "Features"
- **Links:**
  - AI Planner
  - Collaboration
  - Expenses
  - Reviews

**Column 3 - Support:**

- **Title:** "Support"
- **Links:**
  - Help Center
  - FAQ
  - Privacy Policy
  - Terms of Service

**Column 4 - Connect:**

- **Title:** "Connect"
- **Social Media Icons:**
  - Facebook
  - Twitter
  - Instagram
  - LinkedIn

**Bottom Bar:**

- Copyright: "© 2024 TravelBuddy. All rights reserved."

**Styling:**

- Dark background
- Light text
- Hover effects on links
- Social icons with hover states

---

### 3.2 All Plans Page (`/plans`)

#### Header Section

**Title:** "Explore Travel Plans"

**Description:** "Discover amazing travel plans created by our community or create your own"

**Styling:**

- Large title (32px+)
- Centered or left-aligned
- Margin bottom for spacing

---

#### API Integration

**Get Public Travel Plans:**
- **Endpoint:** `GET /api/v1/travel-plans/public`
- **Authentication:** Not required (public endpoint)
- **Query Parameters:**
  - `travelType`: "SOLO" | "COUPLE" | "FAMILY" | "FRIENDS" | "GROUP" (optional, filter by travel type)
  - `searchTerm`: Search in title, destination, origin (optional)
  - `isFeatured`: "true" | "false" (optional, filter by featured status)
  - `sortBy`: "createdAt" | "startDate" | "budgetMin" (optional, default: "startDate")
  - `sortOrder`: "asc" | "desc" (optional, default: "asc")
  - `page`: Page number (optional, default: 1)
  - `limit`: Items per page (optional, default: 10)
- **Note:** 
  - Returns only PUBLIC plans (visibility: PUBLIC)
  - No authentication required
  - Supports pagination, filtering, search, and sorting
- **Response Structure:**
```json
{
  "success": true,
  "message": "Public travel plans retrieved successfully.",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  },
  "data": [
    {
      "id": "uuid",
      "title": "Plan Title",
      "destination": "Location",
      "origin": "Origin Location",
      "startDate": "2025-09-15T00:00:00.000Z",
      "endDate": "2025-09-21T00:00:00.000Z",
      "travelType": "FRIENDS",
      "budgetMin": 5000,
      "budgetMax": 12000,
      "visibility": "PUBLIC",
      "coverPhoto": "url",
      "description": "Description text",
      "owner": {
        "id": "uuid",
        "fullName": "Owner Name",
        "profileImage": "url"
      },
      "_count": {
        "itineraryItems": 10,
        "tripMembers": 5
      },
      "totalDays": 7
    }
  ]
}
```

---

#### Filters Section

**Search Bar:**

- **Placeholder:** "Search plans by destination, title..."
- **Icon:** Search icon
- **Functionality:** Real-time search as user types
- **API Parameter:** `searchTerm`

**Filter Dropdowns:**

- **Travel Type:** All, Solo, Couple, Family, Friends, Group
  - **API Parameter:** `travelType` (values: "SOLO", "COUPLE", "FAMILY", "FRIENDS", "GROUP")
- **Featured:** All, Featured Only
  - **API Parameter:** `isFeatured` (values: "true" | "false")
- **Sort By:** Newest, Oldest, Budget (Low to High), Budget (High to Low), Start Date
  - **API Parameter:** `sortBy` (values: "createdAt", "startDate", "budgetMin")
  - **API Parameter:** `sortOrder` (values: "asc", "desc")
- **Note:** Only PUBLIC plans are shown (no visibility filter needed)

**Clear Filters Button:**

- "Clear All Filters" (shown when filters are active)

**Styling:**

- Horizontal layout (desktop), stacked (mobile)
- Dropdowns with proper styling
- Active filter indicators

---

#### Plan Cards Grid

**Card Layout** (each card):

- **Cover Image:** Full-width image or placeholder
- **Badge:** Travel Type (SOLO, COUPLE, etc.) - top right corner
- **Title:** Plan title (bold, 18px)
- **Destination:** Location with map pin icon
- **Date Range:** Start date - End date with calendar icon
- **Budget Range:** "Budget: $X - $Y" or "Budget: $X+" with dollar icon
- **Visibility Badge:** Public/Private/Unlisted indicator
- **View Details Button:** Primary button at bottom

**Private Action** (if logged in and user is member):

- "Open in Dashboard" button (secondary)

**Styling:**

- Grid layout: 1 column (mobile), 2 columns (tablet), 3-4 columns (desktop)
- Card hover effects
- Image aspect ratio: 16:9
- Consistent card heights

---

#### Empty State

**Message:** "No travel plans found. Try adjusting your filters or create a new plan!"

**Button:** "Create Your First Plan" (redirects to login if not authenticated)

**Styling:**

- Centered content
- Large icon or illustration
- Friendly message
- CTA button

---

#### Pagination

**Components:**

- Previous button (disabled on first page)
- Page numbers (1, 2, 3, ...)
- Next button (disabled on last page)
- "Showing X-Y of Z plans" text

**Styling:**

- Centered pagination
- Active page highlighted
- Disabled state styling

---

#### Private Elements (Logged In Only)

**Floating Action Button:**

- "Create New Plan" button (floating, bottom right)
- Links to: `/dashboard/travel-plans/create`

**Styling:**

- Fixed position
- Circular button with icon
- Shadow for depth

---

### 3.3 Plan Details Page (`/plans/:id`)

#### API Integration

**Get Single Travel Plan:**
- **Endpoint:** `GET /api/v1/travel-plans/:id`
- **Authentication:** Optional (not required for PUBLIC plans)
- **Note:**
  - PUBLIC plans: Accessible without authentication
  - PRIVATE/UNLISTED plans: Authentication required (must be a plan member)
  - Returns 404 if plan doesn't exist
  - Returns 401 if authentication required but not provided
  - Returns 403 if user doesn't have access

**Response Structure:**
```json
{
  "success": true,
  "message": "Travel plan retrieved successfully.",
  "data": {
    "id": "uuid",
    "title": "Plan Title",
    "destination": "Location",
    "origin": "Origin Location",
    "startDate": "2025-09-15T00:00:00.000Z",
    "endDate": "2025-09-21T00:00:00.000Z",
    "travelType": "FRIENDS",
    "budgetMin": 5000,
    "budgetMax": 12000,
    "visibility": "PUBLIC",
    "coverPhoto": "url",
    "description": "Description text",
    "ownerId": "uuid",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Itinerary API:**
- **Endpoint:** `GET /api/v1/itinerary/:planId`
- **Authentication:** Not required for PUBLIC plans
- **Query Parameters:** `dayIndex` (optional, filter by day)
- **Note:** Returns complete itinerary items for the plan, grouped by days. All items visible, no limit. Accessible without authentication for PUBLIC plans.

**Media Gallery Preview API:**
- **Endpoint:** `GET /api/v1/media?planId=:planId`
- **Authentication:** Not required for PUBLIC plans
- **Query Parameters:** `type` (optional: "photo" | "video"), `page` (optional), `limit` (optional)
- **Note:** Returns media files associated with the plan. Accessible without authentication for PUBLIC plans.

**Reviews API:**
- **Endpoint:** `GET /api/v1/reviews?planId=:planId`
- **Authentication:** Not required for PUBLIC plans
- **Query Parameters:** `rating` (optional, 1-5), `source` (optional: "USER_TO_TRIP"), `page` (optional), `limit` (optional), `sortBy` (optional), `sortOrder` (optional)
- **Note:** Returns reviews for the travel plan (source: "USER_TO_TRIP"). Accessible without authentication for PUBLIC plans.

---

#### Public Sections (Visible to Everyone)

**Plan Header:**

- **Cover Image:** Full-width hero image
- **Title:** Large, bold (32px+)
- **Destination:** With map pin icon
- **Date Range:** Start date - End date
- **Travel Type Badge:** SOLO, COUPLE, etc.
- **Budget Range:** "Budget: $X - $Y"
- **Visibility Badge:** Public/Private/Unlisted
- **Description:** Full description text

**Full Itinerary:**

- **Section Title:** "Full Itinerary"
- **Content:** Complete itinerary (all days, all items)
- **Display:** 
  - All days visible (accordion or expanded)
  - All items per day
  - Day numbers + dates (calculated from plan startDate)
  - Timeline view (optional)
  - Item format: Time range (if available), Title, Description, Location
- **API:** Fetch from `GET /api/v1/itinerary/:planId` (no limit parameter, returns all items)
- **Authentication:** Not required for PUBLIC plans
- **No "View Full" button needed** (already showing complete itinerary)

**Media Gallery Preview:**

- **Section Title:** "Trip Photos"
- **Content:** First 6-9 images in grid
- **Layout:** 3-column grid
- **API:** Fetch from `GET /api/v1/media?planId=:planId&type=photo&limit=9`
- **Authentication:** Not required for PUBLIC plans
- **Button:** "View All Photos" (requires login, redirects to login if not authenticated)

**Reviews Section:**

- **Average Rating:** Star display (e.g., 4.5/5)
- **Review Count:** "Based on X reviews"
- **Recent Reviews:** Display 2-3 most recent reviews
- **Authentication:** Not required for PUBLIC plans
- **Link:** "View All Reviews" (requires login, redirects to login if not authenticated)

---

#### Action Buttons

**For Unauthenticated Users:**

- **"Create Your Plan" Button** (Primary, Large, Prominent)
  - **Text:** "Create Your Plan"
  - **Icon:** Plus icon
  - **Action:** Redirect to `/login?redirect=/dashboard/travel-plans/create`
  - **After login:** Redirect to create plan page
  - **Placement:** Centered, below plan details
  - **Message:** "Start planning your own adventure!"

**For Authenticated Users:**

- **"Open in Dashboard" Button** (if user is plan member)
  - **Text:** "Open in Dashboard"
  - **Links to:** `/dashboard/travel-plans/:id`
  - **Primary button style**
- **"Create New Plan" Button** (always available)
  - **Text:** "Create New Plan"
  - **Links to:** `/dashboard/travel-plans/create`
  - **Secondary button style**

---

#### Error Handling

**401 Unauthorized (PRIVATE/UNLISTED plan, no auth):**
- Show login prompt modal
- Message: "Please log in to view this plan"
- Buttons: "Login" → `/login?redirect=/plans/:id`, "Register" → `/register`, "Cancel"

**403 Forbidden (user doesn't have access):**
- Show message: "You don't have access to view this plan"
- Option to request access (if feature exists)

**404 Not Found:**
- Show message: "Travel plan not found"
- Link back to plans list

---

### 3.3.1 Itinerary Display in Plan Details

#### Full Itinerary View (Public)

**API Integration:**

- **Endpoint:** `GET /api/v1/itinerary/:planId`
- **Authentication:** Not required for PUBLIC plans
- **Response:** Grouped by days with all items
- **Response Structure:**
```json
{
  "success": true,
  "message": "Itinerary items retrieved successfully.",
  "data": {
    "days": [
      {
        "day": 1,
        "items": [
          {
            "id": "uuid",
            "planId": "uuid",
            "dayIndex": 1,
            "startAt": "2025-09-15T10:00:00.000Z",
            "endAt": "2025-09-15T12:00:00.000Z",
            "title": "Visit Beach",
            "description": "Relax at the beach",
            "locationId": "uuid",
            "order": 0,
            "location": {
              "id": "uuid",
              "name": "Cox's Bazar Beach",
              "address": "Beach Road",
              "city": "Cox's Bazar",
              "country": "Bangladesh"
            }
          }
        ]
      }
    ],
    "totalDays": 7
  }
}
```
- **Error Handling:**
  - If plan is PRIVATE and user not logged in: Show message "Login to view itinerary" with login button
  - If plan not found: 404 error
  - If user doesn't have access: 403 error

**Display Structure:**

- **Day Accordion/Cards:**
  - Each day as expandable section or card
  - Day number + Date (calculated from plan startDate)
  - Items listed chronologically (by startAt time if available, otherwise by order)
  - Default: All days expanded (or accordion with first day expanded)

- **Item Display Format:**
  - **Time Range** (if available): "10:00 AM - 12:00 PM" or "10:00 AM" (if only startAt)
  - **Title** (bold, prominent)
  - **Description** (if available, smaller text)
  - **Location** (if available): Location name with map pin icon
    - Clickable: Opens map or location details
  - **Duration** (calculated from startAt/endAt if both available)

**Styling:**

- **Timeline View (Optional):**
  - Vertical timeline connecting items
  - Time markers on left
  - Content on right
  - Visual flow from top to bottom

- **Card View (Alternative):**
  - Each item as a card
  - Clear visual hierarchy
  - Consistent spacing
  - Hover effects

- **Responsive Layout:**
  - Mobile: Stacked, single column
  - Tablet: 2 columns (if timeline view)
  - Desktop: Full timeline or grid layout

- **Visual Elements:**
  - Day separators (clear visual break)
  - Time indicators (if available)
  - Location icons
  - Smooth expand/collapse animations (if accordion)

**No Separate Page Needed:**

- Itinerary is fully visible in Plan Details page
- No "View Full Itinerary" button
- No redirect to separate itinerary page
- All items displayed inline

**Loading States:**

- Show skeleton loaders while fetching
- Progressive loading (show days as they load)

**Empty State:**

- If no itinerary items: "No itinerary planned yet"
- Show message in itinerary section

---

### 3.4 About Us Page (`/about`)

#### Section 1 - Mission

**Title:** "Our Mission"

**Content:**
"At TravelBuddy, we believe that travel planning should be simple, collaborative, and enjoyable. Our mission is to empower travelers to create unforgettable experiences by providing intelligent tools for planning, collaboration, and organization. We combine the power of AI with human creativity to help you discover new destinations, plan perfect itineraries, and travel with confidence."

**Styling:**

- Large, readable text
- Centered or left-aligned
- Generous spacing

---

#### Section 2 - Our Story

**Title:** "Our Story"

**Content:**
"TravelBuddy was born from a simple frustration: planning group trips was complicated and time-consuming. We set out to create a platform that makes travel planning as enjoyable as the trip itself. Founded in 2024, TravelBuddy has grown into a comprehensive platform trusted by thousands of travelers worldwide. We're constantly innovating to make your travel planning experience better."

**Styling:**

- Similar to Mission section
- Personal, engaging tone

---

#### Section 3 - Our Values

**Title:** "What We Stand For"

**Values Grid** (4 values):

**Value 1: Innovation**

- **Icon:** Lightbulb/Innovation icon
- **Title:** "Innovation"
- **Description:** "We leverage cutting-edge AI technology to simplify travel planning"

**Value 2: Collaboration**

- **Icon:** Users/Team icon
- **Title:** "Collaboration"
- **Description:** "We believe the best trips are planned together"

**Value 3: Transparency**

- **Icon:** Eye/Transparency icon
- **Title:** "Transparency"
- **Description:** "Clear pricing, honest features, no hidden costs"

**Value 4: User-Centric**

- **Icon:** Heart/User icon
- **Title:** "User-Centric"
- **Description:** "Your feedback drives our development"

**Styling:**

- Card layout
- Icon, title, description
- Responsive grid

---

#### Section 4 - Team (Optional)

**Title:** "Meet the Team"

**Team Member Cards:**

- Photo
- Name
- Role/Title
- Brief bio (optional)
- Social links (optional)

**Styling:**

- Grid layout
- Circular or rounded photos
- Professional appearance

---

### 3.5 Contact Us Page (`/contact`)

#### Contact Form

**Form Fields:**

**Name** (required):

- **Type:** text input
- **Label:** "Your Name"
- **Placeholder:** "Enter your name"
- **Validation:** Required, min 2 characters
- **Error:** "Name is required" or "Name must be at least 2 characters"

**Email** (required):

- **Type:** email input
- **Label:** "Your Email"
- **Placeholder:** "Enter your email"
- **Validation:** Required, valid email format
- **Error:** "Email is required" or "Please enter a valid email address"

**Subject** (required):

- **Type:** text input
- **Label:** "Subject"
- **Placeholder:** "What is this regarding?"
- **Validation:** Required, min 3 characters
- **Error:** "Subject is required" or "Subject must be at least 3 characters"

**Message** (required):

- **Type:** textarea
- **Label:** "Message"
- **Placeholder:** "Tell us how we can help..."
- **Validation:** Required, min 10 characters
- **Error:** "Message is required" or "Message must be at least 10 characters"
- **Rows:** 6-8

**Submit Button:**

- **Text:** "Send Message"
- **Loading State:** Show spinner during submission
- **Success Message:** "Thank you! We'll get back to you soon."
- **Error Message:** Display API error

**Styling:**

- Clean form layout
- Proper spacing
- Error messages below fields
- Success toast notification

---

#### Contact Information Section

**Title:** "Get in Touch"

**Information:**

- **Email:** support@travelbuddy.com (clickable mailto link)
- **Response Time:** "We typically respond within 24 hours"
- **Office Hours:** "Monday - Friday, 9 AM - 6 PM"

**Social Media Links:**

- Facebook
- Twitter
- Instagram
- LinkedIn

**Styling:**

- Side-by-side layout (desktop) or stacked (mobile)
- Icons for contact methods
- Hover effects on links

---

## 4. Authentication Pages

### 4.1 Login Page (`/login`)

#### Page Layout

**Options:**

- Split layout: Left side with image/branding, Right side with form
- Or centered form on full page

**Recommendation:** Split layout for better UX

---

#### API Integration

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Request Headers:**
- `Content-Type: application/json`

**Response:**
- **Status:** 200 OK
- **Cookies Set:** 
  - `accessToken` (httpOnly, secure)
  - `refreshToken` (httpOnly, secure)
- **Response Body:**
```json
{
  "success": true,
  "message": "User logged in successfully.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "USER",
      "status": "ACTIVE",
      "isVerified": true,
      "profileImage": "url"
    },
    "accessToken": "jwt-token",
    "refreshToken": "jwt-token"
  }
}
```

**Important Notes:**
- Tokens are automatically set in httpOnly cookies by the backend
- Frontend should NOT manually store tokens in localStorage/sessionStorage
- All subsequent API requests will automatically include cookies
- Ensure `credentials: 'include'` is set in fetch/axios requests
- For axios: `axios.defaults.withCredentials = true`

**Error Response Format:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errorMessages": [
    {
      "path": "email",
      "message": "Email is required."
    },
    {
      "path": "password",
      "message": "Password is required."
    }
  ]
}
```

---

#### Login Form

**Title:** "Welcome Back"

**Subtitle:** "Sign in to your account"

**Form Fields:**

**Email** (required):

- **Type:** email
- **Label:** "Email Address"
- **Placeholder:** "Enter your email"
- **Validation:** Required, valid email format
- **Error:** Display from `errorMessages` array (path: "email")
- **Backend Validation:** Email format validation

**Password** (required):

- **Type:** password
- **Label:** "Password"
- **Placeholder:** "Enter your password"
- **Show/Hide Toggle:** Eye icon to toggle visibility
- **Validation:** Required
- **Error:** Display from `errorMessages` array (path: "password")
- **Backend Validation:** Password required

**Remember Me** (optional):

- **Type:** checkbox
- **Label:** "Remember me for 30 days"
- **Default:** Unchecked
- **Note:** This is a UI-only feature. Token expiration is handled by backend cookies.

**Forgot Password Link:**

- **Text:** "Forgot your password?"
- **Link:** `/forgot-password` (if implemented)
- **Position:** Below password field

**Submit Button:**

- **Text:** "Sign In"
- **Loading State:** Show spinner, disable button during submission
- **API Call:** `POST /api/v1/auth/login` with `credentials: 'include'`
- **Success:** 
  - Tokens are automatically stored in cookies
  - Redirect to `/dashboard` or previous page (if stored)
  - Optionally fetch user profile using `GET /api/v1/auth/me`
- **Error:** Display error message below form

**Register Link:**

- **Text:** "Don't have an account? "
- **Link Text:** "Register here"
- **Link:** `/register`
- **Position:** Below submit button

---

#### Error Handling

**Error Response Structure:**
- Check `success: false` in response
- Display `message` as main error
- Display individual field errors from `errorMessages` array

**Common Errors:**

- **Validation Errors:**
  - "Email is required."
  - "Password is required."
  - "Please enter a valid email address."
  - Display field-specific errors from `errorMessages` array

- **Authentication Errors:**
  - "Invalid email or password" (401)
  - "Account suspended. Please contact support." (403)
  - "Too many login attempts. Please try again later." (429)

- **Network Errors:**
  - "Connection error. Please try again."
  - "Network request failed."

**Display:**

- Error banner at top of form for general errors
- Field-specific errors below each input field
- Red text, clear message
- Auto-dismiss after 5 seconds (optional)
- Format: Show `message` as main error, then individual `errorMessages` for each field

---

### 4.2 Register Page (`/register`)

#### Page Layout

Same as login page (split or centered)

---

#### API Integration

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fullName": "John Doe"
}
```

**Request Headers:**
- `Content-Type: application/json`

**Response:**
- **Status:** 201 Created
- **Cookies Set:** 
  - `accessToken` (httpOnly, secure)
  - `refreshToken` (httpOnly, secure)
- **Response Body:**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "USER",
      "status": "ACTIVE",
      "isVerified": false,
      "profileImage": null
    },
    "accessToken": "jwt-token",
    "refreshToken": "jwt-token"
  }
}
```

**Important Notes:**
- Tokens are automatically set in httpOnly cookies by the backend (same as login)
- User is automatically logged in after registration
- Frontend should NOT manually store tokens
- Ensure `credentials: 'include'` is set in fetch/axios requests
- For axios: `axios.defaults.withCredentials = true`

**Error Response Format:**
```json
{
  "success": false,
  "message": "Validation Error",
  "errorMessages": [
    {
      "path": "email",
      "message": "Email is required!"
    },
    {
      "path": "password",
      "message": "Password must be at least 8 characters long."
    }
  ]
}
```

---

#### Registration Form

**Title:** "Create Your Account"

**Subtitle:** "Join TravelBuddy and start planning amazing trips"

**Form Fields:**

**Full Name** (optional):

- **Type:** text
- **Label:** "Full Name"
- **Placeholder:** "Enter your full name"
- **Validation:** 
  - Min 2 characters, max 100 characters (if provided)
  - Optional field (can be empty)
- **Error:** Display from `errorMessages` array (path: "fullName")
  - "Full name is required!" (if backend requires it)
  - "Full name must be at least 2 characters long."
  - "Full name cannot exceed 100 characters."
- **Backend Validation:** Optional, but if provided: min 2, max 100 chars

**Email** (required):

- **Type:** email
- **Label:** "Email Address"
- **Placeholder:** "Enter your email"
- **Validation:** Required, valid email format
- **Error:** Display from `errorMessages` array (path: "email")
  - "Email is required!"
  - "Invalid email address format."
  - "This email is already registered" (409 Conflict - duplicate email)
- **Backend Validation:** Required, valid email format
- **Duplicate Check:** Backend returns 409 if email already exists

**Password** (required):

- **Type:** password
- **Label:** "Password"
- **Placeholder:** "Create a password"
- **Show/Hide Toggle:** Eye icon
- **Password Strength Indicator:** Visual indicator (weak/medium/strong) - recommended for UX
- **Validation Rules** (display as user types, match backend requirements):
  - ✓ Minimum 8 characters
  - ✓ At least 1 uppercase letter (A-Z)
  - ✓ At least 1 number (0-9)
  - ✓ At least 1 special character (!@#$%^&\*)
- **Error:** Display from `errorMessages` array (path: "password")
  - "Password is required!"
  - "Password must be at least 8 characters long."
  - "Password must contain at least 1 uppercase letter."
  - "Password must contain at least 1 special character."
  - "Password must contain at least 1 number."
- **Backend Validation:** Required, min 8 chars, must have uppercase, special char, and number

**Confirm Password** (required - frontend only):

- **Type:** password
- **Label:** "Confirm Password"
- **Placeholder:** "Confirm your password"
- **Show/Hide Toggle:** Eye icon
- **Validation:** Must match password field (client-side validation only)
- **Error:** "Passwords do not match" (frontend validation, not sent to backend)
- **Note:** This field is NOT sent to backend. It's for UX only to prevent typos.

**Terms & Conditions** (required - frontend only):

- **Type:** checkbox
- **Label:** "I agree to the Terms of Service and Privacy Policy"
- **Links:** Terms and Privacy Policy (open in new tab)
- **Validation:** Required (client-side only, prevents form submission)
- **Error:** "You must agree to the terms to continue" (frontend validation)
- **Note:** This is not sent to backend. It's a frontend requirement for legal compliance.

**Submit Button:**

- **Text:** "Create Account"
- **Loading State:** Show spinner, disable button during submission
- **API Call:** `POST /api/v1/auth/register` with `credentials: 'include'`
- **Success:** 
  - Tokens are automatically stored in cookies
  - User is automatically logged in
  - Redirect to `/dashboard`
  - Optionally fetch user profile using `GET /api/v1/auth/me`
  - Show success message: "Account created successfully!"
- **Error:** Display error message below form

**Login Link:**

- **Text:** "Already have an account? "
- **Link Text:** "Sign in here"
- **Link:** `/login`
- **Position:** Below submit button

---

#### Error Handling

**Error Response Structure:**
- Check `success: false` in response
- Display `message` as main error
- Display individual field errors from `errorMessages` array

**Common Errors:**

- **Validation Errors:**
  - "Email is required!"
  - "Invalid email address format."
  - "Password is required!"
  - "Password must be at least 8 characters long."
  - "Password must contain at least 1 uppercase letter."
  - "Password must contain at least 1 special character."
  - "Password must contain at least 1 number."
  - "Full name must be at least 2 characters long." (if provided)
  - "Full name cannot exceed 100 characters." (if provided)
  - Display field-specific errors from `errorMessages` array

- **Duplicate Email Error:**
  - "This email is already registered" (409 Conflict)
  - Display as field error for email field

- **Network Errors:**
  - "Connection error. Please try again."
  - "Network request failed."

**Display:**

- Error banner at top of form for general errors
- Field-specific errors below each input field
- Red text, clear message
- Auto-dismiss after 5 seconds (optional)
- Format: Show `message` as main error, then individual `errorMessages` for each field

---

#### Success Flow

**After Registration:**

- Show success message: "Account created successfully!"
- User is automatically logged in (tokens in cookies)
- Redirect to `/dashboard`
- Welcome email sent by backend (no frontend action needed)
- Optionally show onboarding tour or welcome modal

---

## 5. Dashboard - Complete Structure

### 5.1 Dashboard Layout

#### Sidebar Navigation (Collapsible on Mobile)

**Logo/Header:**

- TravelBuddy logo
- User name/avatar
- Collapse/expand button (mobile)

**Menu Items:**

1. **Dashboard Overview**
   - **Icon:** Home icon
   - **Route:** `/dashboard`
   - **Label:** "Dashboard"

2. **My Travel Plans**
   - **Icon:** Map icon
   - **Route:** `/dashboard/travel-plans`
   - **Label:** "My Travel Plans"

3. **Create Travel Plan**
   - **Icon:** Plus icon
   - **Route:** `/dashboard/travel-plans/create`
   - **Label:** "Create Plan"

4. **AI Planner**
   - **Icon:** Sparkles/AI icon
   - **Route:** `/dashboard/planner`
   - **Label:** "AI Planner"

5. **Expenses**
   - **Icon:** Dollar icon
   - **Route:** `/dashboard/expenses`
   - **Label:** "Expenses"

6. **Meetups**
   - **Icon:** Calendar icon
   - **Route:** `/dashboard/meetups`
   - **Label:** "Meetups"

7. **Media Gallery**
   - **Icon:** Image icon
   - **Route:** `/dashboard/media`
   - **Label:** "Media"

8. **Chat**
   - **Icon:** Message icon
   - **Route:** `/dashboard/chat`
   - **Label:** "Chat"

9. **Reviews**
   - **Icon:** Star icon
   - **Route:** `/dashboard/reviews`
   - **Label:** "Reviews"

10. **Subscriptions**
    - **Icon:** Credit Card icon
    - **Route:** `/dashboard/subscriptions`
    - **Label:** "Subscriptions"

11. **Payments**
    - **Icon:** Receipt icon
    - **Route:** `/dashboard/payments`
    - **Label:** "Payments"

12. **Notifications**
    - **Icon:** Bell icon
    - **Route:** `/dashboard/notifications`
    - **Label:** "Notifications"
    - **Badge:** Unread count (red dot with number)

13. **Profile Settings**
    - **Icon:** User icon
    - **Route:** `/dashboard/profile`
    - **Label:** "Profile"

**Styling:**

- Active route highlighted
- Hover effects
- Icons + labels
- Mobile: Collapsible sidebar (hamburger menu)

---

#### Main Content Area

**Header:**

- Page title
- Breadcrumbs (optional)
- Action buttons (page-specific)

**Content Area:**

- Changes based on route
- Proper spacing and padding
- Responsive layout

---

### 5.2 Dashboard Overview (`/dashboard`)

#### Page Title

"Dashboard"

---

#### API Integration

**User Dashboard Overview:**
- **Endpoint:** `GET /api/v1/dashboard/overview`
- **Authentication:** Required (USER or ADMIN)
- **Response Structure:**
```json
{
  "success": true,
  "message": "User dashboard overview retrieved successfully.",
  "data": {
    "stats": {
      "totalPlans": 10,
      "upcomingTrips": 3,
      "totalExpenses": 5000.50,
      "activeSubscription": true
    },
    "charts": {
      "expensesByCategory": [
        {
          "category": "FOOD",
          "amount": 2000.00,
          "percentage": 40.00
        },
        {
          "category": "TRANSPORT",
          "amount": 1500.00,
          "percentage": 30.00
        }
      ],
      "plansTimeline": [
        {
          "month": "2025-01",
          "count": 2
        },
        {
          "month": "2025-02",
          "count": 5
        }
      ]
    },
    "recentActivity": [
      {
        "type": "PLAN_CREATED",
        "message": "You created plan 'Trip to Paris'",
        "timestamp": "2025-01-15T10:30:00Z",
        "link": "/dashboard/travel-plans/:id"
      }
    ],
    "upcomingMeetups": [
      {
        "id": "uuid",
        "planTitle": "Weekend Getaway",
        "location": "Cox's Bazar",
        "scheduledAt": "2025-02-20T14:00:00Z",
        "rsvpStatus": "ACCEPTED"
      }
    ],
    "recentNotifications": [
      {
        "id": "uuid",
        "type": "MEMBER_JOINED",
        "message": "John joined your plan",
        "isRead": false,
        "timestamp": "2025-01-15T09:00:00Z",
        "link": "/dashboard/travel-plans/:id"
      }
    ]
  }
}
```

**Admin Dashboard Overview:**
- **Endpoint:** `GET /api/v1/dashboard/admin/overview`
- **Authentication:** Required (ADMIN only)
- **Response Structure:**
```json
{
  "success": true,
  "message": "Admin dashboard overview retrieved successfully.",
  "data": {
    "stats": {
      "totalUsers": 150,
      "activeUsers": 120,
      "totalPlans": 500,
      "publicPlans": 200,
      "totalRevenue": 50000.00,
      "activeSubscriptions": 80,
      "totalMeetups": 300,
      "totalExpenses": 100000.00
    },
    "charts": {
      "revenueOverTime": [
        {
          "month": "2025-01",
          "revenue": 5000.00
        },
        {
          "month": "2025-02",
          "revenue": 7500.00
        }
      ],
      "plansByTravelType": [
        {
          "type": "SOLO",
          "count": 50
        },
        {
          "type": "FRIENDS",
          "count": 120
        }
      ],
      "userGrowth": [
        {
          "month": "2025-01",
          "newUsers": 25
        },
        {
          "month": "2025-02",
          "newUsers": 40
        }
      ],
      "subscriptionStatus": [
        {
          "status": "ACTIVE",
          "count": 150,
          "percentage": 75.00
        },
        {
          "status": "CANCELLED",
          "count": 30,
          "percentage": 15.00
        }
      ]
    },
    "recentActivity": [
      {
        "type": "USER_REGISTERED",
        "message": "New user registered: john@example.com",
        "timestamp": "2025-01-15T10:30:00Z",
        "link": "/admin/users/:id"
      }
    ],
    "topPlans": [
      {
        "id": "uuid",
        "title": "Summer Trip",
        "memberCount": 15,
        "expenseCount": 25,
        "isFeatured": true
      }
    ]
  }
}
```

---

#### Quick Stats Cards (4 Cards) - User Dashboard

**Card 1: Total Plans**

- **Number:** Total travel plans count (from `stats.totalPlans`)
- **Label:** "Travel Plans"
- **Icon:** Map icon
- **Link:** `/dashboard/travel-plans`
- **Color:** Blue

**Card 2: Upcoming Trips**

- **Number:** Count of future trips (from `stats.upcomingTrips`)
- **Label:** "Upcoming Trips"
- **Icon:** Calendar icon
- **Link:** `/dashboard/travel-plans?type=future`
- **Color:** Green

**Card 3: Total Expenses**

- **Number:** Total amount spent (from `stats.totalExpenses`, formatted: $X,XXX)
- **Label:** "Total Expenses"
- **Icon:** Dollar icon
- **Link:** `/dashboard/expenses`
- **Color:** Orange

**Card 4: Active Subscription**

- **Number/Status:** Active subscription status (from `stats.activeSubscription`) or "Inactive"
- **Label:** "Subscription"
- **Icon:** Credit Card icon
- **Link:** `/dashboard/subscriptions`
- **Color:** Purple
- **Badge:** Active/Inactive indicator

**Styling:**

- Grid layout: 1 column (mobile), 2 columns (tablet), 4 columns (desktop)
- Card design with shadow
- Hover effects
- Clickable (navigate on click)

---

#### Quick Stats Cards (8 Cards) - Admin Dashboard

**Card 1: Total Users**

- **Number:** Total users count (from `stats.totalUsers`)
- **Label:** "Total Users"
- **Icon:** Users icon
- **Link:** `/admin/users`
- **Color:** Blue

**Card 2: Active Users**

- **Number:** Active users in last 30 days (from `stats.activeUsers`)
- **Label:** "Active Users"
- **Icon:** User check icon
- **Link:** `/admin/users?active=true`
- **Color:** Green

**Card 3: Total Plans**

- **Number:** Total travel plans count (from `stats.totalPlans`)
- **Label:** "Total Plans"
- **Icon:** Map icon
- **Link:** `/admin/plans`
- **Color:** Purple

**Card 4: Public Plans**

- **Number:** Public plans count (from `stats.publicPlans`)
- **Label:** "Public Plans"
- **Icon:** Globe icon
- **Link:** `/admin/plans?visibility=PUBLIC`
- **Color:** Teal

**Card 5: Total Revenue**

- **Number:** Total revenue from successful payments (from `stats.totalRevenue`, formatted: $X,XXX)
- **Label:** "Total Revenue"
- **Icon:** Dollar icon
- **Link:** `/dashboard/payments`
- **Color:** Green

**Card 6: Active Subscriptions**

- **Number:** Active subscriptions count (from `stats.activeSubscriptions`)
- **Label:** "Active Subscriptions"
- **Icon:** Credit Card icon
- **Link:** `/dashboard/subscriptions`
- **Color:** Orange

**Card 7: Total Meetups**

- **Number:** Total meetups count (from `stats.totalMeetups`)
- **Label:** "Total Meetups"
- **Icon:** Calendar icon
- **Link:** `/admin/meetups`
- **Color:** Pink

**Card 8: Total Expenses**

- **Number:** Total expenses across all plans (from `stats.totalExpenses`, formatted: $X,XXX)
- **Label:** "Total Expenses"
- **Icon:** Receipt icon
- **Link:** `/admin/expenses`
- **Color:** Red

**Styling:**

- Grid layout: 1 column (mobile), 2 columns (tablet), 4 columns (desktop)
- Card design with shadow
- Hover effects
- Clickable (navigate on click)

---

#### Charts Section - User Dashboard

**Chart 1: Expenses by Category (Pie Chart)**

- **Data Source:** `charts.expensesByCategory`
- **Fields:** `category`, `amount`, `percentage`
- **Display:** Pie chart showing expense distribution by category
- **Categories:** FOOD, TRANSPORT, ACCOMMODATION, ACTIVITY, SHOPPING, OTHER
- **Styling:** Color-coded segments with labels showing percentage

**Chart 2: Plans Timeline (Line Chart)**

- **Data Source:** `charts.plansTimeline`
- **Fields:** `month` (YYYY-MM format), `count`
- **Display:** Line chart showing plan creation trend over last 6 months
- **X-axis:** Months (last 6 months)
- **Y-axis:** Number of plans created
- **Styling:** Line with markers, smooth curve

---

#### Charts Section - Admin Dashboard

**Chart 1: Revenue Over Time (Area Chart)**

- **Data Source:** `charts.revenueOverTime`
- **Fields:** `month` (YYYY-MM format), `revenue`
- **Display:** Area chart showing monthly revenue trend (last 6 months)
- **X-axis:** Months
- **Y-axis:** Revenue amount
- **Styling:** Filled area with gradient, smooth curve

**Chart 2: Plans by Travel Type (Bar Chart)**

- **Data Source:** `charts.plansByTravelType`
- **Fields:** `type` (SOLO, COUPLE, FAMILY, FRIENDS, GROUP), `count`
- **Display:** Bar chart showing plan distribution by travel type
- **X-axis:** Travel types
- **Y-axis:** Count of plans
- **Styling:** Horizontal or vertical bars, color-coded

**Chart 3: User Growth (Line Chart)**

- **Data Source:** `charts.userGrowth`
- **Fields:** `month` (YYYY-MM format), `newUsers`
- **Display:** Line chart showing new user registrations (last 6 months)
- **X-axis:** Months
- **Y-axis:** Number of new users
- **Styling:** Line with markers, different color from revenue chart

**Chart 4: Subscription Status (Pie Chart)**

- **Data Source:** `charts.subscriptionStatus`
- **Fields:** `status` (ACTIVE, CANCELLED, EXPIRED, etc.), `count`, `percentage`
- **Display:** Pie chart showing subscription status distribution
- **Styling:** Color-coded segments with labels showing percentage

---

#### Top Performing Plans Section - Admin Dashboard

**Title:** "Top Performing Plans"

**List:** Top 5 plans (from `topPlans` array)

**Plan Item:**

- **Title:** Plan title (from `title` field)
- **Member Count:** Number of members (from `memberCount`)
- **Expense Count:** Number of expenses (from `expenseCount`)
- **Featured Badge:** Show if `isFeatured` is true
- **Link:** Link to plan details (use `id` to construct link: `/dashboard/travel-plans/:id`)

**Styling:**

- Card or list layout
- Highlight featured plans
- Show metrics prominently
- "View All Plans" link

---

#### Recent Activity Section

**Title:** "Recent Activity"

**List:** Last 5-10 activities (from `recentActivity` array)

**Activity Item Format:**

- **Icon:** Activity type icon (based on `type` field)
- **Message:** Activity message (from `message` field)
- **Timestamp:** Format as "2 hours ago" or absolute date (from `timestamp`)
- **Link:** Navigate to related item (from `link` field if available)

**Examples:**

- "You created plan 'Trip to Paris'" (type: PLAN_CREATED)
- "John joined your plan 'Beach Vacation'" (type: MEMBER_JOINED)
- "New expense added to 'Europe Trip'" (type: EXPENSE_ADDED)
- "Meetup scheduled for 'Weekend Getaway'" (type: MEETUP_CREATED)

**Styling:**

- List layout
- Icons for visual distinction
- Timestamps in gray
- Hover effects
- "View All Activity" link (optional)

---

#### Upcoming Meetups Section

**Title:** "Upcoming Meetups"

**List:** Next 3-5 meetups (from `upcomingMeetups` array)

**Meetup Item:**

- **Plan Title:** From `planTitle` field
- **Location:** From `location` field
- **Date and Time:** Format `scheduledAt` date/time
- **RSVP Status:** Badge showing `rsvpStatus` (ACCEPTED/DECLINED/PENDING)
- **Link:** Link to meetup details (use `id` to construct link)

**Styling:**

- Card or list layout
- Date highlighted
- Status badges (color-coded)
- "View All Meetups" link

---

#### Recent Notifications Section

**Title:** "Recent Notifications"

**List:** Last 5 unread notifications (from `recentNotifications` array)

**Notification Item:**

- **Icon:** Notification type icon (from `type` field)
- **Message:** Notification text (from `message` field)
- **Timestamp:** Format as "5 minutes ago" (from `timestamp`)
- **Action:** "Mark as read" button (if `isRead` is false)
- **Link:** Navigate to related item (from `link` field)

**Styling:**

- List layout
- Unread indicator (dot or background) for `isRead: false`
- "View All Notifications" link → `/dashboard/notifications`

---

### 5.3 My Travel Plans (`/dashboard/travel-plans`)

#### Page Header

**Title:** "My Travel Plans"

**Action Button:** "Create New Plan" → `/dashboard/travel-plans/create`

---

#### API Integration

**Endpoint:** `GET /api/v1/travel-plans`

**Authentication:** Required

**Query Parameters:**
- `searchTerm`: Search in title or destination (optional)
- `travelType`: "SOLO" | "COUPLE" | "FAMILY" | "FRIENDS" | "GROUP" (optional)
- `visibility`: "PUBLIC" | "PRIVATE" | "UNLISTED" (optional)
- `isFeatured`: "true" | "false" (optional)
- `sortBy`: Sort field (optional, default: "startDate")
- `sortOrder`: "asc" | "desc" (optional, default: "asc")
- `page`: Page number (optional, default: 1)
- `limit`: Items per page (optional, default: 10)

**Response Structure:**
```json
{
  "success": true,
  "message": "Travel plans retrieved successfully.",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  },
  "data": [
    {
      "id": "uuid",
      "title": "Plan Title",
      "destination": "Location",
      "origin": "Origin Location",
      "startDate": "2025-09-15T00:00:00.000Z",
      "endDate": "2025-09-21T00:00:00.000Z",
      "travelType": "FRIENDS",
      "budgetMin": 5000,
      "budgetMax": 12000,
      "visibility": "PUBLIC",
      "coverPhoto": "url",
      "description": "Description text",
      "totalDays": 7,
      "_count": {
        "itineraryItems": 12,
        "tripMembers": 4
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Filters

**Type Filter:**

- Radio buttons or tabs: All / Future / Past
- Default: All
- **API Parameter:** `type` (values: "future" | "past")

**Search:**

- Search input: "Search by title or destination..."
- Real-time filtering (debounced)
- **API Parameter:** `searchTerm`

**Sort:**

- Dropdown: Newest / Oldest / Alphabetical / Budget (Low to High) / Budget (High to Low)
- Default: Newest
- **API Parameters:** 
  - `sortBy`: "createdAt" | "startDate" | "budgetMin"
  - `sortOrder`: "asc" | "desc"

---

#### Travel Plans List/Grid

**Card Layout** (each plan):

- **Cover Image:** Full-width image or placeholder
- **Title:** Plan title (bold)
- **Destination:** Location with icon
- **Date Range:** Start - End dates
- **Travel Type Badge:** SOLO, COUPLE, etc.
- **Member Count:** "X members" with icon
- **Status Badge:** Upcoming / Past / Ongoing
- **Actions:**
  - View Details (eye icon) → `/dashboard/travel-plans/:id`
  - Edit (pencil icon) → `/dashboard/travel-plans/:id/edit`
  - Delete (trash icon) → Confirmation modal
  - Share (share icon) → Share modal

**Styling:**

- Grid or list view toggle
- Responsive grid
- Hover effects
- Action buttons in dropdown menu (mobile)

---

#### Empty State

**Message:** "You haven't created any travel plans yet"

**Button:** "Create Your First Plan" → `/dashboard/travel-plans/create`

**Styling:**

- Centered content
- Large icon
- Friendly message

---

### 5.4 Create Travel Plan (`/dashboard/travel-plans/create`)

#### Page Title

"Create New Travel Plan"

---

#### Form Layout

**Option:** Single page form or multi-step wizard

**Recommendation:** Single page with clear sections

---

#### Form Fields (All with Validation)

**1. Title** (required):

- **Type:** text input
- **Label:** "Plan Title \*"
- **Placeholder:** "e.g., Summer Trip to Europe"
- **Validation:** Min 3 characters, max 200 characters
- **Error:** "Title must be between 3 and 200 characters"

**2. Destination** (required):

- **Type:** text input with autocomplete (Google Places API or similar)
- **Label:** "Destination \*"
- **Placeholder:** "Where are you going?"
- **Validation:** Required
- **Error:** "Destination is required"
- **Feature:** Autocomplete suggestions as user types

**3. Origin** (optional):

- **Type:** text input with autocomplete
- **Label:** "Origin"
- **Placeholder:** "Where are you starting from?"
- **Validation:** None (optional)

**4. Start Date** (required):

- **Type:** date picker
- **Label:** "Start Date \*"
- **Placeholder:** "Select start date"
- **Validation:** Must be a future date (not today, must be after today)
- **Error:** "Start date must be a future date. Past dates are not allowed."
- **Feature:** Calendar popup, disable past dates and today
- **Backend Validation:** Backend also validates that startDate is in the future
- **Format:** Date only (YYYY-MM-DD), no time component

**5. End Date** (required):

- **Type:** date picker
- **Label:** "End Date \*"
- **Placeholder:** "Select end date"
- **Validation:** Must be after start date
- **Error:** "End date must be after start date"
- **Feature:** Calendar popup, disable dates before start date

**6. Travel Type** (required):

- **Type:** radio buttons or select dropdown
- **Label:** "Travel Type \*"
- **Options:**
  - **SOLO:** "Traveling alone"
  - **COUPLE:** "Traveling with a partner"
  - **FAMILY:** "Family trip"
  - **FRIENDS:** "Trip with friends"
  - **GROUP:** "Large group trip"
- **Default:** FRIENDS
- **Validation:** Required, must be one of: SOLO, COUPLE, FAMILY, FRIENDS, GROUP
- **Error:** "Invalid travel type. Must be SOLO, COUPLE, FAMILY, FRIENDS, or GROUP."
- **Backend Values:** Use exact enum values (SOLO, COUPLE, FAMILY, FRIENDS, GROUP) - case-sensitive
- **Styling:** Icons for each option (optional)

**7. Budget Min** (optional):

- **Type:** number input
- **Label:** "Minimum Budget"
- **Placeholder:** "Minimum budget"
- **Validation:** Must be positive number, must be less than max
- **Error:** "Minimum budget must be a positive number"
- **Currency Selector:** USD, EUR, GBP, etc. (dropdown)

**8. Budget Max** (optional):

- **Type:** number input
- **Label:** "Maximum Budget"
- **Placeholder:** "Maximum budget"
- **Validation:** Must be greater than min budget
- **Error:** "Maximum budget must be greater than minimum budget"
- **Currency Selector:** USD, EUR, GBP, etc. (dropdown, same as min)

**9. Visibility** (required):

- **Type:** radio buttons
- **Label:** "Visibility \*"
- **Options:**
  - **Public:** "Anyone can view this plan" (globe icon)
  - **Private:** "Only invited members can view" (lock icon)
  - **Unlisted:** "Only people with the link can view" (link icon)
- **Default:** Private
- **Validation:** Required
- **Error:** "Please select visibility"
- **Styling:** Icons and descriptions for each option

**10. Description** (optional):

- **Type:** textarea
- **Label:** "Description"
- **Placeholder:** "Tell us about your travel plan..."
- **Max Length:** 2000 characters
- **Character Counter:** "X / 2000 characters"
- **Validation:** Max 2000 characters
- **Error:** "Description cannot exceed 2000 characters"

**11. Cover Photo** (optional):

- **Type:** file upload
- **Label:** "Cover Photo"
- **Accept:** image/\* (JPEG, PNG, WebP)
- **Max Size:** 5MB
- **Preview:** Show preview after upload
- **Drag & Drop:** Support drag and drop
- **Upload Progress:** Progress indicator during upload
- **Validation:** File type and size
- **Error:** "Please upload a valid image file (max 5MB)"

---

#### Form Actions

**Cancel Button:**

- **Text:** "Cancel"
- **Action:** Discard changes, go back to travel plans list
- **Confirmation:** Show confirmation if form has data

**Save as Draft** (optional):

- **Text:** "Save as Draft"
- **Action:** Save without publishing
- **Styling:** Secondary button

**Create Plan Button:**

- **Text:** "Create Plan"
- **Action:** Submit form
- **Loading State:** Show spinner, disable button
- **API Call:** `POST /api/v1/travel-plans` with `credentials: 'include'`
- **Request Body:**
```json
{
  "title": "Spring Trip to Cox's Bazar",
  "destination": "Cox's Bazar, Bangladesh",
  "origin": "Dhaka, Bangladesh",
  "startDate": "2025-09-15",
  "endDate": "2025-09-21",
  "travelType": "FRIENDS",
  "budgetMin": 5000,
  "budgetMax": 12000,
  "visibility": "PUBLIC",
  "description": "An awesome week-long trip!",
  "coverPhoto": "https://my-cloudinary-url/trip-photo.jpg"
}
```
- **Validation Notes:**
  - `startDate` must be future date (YYYY-MM-DD format)
  - `endDate` must be >= `startDate`
  - `travelType` must be: SOLO, COUPLE, FAMILY, FRIENDS, GROUP
  - `visibility` must be: PUBLIC, PRIVATE, UNLISTED
  - All fields required except `origin` and `coverPhoto`
- **Success:** 
  - Show success toast: "Travel plan created successfully"
  - Redirect to `/dashboard/travel-plans/:id` (plan details page)
- **Error:** Display error message from `errorMessages` array
  - Field-specific errors: "Start date must be a future date. Past dates are not allowed."
  - "endDate must be greater than or equal to startDate."
  - "Invalid travel type. Must be SOLO, COUPLE, FAMILY, FRIENDS, GROUP."
- **Styling:** Primary button

---

### 5.5 Travel Plan Details (`/dashboard/travel-plans/:id`)

#### API Integration

**Get Plan Details:**
- **Endpoint:** `GET /api/v1/travel-plans/:id`
- **Authentication:** Required
- **Response:** Returns full plan details with owner, members count, itinerary count, etc.

**Update Plan:**
- **Endpoint:** `PATCH /api/v1/travel-plans/:id`
- **Authentication:** Required (owner or admin only)
- **Request Body:** All fields optional, only send what you want to update
```json
{
  "title": "Updated Plan Title",
  "destination": "Bandarban, Bangladesh",
  "origin": "Dhaka",
  "startDate": "2025-09-20",
  "endDate": "2025-09-26"
}
```
- **Validation Notes:**
  - If updating `startDate`, it must be a future date
  - `endDate` must be >= `startDate`
  - `planId` and `splitType` cannot be updated (if mentioned elsewhere)

**Delete Plan:**
- **Endpoint:** `DELETE /api/v1/travel-plans/:id`
- **Authentication:** Required (owner or admin only)
- **Confirmation:** Show confirmation modal before deletion

---

#### Page Header

**Plan Title and Destination**

**Actions:**

- Edit → `/dashboard/travel-plans/:id/edit`
- Delete → Confirmation modal → `DELETE /api/v1/travel-plans/:id`
- Share → Share modal
- Invite Members → Invite modal

---

#### Tabs Navigation

**8 Tabs:**

1. **Overview Tab** (default)
   - Plan information (all fields from create form)
   - Member list with roles
   - Quick stats (expenses, meetups, media count)

2. **Itinerary Tab**
   - **API:** `GET /api/v1/itinerary/:planId` to fetch itinerary items
   - Link to full itinerary page or embedded view
   - Add new item button → Opens create form
   - **API:** `POST /api/v1/itinerary` to create item
   - Day-by-day breakdown (grouped by `dayIndex`)
   - Edit/Delete actions for each item
   - **API:** `PATCH /api/v1/itinerary/:itemId` to update
   - **API:** `DELETE /api/v1/itinerary/:itemId` to delete

3. **Members Tab**
   - Member list with avatars, names, roles
   - **API:** `GET /api/v1/trip-members/:planId` to fetch members
   - Invite member button → Opens invite modal
   - **API:** `POST /api/v1/trip-members/:planId/add` with `{ email, role }`
   - Update role dropdown (for owners/admins)
   - **API:** `PATCH /api/v1/trip-members/:planId/update-role` with `{ userId, role }`
   - Remove member action
   - **API:** `DELETE /api/v1/trip-members/:memberId` (uses TripMember ID, not userId)

4. **Expenses Tab**
   - **API:** `GET /api/v1/expenses?planId=:planId` to fetch expenses
   - Link to expenses page or embedded list
   - **API:** `GET /api/v1/expenses/summary?planId=:planId` for summary
   - Expense summary card (total, breakdown by category, settlement calculations)
   - Add expense button → Opens create form
   - **API:** `POST /api/v1/expenses` to create expense
   - Edit/Delete/Settle actions
   - **API:** `PATCH /api/v1/expenses/:expenseId` to update
   - **API:** `DELETE /api/v1/expenses/:expenseId` to delete
   - **API:** `PATCH /api/v1/expenses/:expenseId/settle/:participantId` to settle

5. **Meetups Tab**
   - **API:** `GET /api/v1/meetups?planId=:planId` to fetch meetups
   - List of meetups for this plan
   - Create meetup button → Opens create form
   - **API:** `POST /api/v1/meetups` with `{ planId, scheduledAt, location?, maxParticipants? }`
   - RSVP status for each
   - **API:** `POST /api/v1/meetups/:meetupId/rsvp` to RSVP
   - Edit/Delete/Update Status actions (organizer only)

6. **Media Tab**
   - **API:** `GET /api/v1/media?planId=:planId` to fetch media
   - Gallery view of all media
   - Upload media button → Opens upload form
   - **API:** `POST /api/v1/media` with `multipart/form-data` (files array, planId, type?)
   - Lightbox for viewing images
   - **API:** `GET /api/v1/media/:mediaId` to fetch single media details
   - Delete action (creator/admin only)
   - **API:** `DELETE /api/v1/media/:mediaId` to delete

7. **Chat Tab**
   - **API:** `GET /api/v1/chat/threads?planId=:planId` to fetch or create thread
   - **API:** If thread doesn't exist, create with `POST /api/v1/chat/threads` with `{ type: "PLAN", refId: planId }`
   - Embedded chat interface or link
   - **API:** `GET /api/v1/chat/threads/:threadId/messages?limit=30` to fetch messages
   - Message list with cursor pagination
   - **API:** `POST /api/v1/chat/threads/:threadId/messages` to send message
   - Send message input with attachments support
   - Edit/Delete message actions
   - **API:** `PATCH /api/v1/chat/messages/:messageId` to edit
   - **API:** `DELETE /api/v1/chat/messages/:messageId` to delete

8. **Reviews Tab**
   - **API:** `GET /api/v1/reviews?planId=:planId` to fetch reviews
   - Reviews for this plan
   - Create review button (if user hasn't reviewed)
   - **API:** `POST /api/v1/reviews` with `{ rating, comment?, source: "USER_TO_TRIP", planId }`
   - Edit/Delete actions for own reviews
   - **API:** `PATCH /api/v1/reviews/:reviewId` to update
   - **API:** `DELETE /api/v1/reviews/:reviewId` to delete

**Tab Content:** Each tab shows relevant information and actions

**Styling:**

- Tab navigation (horizontal tabs)
- Active tab highlighted
- Responsive: Tabs become dropdown on mobile

---

**Part 1 Complete!** ✅

এই পর্যন্ত সম্পন্ন হয়েছে:

- 5.3 My Travel Plans সম্পূর্ণ
- 5.4 Create Travel Plan (সমস্ত 11টি ফিল্ড সহ)
- 5.5 Travel Plan Details (8 ট্যাব সহ)

---

### 5.6 Itinerary Management (`/dashboard/itinerary/:planId`)

#### Page Title

"Itinerary - [Plan Name]"

**Breadcrumb:** Dashboard > Travel Plans > [Plan Name] > Itinerary

---

#### API Integration

**Get Itinerary Items By Plan:**
- **Endpoint:** `GET /api/v1/itinerary/:planId`
- **Authentication:** Required for PRIVATE/UNLISTED plans, optional for PUBLIC plans
- **Query Parameters:**
  - `dayIndex`: Filter by day index (optional, number >= 1)
  - `page`: Page number (optional)
  - `limit`: Items per page (optional)
- **Response Structure:**
```json
{
  "success": true,
  "message": "Itinerary items retrieved successfully.",
  "data": [
    {
      "id": "itemId",
      "planId": "planId",
      "dayIndex": 1,
      "title": "Visit Buddhist Temple",
      "description": "Morning sightseeing",
      "startAt": "2025-09-15T09:00:00.000Z",
      "endAt": "2025-09-15T11:00:00.000Z",
      "locationId": "locationId",
      "order": 1,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Get Single Itinerary Item:**
- **Endpoint:** `GET /api/v1/itinerary/item/:itemId`
- **Authentication:** Required for PRIVATE/UNLISTED plans, optional for PUBLIC plans
- **Response:** Returns single itinerary item object

**Create Itinerary Item:**
- **Endpoint:** `POST /api/v1/itinerary`
- **Authentication:** Required (plan member/admin only)
- **Request Body:**
```json
{
  "planId": "planId",
  "dayIndex": 1,
  "title": "Visit Buddhist Temple",
  "description": "Morning sightseeing at temple",
  "startAt": "2025-09-15T09:00:00.000Z",
  "endAt": "2025-09-15T11:00:00.000Z",
  "locationId": "locationId",
  "order": 1
}
```
- **Validation Notes:**
  - `planId`: Required
  - `dayIndex`: Required, number >= 1
  - `title`: Required, 3-200 characters
  - `description`: Optional, max 2000 characters
  - `startAt`: Optional, ISO datetime string (e.g., "2025-09-15T09:00:00.000Z")
  - `endAt`: Optional, ISO datetime string, must be >= startAt
  - `locationId`: Optional, UUID
  - `order`: Optional, number >= 0
- **Date Validation:** startAt and endAt must be within the plan's date range (plan.startDate to plan.endDate)

**Update Itinerary Item:**
- **Endpoint:** `PATCH /api/v1/itinerary/:itemId`
- **Authentication:** Required (plan member/admin only)
- **Request Body:** All fields optional, only send what you want to update
```json
{
  "dayIndex": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "startAt": "2025-09-15T14:00:00.000Z",
  "endAt": "2025-09-15T18:00:00.000Z",
  "locationId": "locationId",
  "order": 2
}
```

**Delete Itinerary Item:**
- **Endpoint:** `DELETE /api/v1/itinerary/:itemId`
- **Authentication:** Required (plan member/admin only)
- **Success:** Returns success message

**Bulk Upsert Itinerary:**
- **Endpoint:** `POST /api/v1/itinerary/bulk`
- **Authentication:** Required (plan member/admin only)
- **Request Body:**
```json
{
  "planId": "planId",
  "replace": false,
  "items": [
    {
      "dayIndex": 1,
      "title": "Check-in at Hotel",
      "description": "Arrival and room allocation.",
      "startAt": "2025-09-15T12:00:00.000Z",
      "endAt": "2025-09-15T13:00:00.000Z",
      "locationId": "locationId",
      "order": 1,
      "id": "itemId"
    }
  ]
}
```
- **Validation Notes:**
  - `planId`: Required
  - `replace`: Optional boolean (default: false). If true, replaces all existing items
  - `items`: Required array with at least 1 item
  - Each item: `dayIndex` (required), `title` (required, 3-200 chars), `id` (optional - if provided, updates existing item)
- **Use Case:** For AI-generated itineraries or bulk imports

**Reorder Itinerary Items:**
- **Endpoint:** `PATCH /api/v1/itinerary/reorder`
- **Authentication:** Required (plan member/admin only)
- **Request Body:**
```json
{
  "planId": "planId",
  "updates": [
    {
      "id": "itemId1",
      "dayIndex": 1,
      "order": 2
    },
    {
      "id": "itemId2",
      "dayIndex": 1,
      "order": 1
    }
  ]
}
```
- **Validation Notes:**
  - `planId`: Required
  - `updates`: Required array with at least 1 item
  - Each update: `id` (required, item ID), `dayIndex` (required, >= 1), `order` (required, >= 0)
- **Use Case:** Drag & drop reordering

---

#### Day-by-Day View

**Day Sections:** Organized by day index (Day 1, Day 2, Day 3, etc.)

**Each Day Shows:**

- **Day Header:**
  - Day number (e.g., "Day 1")
  - Date (calculated from plan start date)
  - "Add Item" button
- **Itinerary Items List:** All items for that day
- **Empty Day State:** "No activities planned for this day"

**Styling:**

- Collapsible day sections (optional)
- Visual separation between days
- Day numbers highlighted

---

#### Itinerary Item Card (Each Item)

**Display:**

- **Time Range** (if available): "9:00 AM - 11:00 AM" or "All Day"
- **Title:** Activity title (bold, 16px)
- **Description:** Activity description (if available, gray text)
- **Location:** Location with map pin icon (if available)
- **Order Indicator:** Visual indicator of item order
- **Actions:**
  - Edit (pencil icon) → Opens edit form
  - Delete (trash icon) → Confirmation modal
  - Drag Handle (grip icon) → For reordering

**Styling:**

- Card layout with padding
- Time displayed prominently
- Hover effects
- Drag handle visible on hover

---

#### Add/Edit Item Form (Modal or Side Panel)

**Form Fields:**

**Day Index** (required):

- **Type:** number input or select dropdown
- **Label:** "Day \*"
- **Placeholder:** "Select day"
- **Options:** Day 1, Day 2, Day 3, etc. (based on plan duration)
- **Default:** Next available day
- **Validation:** Required, must be >= 1, must be within plan duration
- **Error:** "Please select a valid day"
- **Backend Field:** `dayIndex` (number, >= 1)

**Title** (required):

- **Type:** text input
- **Label:** "Activity Title \*"
- **Placeholder:** "e.g., Visit Eiffel Tower"
- **Validation:** Min 3 characters, max 200 characters
- **Error:** "Title must be between 3 and 200 characters"

**Description** (optional):

- **Type:** textarea
- **Label:** "Description"
- **Placeholder:** "Add details about this activity..."
- **Max Length:** 1000 characters
- **Character Counter:** "X / 1000 characters"
- **Rows:** 3-4

**Start Date & Time** (optional):

- **Type:** datetime picker (date + time)
- **Label:** "Start Date & Time"
- **Placeholder:** "Select start date and time"
- **Format:** ISO datetime string (e.g., "2025-09-15T09:00:00.000Z")
- **Feature:** Combined date and time picker
- **Validation:** Must be within plan's date range (plan.startDate to plan.endDate)
- **Error:** "Start date must be within the plan's date range"
- **Backend Field:** `startAt` (ISO datetime string)
- **Note:** Frontend should combine date and time into ISO format before sending

**End Date & Time** (optional):

- **Type:** datetime picker (date + time)
- **Label:** "End Date & Time"
- **Placeholder:** "Select end date and time"
- **Format:** ISO datetime string (e.g., "2025-09-15T11:00:00.000Z")
- **Validation:** Must be >= startAt (if both provided), must be within plan's date range
- **Error:** "End date must be after start date" or "End date must be within the plan's date range"
- **Backend Field:** `endAt` (ISO datetime string)
- **Note:** Frontend should combine date and time into ISO format before sending

**Location** (optional):

- **Type:** Location selector (search + select or create)
- **Label:** "Location"
- **Placeholder:** "Search or select location"
- **Feature:** 
  - Search existing locations or create new
  - Google Places autocomplete integration (optional)
  - Map preview (optional)
- **Backend Field:** `locationId` (UUID, optional)
- **Note:** Frontend should handle location creation/selection and send `locationId` (UUID) to backend, not location string
- **Validation:** Must be valid UUID if provided

**Order** (optional):

- **Type:** number input
- **Label:** "Order"
- **Placeholder:** "Auto-calculated"
- **Default:** Auto-calculated based on time or sequence
- **Feature:** Can be manually set for custom ordering

**Form Actions:**

- **Cancel Button:** Close form without saving
- **Save Button:** Save item and close form
- **API Call (Create):** `POST /api/v1/itinerary` with `credentials: 'include'`
- **API Call (Update):** `PATCH /api/v1/itinerary/:itemId` with `credentials: 'include'`
- **Request Body:** Convert form data to API format:
  - Combine date + time into ISO datetime for `startAt`/`endAt`
  - Send `locationId` (UUID) not location string
  - Send `dayIndex` (number) not "day"
- **Success:** 
  - Show success toast
  - Refresh itinerary list using `GET /api/v1/itinerary/:planId`
  - Close form
- **Error:** Display error from `errorMessages` array
  - "startAt for item '[title]' must be within the plan's date range."
  - "endAt must be greater than or equal to startAt."
  - "Title must be between 3 and 200 characters."
- **Save & Add Another:** Save and open new form (same API call)

**Styling:**

- Modal overlay or side panel
- Form validation on submit
- Success toast notification

---

#### Bulk Actions

**Bulk Add Items:**

- **Button:** "Bulk Add Items" or "Bulk Upsert"
- **Functionality:**
  - Opens modal with form
  - User can add multiple items in a table/list format
  - Or paste/import from AI-generated itinerary
  - Each item: dayIndex, title, description, startAt, endAt, locationId, order
- **API Call:** `POST /api/v1/itinerary/bulk` with `credentials: 'include'`
- **Request Body:**
```json
{
  "planId": "planId",
  "replace": false,
  "items": [
    {
      "dayIndex": 1,
      "title": "Check-in at Hotel",
      "description": "Arrival and room allocation.",
      "startAt": "2025-09-15T12:00:00.000Z",
      "endAt": "2025-09-15T13:00:00.000Z",
      "locationId": "locationId",
      "order": 1
    }
  ]
}
```
- **Validation Notes:**
  - `replace`: If true, replaces all existing items (use with caution)
  - Each item must have `dayIndex` and `title`
  - If item has `id`, it will update existing item (upsert)
- **Success:** Show success toast, refresh itinerary list
- **Error:** Display error from `errorMessages` array
- **Use Case:** For AI-generated itineraries or bulk imports

**Drag & Drop Reordering:**

- **Feature:** Drag items within a day or between days
- **Visual Feedback:** Show drop zones, highlight drop target
- **Save Order Button:** "Save Order" (appears after reordering)
- **API Call:** `PATCH /api/v1/itinerary/reorder` with `credentials: 'include'`
- **Request Body:**
```json
{
  "planId": "planId",
  "updates": [
    {
      "id": "itemId1",
      "dayIndex": 1,
      "order": 2
    },
    {
      "id": "itemId2",
      "dayIndex": 1,
      "order": 1
    }
  ]
}
```
- **Validation Notes:**
  - Each update must have: `id` (item ID), `dayIndex`, `order`
  - Can update multiple items at once
  - Can change `dayIndex` (move between days) and `order` (reorder within day)
- **Success:** Show success toast, refresh itinerary list
- **Error:** Display error from `errorMessages` array

**Delete Multiple:**

- **Checkbox Selection:** Select multiple items
- **Bulk Delete Button:** "Delete Selected"
- **Confirmation:** "Are you sure you want to delete X items?"

**Styling:**

- Drag handle visible on hover
- Visual feedback during drag
- Smooth animations

---

#### Empty State

**Message:** "No itinerary items yet. Add your first activity!"

**Button:** "Add First Item"

**Styling:**

- Centered content
- Large icon or illustration
- Friendly message

---

### 5.7 AI Planner (`/dashboard/planner`)

#### Page Title

"AI Travel Planner"

**Description:** "Create personalized travel plans with AI assistance"

---

#### API Integration

**Create Planning Session:**
- **Endpoint:** `POST /api/v1/planner`
- **Authentication:** Required
- **Request Body:**
```json
{
  "planId": "planId"
}
```
- **Validation Notes:**
  - `planId`: Optional (if provided, links session to existing plan)
  - If not provided, creates new session for new plan
- **Response:** Returns created session with `sessionId`
- **Use Case:** Start a new AI planning session

**Add Step to Session:**
- **Endpoint:** `POST /api/v1/planner/:sessionId/step`
- **Authentication:** Required
- **Request Body:**
```json
{
  "question": "What is your travel destination?",
  "answer": "Cox's Bazar",
  "uiStep": "destination"
}
```
- **Validation Notes:**
  - `question`: Required, the question asked
  - `answer`: Required, user's answer
  - `uiStep`: Optional, UI step identifier (e.g., "destination", "dates", "preferences")
- **Response:** Returns updated session with new step added
- **Use Case:** Add user responses step by step

**Complete Planning Session:**
- **Endpoint:** `POST /api/v1/planner/:sessionId/complete`
- **Authentication:** Required
- **Request Body:**
```json
{
  "finalOutput": {
    "title": "Spring Trip to Cox's Bazar",
    "destination": "Cox's Bazar, Bangladesh",
    "origin": "Dhaka, Bangladesh",
    "startDate": "2025-09-15",
    "endDate": "2025-09-21",
    "budgetMin": 5000,
    "budgetMax": 12000,
    "travelType": "FRIENDS",
    "description": "An awesome week-long trip!",
    "itinerary": [
      {
        "dayIndex": 1,
        "items": [
          {
            "title": "Arrival and Check-in",
            "description": "Check-in at hotel",
            "startAt": "2025-09-15T12:00:00.000Z",
            "endAt": "2025-09-15T14:00:00.000Z",
            "location": "Hotel Sea Crown"
          }
        ]
      }
    ]
  }
}
```
- **Validation Notes:**
  - `finalOutput`: Required object with travel plan details
  - `title`, `destination`, `startDate`, `endDate`, `travelType`: Required
  - `itinerary`: Optional array with day-by-day items
  - Each itinerary item: `dayIndex`, `items` array with `title`, `description`, `startAt`, `endAt`, `location`
- **Response:** Returns created travel plan (if planId was provided) or session completion status
- **Use Case:** Finalize AI planning and create travel plan

**Get Planning Session:**
- **Endpoint:** `GET /api/v1/planner/:sessionId`
- **Authentication:** Required
- **Response:** Returns session with all steps and current state
- **Use Case:** Resume or view existing session

**Get My Planning Sessions:**
- **Endpoint:** `GET /api/v1/planner`
- **Authentication:** Required
- **Query Parameters:**
  - `page`: Page number (optional, default: 1)
  - `limit`: Items per page (optional, default: 10)
  - `sortBy`: Sort field (optional, default: "createdAt")
  - `sortOrder`: "asc" or "desc" (optional, default: "desc")
- **Response:** Returns paginated list of user's planning sessions
- **Use Case:** List all user's AI planning sessions

---

#### Session List (If User Has Previous Sessions)

**Section Title:** "Previous Sessions"

**API Integration:**
- **Endpoint:** `GET /api/v1/planner?page=1&limit=10&sortBy=createdAt&sortOrder=desc`
- **Authentication:** Required
- **Query Parameters:**
  - `page`: Page number (optional, default: 1)
  - `limit`: Items per page (optional, default: 10)
  - `sortBy`: Sort field (optional, default: "createdAt")
  - `sortOrder`: "asc" or "desc" (optional, default: "desc")
- **Response:** Returns paginated list of user's planning sessions

**Session Card** (each session):

- **Status Badge:** In Progress / Completed
- **Destination:** Session destination (from session data)
- **Created Date:** "Created on [date]" (from `createdAt`)
- **Actions:**
  - Continue (if In Progress) → Resume session
    - **API:** `GET /api/v1/planner/:sessionId` to fetch session
    - Navigate to wizard with session data pre-filled
  - View (if Completed) → View generated plan
    - **API:** `GET /api/v1/planner/:sessionId` to fetch session
    - Navigate to travel plan if `planId` exists
  - Delete → Confirmation modal
    - **Note:** Delete endpoint not available in current API

**Styling:**

- Grid or list layout
- Status badges with colors
- Hover effects

---

#### Create New Session

**Button:** "Start New AI Plan" (primary, large)

**On Click:** Opens step-by-step wizard

---

#### Step-by-Step Wizard

**Progress Indicator:**

- Shows current step (e.g., "Step 1 of 4")
- Progress bar
- Step indicators (1, 2, 3, 4) with checkmarks for completed steps

---

#### Step 1: Destination & Dates

**Title:** "Where and When?"

**Form Fields:**

**Destination** (required):

- **Type:** text input with autocomplete
- **Label:** "Destination \*"
- **Placeholder:** "Where do you want to go?"
- **Validation:** Required
- **Error:** "Destination is required"
- **Feature:** Google Places autocomplete

**Start Date** (required):

- **Type:** date picker
- **Label:** "Start Date \*"
- **Placeholder:** "When does your trip start?"
- **Validation:** Must be today or future date
- **Error:** "Start date must be today or in the future"
- **Feature:** Calendar popup, disable past dates

**End Date** (required):

- **Type:** date picker
- **Label:** "End Date \*"
- **Placeholder:** "When does your trip end?"
- **Validation:** Must be after start date
- **Error:** "End date must be after start date"
- **Feature:** Calendar popup, disable dates before start date

**Duration Display:**

- **Calculated:** "X days" (displayed automatically)
- **Styling:** Highlighted, informative

**Navigation:**

- **Back Button:** Disabled (first step)
- **Next Button:** "Continue to Preferences" → Step 2

**Styling:**

- Clean form layout
- Large, clear inputs
- Duration prominently displayed

---

#### Step 2: Travel Type & Preferences

**Title:** "Tell Us About Your Trip"

**Form Fields:**

**Travel Type** (required):

- **Type:** radio buttons with icons
- **Label:** "Travel Type \*"
- **Options:**
  - **Solo:** "Traveling alone" (person icon)
  - **Couple:** "Traveling with a partner" (heart icon)
  - **Family:** "Family trip" (family icon)
  - **Friends:** "Trip with friends" (users icon)
  - **Group:** "Large group trip" (group icon)
- **Default:** Friends
- **Validation:** Required
- **Error:** "Please select a travel type"

**Budget Range** (optional):

- **Type:** Range slider or two number inputs
- **Label:** "Budget Range (Optional)"
- **Min Budget:** Number input with currency selector
- **Max Budget:** Number input with currency selector
- **Currency:** USD, EUR, GBP, etc. (dropdown)
- **Validation:** Max must be greater than min
- **Error:** "Maximum budget must be greater than minimum budget"

**Interests** (multi-select):

- **Type:** Multi-select checkboxes or tags
- **Label:** "What interests you? (Select all that apply)"
- **Options:**
  - Adventure
  - Culture & History
  - Food & Dining
  - Nature & Outdoors
  - Nightlife
  - Relaxation & Spa
  - Shopping
  - Sports & Activities
  - Art & Museums
  - Beaches
- **Styling:** Checkbox grid or tag selection

**Travel Style** (select):

- **Type:** Select dropdown or radio buttons
- **Label:** "Travel Style"
- **Options:**
  - **Budget:** "Affordable accommodations and activities"
  - **Mid-range:** "Comfortable, balanced experience"
  - **Luxury:** "Premium experiences and accommodations"
- **Default:** Mid-range

**Navigation:**

- **Back Button:** "Back" → Step 1
- **Next Button:** "Continue to Activities" → Step 3

**Styling:**

- Visual selection for travel type
- Clear option descriptions
- Responsive layout

---

#### Step 3: Activities & Preferences

**Title:** "What Do You Want to Do?"

**Form Fields:**

**Preferred Activities** (multi-select):

- **Type:** Multi-select checkboxes or tags
- **Label:** "Preferred Activities (Select all that apply)"
- **Options:**
  - Hiking & Trekking
  - Museums & Galleries
  - Beaches & Water Sports
  - Restaurants & Food Tours
  - Shopping & Markets
  - Historical Sites
  - Theme Parks
  - Wildlife & Nature
  - Nightlife & Bars
  - Local Experiences
- **Styling:** Checkbox grid or tag selection

**Special Requirements** (optional):

- **Type:** textarea
- **Label:** "Special Requirements or Preferences"
- **Placeholder:** "e.g., Accessibility needs, dietary restrictions, must-see places..."
- **Max Length:** 500 characters
- **Character Counter:** "X / 500 characters"
- **Rows:** 4-5

**Navigation:**

- **Back Button:** "Back" → Step 2
- **Next Button:** "Review & Generate" → Step 4

**Styling:**

- Clear activity options
- Helpful placeholder text

---

#### Step 4: Review & Generate

**Title:** "Review Your Preferences"

**Summary Section:**

- **Destination:** Display selected destination
- **Dates:** Start date - End date (X days)
- **Travel Type:** Selected type with icon
- **Budget:** Budget range (if provided) or "Not specified"
- **Interests:** List of selected interests
- **Travel Style:** Selected style
- **Activities:** List of selected activities
- **Special Requirements:** Display if provided

**Edit Options:**

- **Edit Button:** "Edit" next to each section
- **Action:** Returns to relevant step

**Generate Button:**

- **Text:** "Generate Itinerary"
- **Loading State:**
  - Show spinner
  - Progress message: "AI is creating your perfect itinerary..."
  - Disable button
- **API Flow:**
  1. **Create Session:** `POST /api/v1/planner` (with optional `planId`)
  2. **Add Steps:** `POST /api/v1/planner/:sessionId/step` for each step
     - Step 1: Destination, dates → `{ question: "...", answer: "...", uiStep: "destination" }`
     - Step 2: Travel type, budget, interests → `{ question: "...", answer: "...", uiStep: "preferences" }`
     - Step 3: Activities, requirements → `{ question: "...", answer: "...", uiStep: "activities" }`
  3. **Complete Session:** `POST /api/v1/planner/:sessionId/complete` with `finalOutput`
     - `finalOutput` contains travel plan details and optional itinerary
- **Success:** Display generated itinerary or created travel plan
- **Error:** Display error message from `errorMessages` array

**Navigation:**

- **Back Button:** "Back" → Step 3
- **Cancel Button:** "Cancel" → Return to planner home

**Styling:**

- Clear summary layout
- Easy-to-read information
- Prominent generate button

---

#### AI Response Display

**Loading State:**

- **Animation:** AI thinking animation (spinning icon or progress bar)
- **Message:** "Our AI is crafting your perfect itinerary. This may take a moment..."
- **Estimated Time:** "Usually takes 10-30 seconds"

**Generated Itinerary Preview:**

**Header:**

- **Title:** "Your AI-Generated Itinerary"
- **Destination:** Display destination
- **Duration:** X days

**Day-by-Day Breakdown:**

- Each day shows:
  - Day number and date
  - List of activities with times
  - Brief descriptions
  - Estimated costs (if budget provided)

**Actions:**

- **"Use This Itinerary" Button:**
  - If session has `planId`: Updates existing plan
  - If no `planId`: Creates new travel plan from `finalOutput`
  - **API:** `POST /api/v1/planner/:sessionId/complete` with `finalOutput` object
  - Redirects to travel plan page (`/dashboard/travel-plans/:planId`)
  - Success message: "Travel plan created successfully!"

- **"Regenerate" Button:**
  - Returns to Step 1
  - Allows user to modify preferences
  - **API:** Create new session or update existing session steps

- **"Edit Manually" Button:**
  - Opens itinerary editor
  - Allows manual adjustments before creating plan
  - **API:** After editing, call `POST /api/v1/planner/:sessionId/complete` with updated `finalOutput`

**Styling:**

- Professional itinerary display
- Clear day separations
- Prominent action buttons

---

#### Usage Limit Indicator

**Free Users:**

- **Display:** "X of 3 AI plans used this month"
- **Progress Bar:** Visual progress indicator
- **Upgrade Prompt:** "Upgrade to Premium for unlimited AI plans"
- **Upgrade Button:** Links to subscriptions page

**Premium Users:**

- **Display:** "Unlimited AI plans" (green badge)
- **No Limit Indicator**

**Styling:**

- Clear, non-intrusive display
- Upgrade prompt only for free users
- Visual progress indicator

---

**Part 2 Complete!** ✅

এই পর্যন্ত সম্পন্ন হয়েছে:

- 5.6 Itinerary Management (Day-by-day view, Add/Edit form, Bulk actions)
- 5.7 AI Planner (4-step wizard, AI response display, Usage limits)

---

### 5.8 Expenses (`/dashboard/expenses/:planId`)

#### Page Title

"Expenses - [Plan Name]"

**Breadcrumb:** Dashboard > Travel Plans > [Plan Name] > Expenses

---

#### API Integration

**Get All Expenses For Plan:**
- **Endpoint:** `GET /api/v1/expenses`
- **Authentication:** Required
- **Query Parameters:**
  - `planId`: Filter by plan ID (required for plan-specific view)
  - `page`: Page number (optional, default: 1)
  - `limit`: Items per page (optional, default: 10)
  - `sortBy`: Sort field (optional)
  - `sortOrder`: "asc" or "desc" (optional, default: "desc")
  - `searchTerm`: Search in description (optional)
  - `category`: Filter by category - "FOOD", "TRANSPORT", "ACCOMMODATION", "ACTIVITY", "SHOPPING", "OTHER" (optional)
  - `payerId`: Filter by payer ID (optional)
  - `splitType`: Filter by split type - "EQUAL", "CUSTOM", "PERCENTAGE" (optional)
  - `startDate`: Filter from date (optional, YYYY-MM-DD)
  - `endDate`: Filter to date (optional, YYYY-MM-DD)
- **Response Structure:**
```json
{
  "success": true,
  "message": "Expenses retrieved successfully.",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  },
  "data": [
    {
      "id": "expenseId",
      "planId": "planId",
      "payerId": "userId",
      "amount": 1200,
      "currency": "BDT",
      "category": "FOOD",
      "expenseDate": "2025-09-21",
      "splitType": "EQUAL",
      "description": "Lunch at beachside restaurant.",
      "locationId": "locationId",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "payer": { ... },
      "plan": { ... },
      "participants": [ ... ]
    }
  ]
}
```

**Get Single Expense:**
- **Endpoint:** `GET /api/v1/expenses/:expenseId`
- **Authentication:** Required
- **Response:** Returns expense with payer, plan, participants, location, and summary

**Create Expense:**
- **Endpoint:** `POST /api/v1/expenses`
- **Authentication:** Required
- **Request Body:**
```json
{
  "planId": "planId",
  "payerId": "payerId",
  "amount": 1200,
  "currency": "BDT",
  "category": "FOOD",
  "expenseDate": "2025-09-21",
  "splitType": "EQUAL",
  "description": "Lunch at beachside restaurant.",
  "participants": [
    {
      "userId": "userId1"
    },
    {
      "userId": "userId2",
      "amount": 600
    }
  ]
}
```
- **Validation Notes:**
  - `planId`: Required
  - `payerId`: Required (User ID of person who paid)
  - `amount`: Required, positive number
  - `category`: Required, must be: FOOD, TRANSPORT, ACCOMMODATION, ACTIVITY, SHOPPING, OTHER
  - `expenseDate`: Required, date format (YYYY-MM-DD)
  - `splitType`: Required, must be: EQUAL, CUSTOM, PERCENTAGE
  - `currency`: Optional (default: USD)
  - `description`: Optional, max 1000 characters
  - `locationId`: Optional, UUID
  - `participants`: Array of objects with:
    - `userId`: Required
    - `amount`: Optional (required for CUSTOM split, sum must equal total)
    - `percentage`: Optional (required for PERCENTAGE split, sum must equal 100)
  - **Split Type Rules:**
    - **EQUAL:** participants optional, split equally among all participants
    - **CUSTOM:** participants required with `amount` field, sum must equal total amount
    - **PERCENTAGE:** participants required with `percentage` field, sum must equal 100

**Update Expense:**
- **Endpoint:** `PATCH /api/v1/expenses/:expenseId`
- **Authentication:** Required (creator or plan admin only)
- **Request Body:** All fields optional
```json
{
  "amount": 1500,
  "category": "FOOD",
  "description": "Updated expense description",
  "expenseDate": "2025-09-22"
}
```
- **Validation Notes:**
  - `planId` and `splitType` cannot be updated
  - All other fields can be updated

**Delete Expense:**
- **Endpoint:** `DELETE /api/v1/expenses/:expenseId`
- **Authentication:** Required (creator or plan admin only)
- **Success:** Returns success message

**Settle Expense:**
- **Endpoint:** `PATCH /api/v1/expenses/:expenseId/settle/:participantId`
- **Authentication:** Required
- **Important:** Uses `participantId` (ExpenseParticipant ID), NOT `userId`
- **No body needed**
- **Success:** Marks participant as settled (paid)

**Expenses Summary:**
- **Endpoint:** `GET /api/v1/expenses/summary?planId=:planId`
- **Authentication:** Required
- **Query Parameter:** `planId` (required)
- **Response:** Returns total expenses, breakdown by category, breakdown by payer, settlement calculations (who owes whom with net amounts), and budget comparison

---

#### Expense Summary Card

**Layout:** Summary cards at top (3-4 cards)

**Card 1: Total Spent**

- **Label:** "Total Spent"
- **Amount:** Total amount with currency
- **Icon:** Dollar icon
- **Color:** Blue

**Card 2: You Owe**

- **Label:** "You Owe"
- **Amount:** Total amount user owes
- **Icon:** Arrow down icon
- **Color:** Red (if amount > 0)

**Card 3: Owed to You**

- **Label:** "Owed to You"
- **Amount:** Total amount others owe user
- **Icon:** Arrow up icon
- **Color:** Green (if amount > 0)

**Card 4: Net Balance**

- **Label:** "Net Balance"
- **Amount:** Difference (Owed to You - You Owe)
- **Icon:** Balance icon
- **Color:** Green (positive) / Red (negative) / Gray (zero)

**Styling:**

- Grid layout: 1 column (mobile), 2 columns (tablet), 4 columns (desktop)
- Card design with shadow
- Color-coded amounts
- Clickable (optional: link to detailed view)

---

#### Expense List

**Filters:**

- **Category Filter:** All, Food, Transport, Accommodation, Activity, Shopping, Other
  - **API Parameter:** `category` (values: "FOOD", "TRANSPORT", "ACCOMMODATION", "ACTIVITY", "SHOPPING", "OTHER", omit for "All")
- **Payer Filter:** Filter by payer (optional)
  - **API Parameter:** `payerId`
- **Split Type Filter:** Filter by split type (optional)
  - **API Parameter:** `splitType` (values: "EQUAL", "CUSTOM", "PERCENTAGE")
- **Date Range:** Start date - End date picker
  - **API Parameters:** `startDate`, `endDate` (YYYY-MM-DD format)
- **Search:** Search in description
  - **API Parameter:** `searchTerm`
- **Clear Filters Button:** "Clear All"

**Sort Options:**

- **Dropdown:** Date (newest first), Date (oldest first), Amount (high to low), Amount (low to high)
- **Default:** Date (newest first)
- **API Parameters:**
  - `sortBy`: Sort field (optional)
  - `sortOrder`: "asc" or "desc" (default: "desc")
- **Pagination:**
  - **API Parameters:** `page`, `limit`
  - Use `meta.page`, `meta.limit`, `meta.total` from response

**View Toggle:**

- **List View:** Default
- **Grouped View:** Group by category or date (optional, client-side)

---

#### Expense Card (Each Expense)

**Display:**

- **Category Badge:** Food, Transport, etc. (with icon and color)
- **Amount:** Large, prominent (e.g., "$150.00")
- **Currency:** Display currency code
- **Paid By:**
  - User avatar/name (from `payer` object)
  - "Paid by [Name]" text
- **Participants:**
  - List of participants with avatars
  - Amount each owes (for custom/percentage splits)
  - Settlement status for each participant
- **Date:** Expense date (formatted from `expenseDate`)
- **Description:** Expense description (if available, gray text)
- **Settlement Status Badge:**
  - Fully Settled (green)
  - Partially Settled (yellow)
  - Unsettled (red)
- **Actions:**
  - Edit (pencil icon) → Opens edit form
    - **API:** `PATCH /api/v1/expenses/:expenseId`
  - Delete (trash icon) → Confirmation modal
    - **API:** `DELETE /api/v1/expenses/:expenseId`
  - Settle (checkmark icon) → Settlement modal
    - **API:** `PATCH /api/v1/expenses/:expenseId/settle/:participantId`
    - **Important:** Use ExpenseParticipant ID (not userId)

**Styling:**

- Card layout with padding
- Category badge at top
- Amount prominently displayed
- Participant avatars in row
- Hover effects
- Status badge clearly visible

---

#### Create Expense Form (Modal)

**Title:** "Add New Expense"

**Form Fields:**

**Payer** (required):

- **Type:** select dropdown
- **Label:** "Paid By \*"
- **Placeholder:** "Select who paid"
- **Options:** All plan members (with avatars)
- **Validation:** Required
- **Error:** "Please select who paid for this expense"
- **Backend Field:** `payerId` (User ID, required)

**Amount** (required):

- **Type:** number input
- **Label:** "Amount \*"
- **Placeholder:** "0.00"
- **Min:** 0.01
- **Step:** 0.01
- **Validation:** Required, must be positive number
- **Error:** "Amount must be greater than 0"
- **Format:** Currency formatting (e.g., $150.00)

**Currency** (required):

- **Type:** select dropdown
- **Label:** "Currency \*"
- **Options:** USD, EUR, GBP, JPY, CAD, AUD, etc.
- **Default:** USD
- **Validation:** Required
- **Error:** "Please select a currency"

**Category** (required):

- **Type:** select dropdown or radio buttons
- **Label:** "Category \*"
- **Options:**
  - **Food:** "Food & Dining" (fork icon)
  - **Transport:** "Transportation" (car/plane icon)
  - **Accommodation:** "Accommodation" (bed icon)
  - **Activity:** "Activities & Entertainment" (ticket icon)
  - **Shopping:** "Shopping" (bag icon)
  - **Other:** "Other" (dots icon)
- **Validation:** Required
- **Error:** "Please select a category"
- **Styling:** Icons for each category

**Split Type** (required):

- **Type:** radio buttons
- **Label:** "How to Split? \*"
- **Options:**
  - **Equal:** "Split equally among participants"
  - **Custom:** "Set custom amounts for each person"
  - **Percentage:** "Split by percentage"
- **Default:** Equal
- **Validation:** Required
- **Error:** "Please select a split type"

**Participants** (required, multi-select):

- **Type:** Multi-select dropdown or checkboxes
- **Label:** "Participants \*"
- **Options:** All plan members (with avatars)
- **Default:** All members selected (excluding payer)
- **Validation:** At least 1 participant required
- **Error:** "Please select at least one participant"
- **Backend Field:** `participants` (array of objects)
- **Participant Object Structure:**
  - `userId`: Required (User ID)
  - `amount`: Optional (required for CUSTOM split)
  - `percentage`: Optional (required for PERCENTAGE split)
- **Custom/Percentage Split:**
  - If **CUSTOM** selected: Show amount input for each participant
    - Total of all amounts must equal expense amount
    - Validation: "Total must equal expense amount"
  - If **PERCENTAGE** selected: Show percentage input for each participant
    - Total of all percentages must equal 100
    - Validation: "Total percentage must equal 100"
  - If **EQUAL** selected: No amount/percentage needed, split equally

**Date** (required):

- **Type:** date picker
- **Label:** "Expense Date \*"
- **Placeholder:** "Select date"
- **Default:** Today
- **Validation:** Required, must be within plan date range
- **Error:** "Date must be within the travel plan dates"
- **Backend Field:** `expenseDate` (YYYY-MM-DD format, not `date`)

**Description** (optional):

- **Type:** textarea
- **Label:** "Description"
- **Placeholder:** "Add notes about this expense..."
- **Max Length:** 500 characters
- **Character Counter:** "X / 500 characters"
- **Rows:** 3-4

**Form Actions:**

- **Cancel Button:** Close modal without saving
- **Save Button:** Create expense
- **Loading State:** Show spinner during submission
- **API Call:** `POST /api/v1/expenses` with `credentials: 'include'`
- **Request Body:** Convert form data to API format:
```json
{
  "planId": "planId",
  "payerId": "payerId",
  "amount": 1200,
  "currency": "BDT",
  "category": "FOOD",
  "expenseDate": "2025-09-21",
  "splitType": "EQUAL",
  "description": "Lunch at beachside restaurant.",
  "participants": [
    {
      "userId": "userId1"
    },
    {
      "userId": "userId2",
      "amount": 600
    }
  ]
}
```
- **Validation Notes:**
  - `payerId`: Required (User ID of person who paid)
  - `expenseDate`: Date format (YYYY-MM-DD)
  - `splitType`: EQUAL, CUSTOM, or PERCENTAGE
  - For CUSTOM: Each participant must have `amount`, sum must equal total
  - For PERCENTAGE: Each participant must have `percentage`, sum must equal 100
  - For EQUAL: No amount/percentage needed
- **Success:** 
  - Close modal
  - Refresh expense list using `GET /api/v1/expenses?planId=:planId`
  - Show success toast: "Expense created successfully"
- **Error:** Display error from `errorMessages` array

**Styling:**

- Modal overlay
- Form validation on submit
- Clear field labels
- Helpful placeholders

---

#### Settlement View

**Section Title:** "Settlement Summary"

**Who Owes What Section:**

- **Title:** "You Owe"
- **List:**
  - Each member user owes money to
  - Amount owed
  - "Settle" button for each
- **Total:** Total amount user owes

**Who Owes You Section:**

- **Title:** "Owed to You"
- **List:**
  - Each member who owes user money
  - Amount owed
  - "Request Payment" button (optional)
- **Total:** Total amount owed to user

**Settlement Actions:**

- **Settle Button:** "Mark as Settled"
- **Action:** Opens confirmation modal
- **Confirmation:** "Mark [Participant Name] as settled for this expense?"
- **API Call:** `PATCH /api/v1/expenses/:expenseId/settle/:participantId` with `credentials: 'include'`
- **Important:** Use `participantId` (ExpenseParticipant ID from expense.participants array), NOT `userId`
- **No body needed**
- **Success:** 
  - Update expense in list
  - Refresh expense details
  - Show success toast: "Expense marked as settled"
- **Error:** Display error message

**Styling:**

- Clear section headers
- List layout with avatars
- Amounts prominently displayed
- Action buttons clearly visible

---

#### Empty State

**Message:** "No expenses added yet. Start tracking your trip expenses!"

**Button:** "Add First Expense"

**Styling:**

- Centered content
- Large icon
- Friendly message

---

### 5.9 Meetups (`/dashboard/meetups/:planId`)

#### Page Title

"Meetups - [Plan Name]"

**Breadcrumb:** Dashboard > Travel Plans > [Plan Name] > Meetups

---

#### API Integration

**Get All Meetups For a Plan:**
- **Endpoint:** `GET /api/v1/meetups`
- **Authentication:** Required
- **Query Parameters:**
  - `planId`: Filter by plan ID (required for plan-specific view)
  - `page`: Page number (optional, default: 1)
  - `limit`: Items per page (optional, default: 10)
  - `sortBy`: Sort field (optional)
  - `sortOrder`: "asc" or "desc" (optional, default: "desc")
  - `searchTerm`: Search in location (optional)
  - `status`: Filter by status - "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED" (optional)
  - `organizerId`: Filter by organizer ID (optional)
- **Response Structure:**
```json
{
  "success": true,
  "message": "Meetups retrieved successfully.",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  },
  "data": [
    {
      "id": "meetupId",
      "planId": "planId",
      "organizerId": "userId",
      "scheduledAt": "2025-09-20T16:00:00.000Z",
      "location": "Cafe Rio",
      "locationId": "locationId",
      "maxParticipants": 8,
      "status": "PENDING",
      "videoRoomLink": "url",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "plan": { ... },
      "organizer": { ... },
      "rsvps": [ ... ]
    }
  ]
}
```

**Get Single Meetup:**
- **Endpoint:** `GET /api/v1/meetups/:meetupId`
- **Authentication:** Required
- **Response:** Returns meetup with plan, organizer, and RSVPs

**Create Meetup:**
- **Endpoint:** `POST /api/v1/meetups`
- **Authentication:** Required
- **Request Body:**
```json
{
  "planId": "planId",
  "scheduledAt": "2025-09-20T16:00:00.000Z",
  "location": "Cafe Rio",
  "maxParticipants": 8
}
```
- **Validation Notes:**
  - `planId`: Required
  - `scheduledAt`: Required, ISO datetime string, must be future date
  - `location`: Optional, max 500 characters
  - `locationId`: Optional, UUID (mutually exclusive with `location` - provide only one)
  - `maxParticipants`: Optional, positive integer
  - `videoRoomLink`: Optional, valid URL
  - **Important:** Error will be shown if travel plan has ended (plan.endDate < today)
- **Error Messages:**
  - "This travel plan has ended. No meetup can be scheduled now for this plan."
  - "Scheduled date must be a valid future date."

**Update Meetup:**
- **Endpoint:** `PATCH /api/v1/meetups/:meetupId`
- **Authentication:** Required (organizer/admin only)
- **Request Body:** All fields optional
```json
{
  "scheduledAt": "2025-09-21T16:00:00.000Z",
  "location": "New Location",
  "maxParticipants": 10
}
```
- **Validation Notes:**
  - `scheduledAt`: Must be future date if provided
  - `location` and `locationId` are mutually exclusive

**RSVP To Meetup:**
- **Endpoint:** `POST /api/v1/meetups/:meetupId/rsvp`
- **Authentication:** Required
- **Request Body:**
```json
{
  "status": "ACCEPTED"
}
```
- **Validation Notes:**
  - `status`: Required, must be "ACCEPTED" or "DECLINED"
  - `meetupId`: In URL path

**Update Meetup Status:**
- **Endpoint:** `PATCH /api/v1/meetups/:meetupId/status`
- **Authentication:** Required (organizer/admin only)
- **Request Body:**
```json
{
  "status": "CONFIRMED"
}
```
- **Validation Notes:**
  - `status`: Required, must be one of: "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"
  - Valid transitions: PENDING → CONFIRMED/CANCELLED, CONFIRMED → COMPLETED/CANCELLED
  - COMPLETED and CANCELLED cannot be changed

**Remove Meetup:**
- **Endpoint:** `DELETE /api/v1/meetups/:meetupId`
- **Authentication:** Required (organizer/admin only)
- **Success:** Returns success message

---

#### Meetup List

**Filters:**

- **Status Filter:** All, Pending, Confirmed, Completed, Cancelled
  - **API Parameter:** `status` (values: "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", omit for "All")
- **Search:** Search in location
  - **API Parameter:** `searchTerm`
- **Organizer Filter:** Filter by organizer (optional)
  - **API Parameter:** `organizerId`
- **Clear Filters Button:** "Clear All"

**View Toggle:**

- **List View:** Default (chronological list)
- **Calendar View:** Calendar layout (optional, advanced feature)

**Sort Options:**

- **Dropdown:** Date (upcoming first), Date (past first), Status
- **Default:** Date (upcoming first)
- **API Parameters:** 
  - `sortBy`: Sort field (optional)
  - `sortOrder`: "asc" or "desc" (default: "desc")
- **Pagination:**
  - **API Parameters:** `page`, `limit`
  - Use `meta.page`, `meta.limit`, `meta.total` from response

---

#### Meetup Card (Each Meetup)

**Display:**

- **Status Badge:** PENDING, CONFIRMED, COMPLETED, CANCELLED (color-coded)
- **Scheduled Date & Time:**
  - Date (formatted: "Dec 15, 2024")
  - Time (formatted: "2:00 PM")
  - Relative time: "In 3 days" or "2 days ago"
- **Location:**
  - Location name/address (if provided)
  - Map pin icon
  - "View on Map" link (optional)
- **Organizer:**
  - Organizer name and avatar
  - "Organized by [Name]"
- **RSVP Count:**
  - "X of Y participants" or "X participants"
  - Max participants limit (if set): "Max: Y participants"
  - Progress bar (if max set)
- **Description:** Meetup description (if available)
- **RSVP Status** (for current user):
  - "You: Accepted" (green badge)
  - "You: Declined" (red badge)
  - "You: Pending" (yellow badge)
  - "RSVP" button (if not responded)
- **Actions:**
  - View Details (eye icon) → Full meetup details
    - **API:** `GET /api/v1/meetups/:meetupId`
  - RSVP (if not organizer) → Accept/Decline buttons
    - **API:** `POST /api/v1/meetups/:meetupId/rsvp` with `{ status: "ACCEPTED" | "DECLINED" }`
  - Edit (if organizer/plan owner) → Edit form
    - **API:** `PATCH /api/v1/meetups/:meetupId`
  - Delete (if organizer/plan owner) → Confirmation modal
    - **API:** `DELETE /api/v1/meetups/:meetupId`
  - Update Status (if organizer/plan owner) → Status update dropdown
    - **API:** `PATCH /api/v1/meetups/:meetupId/status` with `{ status: "CONFIRMED" | "COMPLETED" | "CANCELLED" }`

**Styling:**

- Card layout with padding
- Status badge at top
- Date/time prominently displayed
- RSVP section clearly visible
- Hover effects
- Responsive layout

---

#### Create Meetup Form (Modal)

**Title:** "Create New Meetup"

**Form Fields:**

**Scheduled At** (required):

- **Type:** datetime picker
- **Label:** "Date & Time \*"
- **Placeholder:** "Select date and time"
- **Validation:** Required, must be in the future
- **Error:** "Date and time must be in the future"
- **Feature:** Combined date and time picker
- **Time Zone:** Display timezone (optional)

**Location** (optional):

- **Type:** text input with autocomplete
- **Label:** "Location"
- **Placeholder:** "Meeting location (e.g., Central Park, New York)"
- **Feature:** Google Places autocomplete
- **Map Preview:** Show location on map (optional)

**Max Participants** (optional):

- **Type:** number input
- **Label:** "Maximum Participants"
- **Placeholder:** "Leave empty for unlimited"
- **Min:** 1
- **Validation:** Must be positive number if provided
- **Error:** "Maximum participants must be at least 1"
- **Help Text:** "Leave empty to allow unlimited participants"

**Video Room Link** (optional):

- **Type:** URL input
- **Label:** "Video Room Link"
- **Placeholder:** "https://meet.google.com/..."
- **Validation:** Must be valid URL if provided
- **Help Text:** "Optional video call link for virtual meetups"

**Form Actions:**

- **Cancel Button:** Close modal without saving
- **Create Button:** Create meetup
- **Loading State:** Show spinner during submission
- **API Call:** `POST /api/v1/meetups` with `credentials: 'include'`
- **Request Body:**
```json
{
  "planId": "planId",
  "scheduledAt": "2025-09-20T16:00:00.000Z",
  "location": "Cafe Rio",
  "maxParticipants": 8
}
```
- **Validation Notes:**
  - `scheduledAt` must be future date (ISO datetime string)
  - `location` and `locationId` are mutually exclusive (provide only one)
  - Plan must not have ended (plan.endDate >= today)
- **Success:** 
  - Close modal
  - Refresh meetup list using `GET /api/v1/meetups?planId=:planId`
  - Show success toast: "Meetup created successfully"
- **Error:** Display error from `errorMessages` array
  - "This travel plan has ended. No meetup can be scheduled now for this plan."
  - "Scheduled date must be a valid future date."

**Styling:**

- Modal overlay
- Form validation on submit
- Clear field labels
- Helpful placeholders

---

#### RSVP Functionality

**RSVP Buttons** (on meetup card or details page):

- **Accept Button:** "Accept" (green, primary)
- **Decline Button:** "Decline" (red, secondary)

**RSVP Modal** (if using modal):

- **Title:** "RSVP to Meetup"
- **Message:** Meetup details (date, time, location)
- **Options:**
  - Accept button
  - Decline button
  - Cancel button
- **Max Participants Check:**
  - If accepting and max participants reached: Show error
  - Error: "Maximum participants limit reached. Cannot accept RSVP."

**RSVP API Call:**

- **Endpoint:** `POST /api/v1/meetups/:meetupId/rsvp` with `credentials: 'include'`
- **Request Body:**
```json
{
  "status": "ACCEPTED"
}
```
- **Validation Notes:**
  - `status`: Required, must be "ACCEPTED" or "DECLINED"
  - `meetupId`: In URL path
- **Success:** 
  - Update RSVP status in UI
  - Refresh meetup details
  - Show success toast
- **Error:** Display error message

**RSVP Status Display:**

- **Accepted:** Green badge, checkmark icon
- **Declined:** Red badge, X icon
- **Pending:** Yellow badge, clock icon

**Auto-create Invitation:**

- If user RSVPs and no invitation exists, create invitation automatically
- Notification sent to organizer

**Styling:**

- Clear action buttons
- Status badges with icons
- Error messages prominently displayed

---

#### Update Status (Organizer Only)

**Status Dropdown:**

- **Current Status:** Display current status
- **Update To:**
  - PENDING → CONFIRMED
  - PENDING → CANCELLED
  - CONFIRMED → COMPLETED
  - CONFIRMED → CANCELLED
- **Disabled:** COMPLETED and CANCELLED cannot be changed

**Status Update API Call:**

- **Endpoint:** `PATCH /api/v1/meetups/:meetupId/status` with `credentials: 'include'`
- **Request Body:**
```json
{
  "status": "CONFIRMED"
}
```
- **Validation Notes:**
  - `status`: Required, must be one of: "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"
  - Valid transitions: PENDING → CONFIRMED/CANCELLED, CONFIRMED → COMPLETED/CANCELLED
  - COMPLETED and CANCELLED cannot be changed
- **Success:** 
  - Update status in UI
  - Refresh meetup details
  - Show success toast
  - Notification sent to participants on status change
- **Error:** Display error message if invalid transition

**Status Update Rules:**

- Show validation message if invalid transition
- Confirmation for status changes
- Notification sent to participants on status change

**Styling:**

- Dropdown with status options
- Clear status indicators
- Confirmation modal for changes

---

#### Empty State

**Message:** "No meetups scheduled yet. Create your first meetup!"

**Button:** "Create First Meetup"

**Styling:**

- Centered content
- Large icon
- Friendly message

---

**Part 3 Complete!** ✅

এই পর্যন্ত সম্পন্ন হয়েছে:

- 5.8 Expenses (Summary cards, Expense list, Create form with 8 fields, Settlement view)
- 5.9 Meetups (Meetup list, Create form with 4 fields, RSVP functionality, Status updates)

---

### 5.10 Media Gallery (`/dashboard/media/:planId`)

#### Page Title

"Media Gallery - [Plan Name]"

**Breadcrumb:** Dashboard > Travel Plans > [Plan Name] > Media

---

#### API Integration

**List Media Files:**
- **Endpoint:** `GET /api/v1/media`
- **Authentication:** Required
- **Query Parameters:**
  - `type`: Filter by type - "photo" or "video" (optional)
  - `ownerId`: Filter by owner ID (UUID, optional)
  - `planId`: Filter by plan ID (UUID, optional)
  - `meetupId`: Filter by meetup ID (UUID, optional)
  - `itineraryItemId`: Filter by itinerary item ID (UUID, optional)
  - `provider`: Filter by provider (optional)
  - `page`: Page number (optional, default: 1)
  - `limit`: Items per page (optional, default: 10)
  - `sortBy`: Sort field (optional)
  - `sortOrder`: "asc" or "desc" (optional)
- **Response Structure:**
```json
{
  "success": true,
  "message": "Media files retrieved successfully.",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  },
  "data": [
    {
      "id": "mediaId",
      "ownerId": "userId",
      "planId": "planId",
      "meetupId": "meetupId",
      "itineraryItemId": "itineraryItemId",
      "url": "https://cloudinary-url/image.jpg",
      "type": "photo",
      "provider": "cloudinary",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Get Single Media:**
- **Endpoint:** `GET /api/v1/media/:mediaId`
- **Authentication:** Required
- **Response:** Returns media details including URL, type, and associated entity

**Upload Media File:**
- **Endpoint:** `POST /api/v1/media`
- **Authentication:** Required
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `files`: File(s) to upload (required, can be multiple, max 10 files)
  - `planId`: Associate with plan (UUID, optional)
  - `meetupId`: Associate with meetup (UUID, optional)
  - `itineraryItemId`: Associate with itinerary item (UUID, optional)
  - `type`: Media type - "photo" or "video" (optional)
- **Validation Notes:**
  - At least one of `planId`, `meetupId`, or `itineraryItemId` must be provided
  - Max 10 files per request
  - File size and type validation handled by backend
- **Success:** Returns array of uploaded media objects

**Delete Media File:**
- **Endpoint:** `DELETE /api/v1/media/:mediaId`
- **Authentication:** Required (creator/admin only)
- **Success:** Returns success message

---

#### Upload Section

**Drag & Drop Area:**

- **Layout:** Large drop zone with dashed border
- **Text:** "Drag and drop images here or click to browse"
- **Icon:** Upload/Image icon (large, centered)
- **File Input:** Hidden file input (triggered on click)
- **Accepted Formats:** JPEG, PNG, WebP
- **Max Files:** 10 files at a time
- **Max File Size:** 5MB per file
- **Validation Messages:**
  - "Please select image files only"
  - "File size must be less than 5MB"
  - "Maximum 10 files allowed"

**Upload Progress:**

- **Progress Indicator:** Progress bar for each file
- **Status:** Uploading, Success, Error
- **File Name:** Display file name during upload
- **Cancel Button:** Cancel upload (optional)

**Preview Thumbnails:**

- **Before Upload:** Show selected files as thumbnails
- **After Upload:** Show uploaded images with success checkmark
- **Remove Button:** Remove file before upload (X icon)

**Upload API Call:**

- **Endpoint:** `POST /api/v1/media` with `credentials: 'include'`
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `files`: Array of files (required, max 10 files)
  - `planId`: Plan ID (optional, but at least one of planId/meetupId/itineraryItemId required)
  - `meetupId`: Meetup ID (optional)
  - `itineraryItemId`: Itinerary item ID (optional)
  - `type`: "photo" or "video" (optional)
- **Validation:**
  - Max 10 files per request
  - File type: JPEG, PNG, WebP (for photos)
  - Max file size: 5MB per file
- **Success:** 
  - Show success toast for each uploaded file
  - Refresh gallery using `GET /api/v1/media?planId=:planId`
  - Display uploaded images in gallery
- **Error:** Display error from `errorMessages` array

**Styling:**

- Large, prominent drop zone
- Visual feedback on drag over
- Clear upload instructions
- Progress indicators clearly visible

---

#### Gallery View

**Layout Options:**

- **Grid View:** Default (responsive grid)
- **List View:** Optional (with thumbnails and details)
- **Masonry View:** Optional (Pinterest-style)

**Grid Layout:**

- **Mobile:** 1-2 columns
- **Tablet:** 3 columns
- **Desktop:** 4-5 columns
- **Spacing:** Consistent gaps between images

**Filters:**

- **Filter by Type:** All, Photo, Video
  - **API Parameter:** `type` (values: "photo" or "video", omit for "All")
- **Filter by Association:** All, Plan Photos, Meetup Photos, Itinerary Photos
  - **API Parameters:** `planId`, `meetupId`, `itineraryItemId` (UUIDs, optional)
- **Filter by Owner:** Filter by uploader (optional)
  - **API Parameter:** `ownerId` (UUID)
- **Filter by Provider:** Filter by storage provider (optional)
  - **API Parameter:** `provider`
- **Sort:** Newest, Oldest, File Size
  - **API Parameters:**
    - `sortBy`: Sort field (optional)
    - `sortOrder`: "asc" or "desc" (optional)
- **Pagination:**
  - **API Parameters:** `page`, `limit`
  - Use `meta.page`, `meta.limit`, `meta.total` from response
- **Clear Filters Button:** "Clear All"

**Search:**

- **Search Input:** "Search media by description..."
- **Note:** Search functionality not available in current API (can be implemented client-side)
- **Real-time Filtering:** Filter as user types (client-side if needed)

---

#### Media Item (Each Image)

**Thumbnail:**

- **Aspect Ratio:** Maintain original or square (1:1)
- **Lazy Loading:** Load images as user scrolls
- **Placeholder:** Blur placeholder while loading
- **Error State:** Show error icon if image fails to load

**Hover Overlay:**

- **View Button:** Eye icon → Opens lightbox
  - **API:** `GET /api/v1/media/:mediaId` to fetch full media details
- **Delete Button:** Trash icon → Confirmation modal
  - **API:** `DELETE /api/v1/media/:mediaId` (creator/admin only)
- **Info Button:** Info icon → Shows metadata (optional)
  - **API:** `GET /api/v1/media/:mediaId` to fetch details

**Metadata (on hover or in list view):**

- **Upload Date:** "Uploaded on [date]"
- **Uploaded By:** User name and avatar
- **File Size:** "2.5 MB"
- **Dimensions:** "1920x1080" (optional)
- **Associated With:** "Plan: [Plan Name]" or "Meetup: [Meetup Name]"

**Styling:**

- Smooth hover transitions
- Clear action buttons
- Responsive thumbnails
- Consistent spacing

---

#### Lightbox (Full-Screen Image Viewer)

**Layout:**

- **Full Screen:** Dark overlay, centered image
- **Image Display:** Large image with zoom capability
- **Navigation:**
  - Previous button (left arrow) → Previous image
  - Next button (right arrow) → Next image
  - Keyboard navigation (arrow keys)
- **Close Button:** X icon (top right) or click outside

**Image Controls:**

- **Zoom In/Out:** Mouse wheel or buttons
- **Pan:** Drag image when zoomed
- **Fit to Screen:** Button to fit image to viewport
- **Full Size:** Button to view original size

**Image Information:**

- **Title/Description:** Display if available
- **Metadata:** Upload date, uploaded by, file size
- **Actions:**
  - Download button
  - Delete button (if user is owner)
  - Share button (optional)

**Styling:**

- Smooth transitions
- Clear navigation controls
- Professional appearance
- Mobile-friendly touch gestures

---

#### Delete Media

**Confirmation Modal:**

- **Title:** "Delete Media"
- **Message:** "Are you sure you want to delete this image? This action cannot be undone."
- **Image Preview:** Show thumbnail of image to delete
- **Buttons:**
  - Cancel → Close modal
  - Delete → Confirm deletion
- **Loading State:** Show spinner during deletion
- **API Call:** `DELETE /api/v1/media/:mediaId` with `credentials: 'include'`
- **Success:** 
  - Remove from gallery
  - Show success toast: "Media deleted successfully"
- **Error:** Display error message

**Styling:**

- Clear confirmation message
- Image preview for clarity
- Destructive action button (red)

---

#### Empty State

**Message:** "No media uploaded yet. Start sharing your trip memories!"

**Button:** "Upload First Photo"

**Styling:**

- Centered content
- Large icon or illustration
- Friendly message
- Prominent upload button

---

### 5.11 Chat (`/dashboard/chat/:planId`)

#### Page Title

"Chat - [Plan Name]"

**Breadcrumb:** Dashboard > Travel Plans > [Plan Name] > Chat

---

#### API Integration

**Get Chat Thread By Plan:**
- **Endpoint:** `GET /api/v1/chat/threads?planId=:planId`
- **Authentication:** Required
- **Query Parameter:** `planId` (required, in query string, not URL path)
- **Response Structure:**
```json
{
  "success": true,
  "message": "Chat thread found successfully.",
  "data": {
    "id": "threadId",
    "type": "PLAN",
    "refId": "planId",
    "title": "Chat: Spring Trip to Cox's Bazar",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "members": [
      {
        "id": "memberId",
        "threadId": "threadId",
        "userId": "userId",
        "role": "owner",
        "joinedAt": "2025-01-01T00:00:00.000Z",
        "user": {
          "id": "userId",
          "fullName": "User Name",
          "email": "user@example.com",
          "profileImage": "url"
        }
      }
    ]
  }
}
```
- **Note:** Returns 404 if thread doesn't exist (create one if needed)

**Get Thread By ID:**
- **Endpoint:** `GET /api/v1/chat/threads/:threadId`
- **Authentication:** Required
- **Response:** Same structure as Get Thread By Plan

**Create New Chat Thread:**
- **Endpoint:** `POST /api/v1/chat/threads`
- **Authentication:** Required
- **Request Body:**
```json
{
  "type": "PLAN",
  "refId": "planId",
  "title": "Trip Planning Chat"
}
```
- **Validation Notes:**
  - `type`: Required, must be "PLAN" (for plan-based chats)
  - `refId`: Required, the planId
  - `title`: Optional, auto-generated if not provided
- **Note:** Members are added separately via Add Member endpoint

**Add Member to Thread:**
- **Endpoint:** `POST /api/v1/chat/threads/:threadId/members`
- **Authentication:** Required (thread owner/admin only)
- **Request Body:**
```json
{
  "userId": "userId",
  "role": "member"
}
```
- **Validation Notes:**
  - `userId`: Required, must be actual User ID (not TripMember ID)
  - `role`: Required, must be one of: "owner", "admin", "member"
- **Error Messages:**
  - "Target user not found" (if userId doesn't exist)
  - "User is already a member of this thread"

**Get Messages in Thread:**
- **Endpoint:** `GET /api/v1/chat/threads/:threadId/messages`
- **Authentication:** Required
- **Query Parameters:**
  - `cursor`: ISO datetime string for cursor pagination (optional, use `nextCursor` from previous response)
  - `limit`: Number of messages per page (1-100, default: 30)
- **Response Structure:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully.",
  "data": {
    "messages": [
      {
        "id": "messageId",
        "threadId": "threadId",
        "senderId": "userId",
        "content": "Hello everyone!",
        "attachments": [],
        "isEdited": false,
        "isDeleted": false,
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z",
        "sender": {
          "id": "userId",
          "fullName": "User Name",
          "email": "user@example.com",
          "profileImage": "url"
        }
      }
    ],
    "nextCursor": "2025-01-01T00:00:00.000Z",
    "hasMore": true
  }
}
```
- **Pagination:** Use `cursor` for next page, `hasMore` to show/hide "Load More" button
- **Note:** Messages are returned in descending order (newest first), reverse for display

**Send Message:**
- **Endpoint:** `POST /api/v1/chat/threads/:threadId/messages`
- **Authentication:** Required
- **Request Body:**
```json
{
  "content": "Hello everyone!",
  "attachments": [
    {
      "url": "https://example.com/image.jpg",
      "type": "image/jpeg"
    }
  ]
}
```
- **Validation Notes:**
  - `content`: Required, 1-5000 characters
  - `attachments`: Optional array, max 10 items
  - Each attachment: `url` (required), `type` (optional)
- **Success:** Returns created message object

**Edit Message:**
- **Endpoint:** `PATCH /api/v1/chat/messages/:messageId`
- **Authentication:** Required (own messages only)
- **Request Body:**
```json
{
  "content": "Updated message content"
}
```
- **Validation Notes:**
  - `content`: Required, 1-5000 characters
  - Can only edit own messages within 15 minutes of sending
- **Success:** Returns updated message object with `isEdited: true`
- **Error:** "You can only edit your own messages" or "Message cannot be edited after 15 minutes"

**Delete Message:**
- **Endpoint:** `DELETE /api/v1/chat/messages/:messageId`
- **Authentication:** Required (own messages only)
- **Success:** Returns success message
- **Error:** "You can only delete your own messages"

**Get My Planning Sessions** (for thread list):
- **Endpoint:** `GET /api/v1/chat/threads` (if available, or use plan-based threads)
- **Note:** Currently, threads are plan-based. Use Get Thread By Plan to fetch thread for a plan.

---

#### Chat Interface Layout

**Left Sidebar** (Optional, for multiple threads):

- **Thread List:** List of all chat threads user is part of
- **Active Thread:** Highlighted in list
- **Unread Indicators:** Red dot with count for unread messages
- **Create Thread Button:** "New Chat" (if multiple threads allowed)
- **Styling:** Collapsible on mobile, fixed width on desktop

**Main Chat Area:**

- **Header:** Thread name, member count, member list
- **Messages Area:** Scrollable message list
- **Input Area:** Message input with send button

**Styling:**

- Split layout (sidebar + main) or full-width (main only)
- Responsive: Sidebar collapses on mobile
- Clear visual separation

---

#### Chat Header

**Thread Information:**

- **Thread Name:** "Plan: [Plan Name]" or "Chat with [User Name]"
- **Member Count:** "X members" (for group chats)
- **Member List:**
  - Avatars of all members
  - Click to view member details
  - "+X more" if many members

**Actions:**

- **Settings:** Thread settings (mute, leave, etc.)
- **Member Management:** Add/remove members (if user has permission)
  - **Add Member:** 
    - Opens modal with user search/select
    - **API:** `POST /api/v1/chat/threads/:threadId/members` with `{ userId, role: "member" }`
    - **Important:** Use actual User ID (not TripMember ID)
    - **Role Options:** "owner", "admin", "member"
    - **Success:** Refresh thread members list
    - **Error:** "Target user not found" or "User is already a member"

**Styling:**

- Sticky header (stays at top)
- Clear thread identification
- Member avatars in row

---

#### Messages Area

**Layout:**

- **Scrollable Container:** Auto-scroll to bottom on new messages
- **Message List:** Chronological order (oldest to newest) - reverse API response order
- **Date Separators:** "Today", "Yesterday", "[Date]" between messages
- **Loading State:** Show spinner while loading messages
- **Load More:** "Load older messages" button at top (cursor pagination)
- **API Call:** `GET /api/v1/chat/threads/:threadId/messages?limit=30`
- **Pagination:**
  - Initial load: No cursor, limit=30
  - Load more: Use `nextCursor` from previous response as `cursor` parameter
  - Show "Load More" button if `hasMore: true`
  - Hide button if `hasMore: false`

**Message Bubbles:**

**Sent Messages** (Right-aligned):

- **Background Color:** Primary color (blue)
- **Text Color:** White
- **Avatar:** User avatar (optional, small)
- **Content:**
  - Message text
  - Timestamp (e.g., "2:30 PM")
  - Read receipts (if implemented)
  - Edited indicator: "(edited)"
- **Actions:**
  - Edit button (pencil icon) → Edit message
  - Delete button (trash icon) → Delete message
- **Styling:** Rounded corners, shadow, right-aligned

**Received Messages** (Left-aligned):

- **Background Color:** Light gray/white
- **Text Color:** Dark gray/black
- **Avatar:** Sender avatar (larger, always shown)
- **Sender Name:** Display sender name (for group chats)
- **Content:**
  - Message text
  - Timestamp (e.g., "2:30 PM")
- **Styling:** Rounded corners, shadow, left-aligned

**Message Actions** (Hover or long-press):

- **Edit:** Edit own messages (within 15 minutes)
  - **API:** `PATCH /api/v1/chat/messages/:messageId` with `{ content: string }`
  - **Success:** Update message, show "(edited)" indicator
  - **Error:** "You can only edit your own messages" or "Message cannot be edited after 15 minutes"
- **Delete:** Delete own messages
  - **API:** `DELETE /api/v1/chat/messages/:messageId`
  - **Confirmation:** Show confirmation modal
  - **Success:** Remove message from list
  - **Error:** "You can only delete your own messages"
- **Copy:** Copy message text (client-side only)
- **Reply:** Reply to message (optional feature, not in current API)

**Styling:**

- Clear visual distinction between sent/received
- Consistent spacing
- Smooth animations
- Touch-friendly on mobile

---

#### Message Input Area

**Input Field:**

- **Type:** Textarea (auto-resize)
- **Placeholder:** "Type a message..."
- **Max Length:** 5000 characters (backend limit)
- **Character Counter:** "X / 5000" (optional, shown near limit)
- **Validation:** Min 1 character, max 5000 characters
- **Features:**
  - Emoji picker (optional)
  - File attachment (optional) - supports attachments array
  - Mention users with @ (optional, for future)
- **API Call:** `POST /api/v1/chat/threads/:threadId/messages` with `credentials: 'include'`
- **Request Body:**
```json
{
  "content": "Hello everyone!",
  "attachments": [
    {
      "url": "https://example.com/image.jpg",
      "type": "image/jpeg"
    }
  ]
}
```
- **Validation Notes:**
  - `content`: Required, 1-5000 characters
  - `attachments`: Optional array, max 10 items
  - Each attachment: `url` (required), `type` (optional MIME type)

**Send Button:**

- **Icon:** Send icon (paper plane)
- **State:**
  - Enabled when input has text (min 1 char)
  - Disabled when input is empty
  - Loading state during send
- **Keyboard:** Enter to send (Shift+Enter for new line)
- **Success:** 
  - Clear input field
  - Add message to list (optimistic update or refresh)
  - Auto-scroll to bottom
- **Error:** Display error from `errorMessages` array

**Typing Indicator:**

- **Display:** "[Name] is typing..." (below input)
- **Real-time:** Update as users type
- **Styling:** Subtle, non-intrusive

**Styling:**

- Sticky input area (bottom of screen)
- Clear send button
- Smooth input transitions

---

#### Real-time Updates

**New Messages:**

- **Auto-appear:** New messages appear automatically
- **Scroll to Bottom:** Auto-scroll to show new message
- **Notification Sound:** Optional sound for new messages
- **Browser Notification:** Optional browser notification (if tab not active)

**Message Status:**

- **Sending:** Show spinner or "Sending..."
- **Sent:** Show checkmark
- **Delivered:** Show double checkmark (if implemented)
- **Read:** Show read receipt (if implemented)

**Connection Status:**

- **Connected:** Green indicator
- **Connecting:** Yellow indicator
- **Disconnected:** Red indicator with "Reconnecting..." message

**Styling:**

- Smooth message appearance
- Clear status indicators
- Non-intrusive notifications

---

#### Edit Message

**Edit Mode:**

- **Trigger:** Click edit button on own message
- **Display:** Input field replaces message bubble
- **Pre-fill:** Current message content
- **Actions:**
  - Save button → Update message
  - Cancel button → Cancel edit
- **Loading State:** Show spinner during update
- **API Call:** `PATCH /api/v1/chat/messages/:messageId` with `credentials: 'include'`
- **Request Body:**
```json
{
  "content": "Updated message content"
}
```
- **Validation:** Content must be 1-5000 characters
- **Time Limit:** Can only edit within 15 minutes of sending
- **Success:** 
  - Update message in list
  - Show "(edited)" indicator
  - Set `isEdited: true` on message object
- **Error:** 
  - "You can only edit your own messages"
  - "Message cannot be edited after 15 minutes"
  - Display error from `errorMessages` array

**Styling:**

- Clear edit mode
- Easy to cancel
- Smooth transition

---

#### Delete Message

**Confirmation:**

- **Modal:** "Are you sure you want to delete this message?"
- **Buttons:**
  - Cancel → Close modal
  - Delete → Confirm deletion
- **Loading State:** Show spinner during deletion
- **API Call:** `DELETE /api/v1/chat/messages/:messageId` with `credentials: 'include'`
- **Success:** 
  - Remove message from list
  - Show success toast: "Message deleted"
- **Error:** 
  - "You can only delete your own messages"
  - Display error message

**Styling:**

- Clear confirmation
- Destructive action button

---

#### Empty State

**Message:** "No messages yet. Start the conversation!"

**Placeholder:** "Type a message to get started..."

**Styling:**

- Centered content
- Friendly message
- Clear call to action

---

**Part 4 Complete!** ✅

এই পর্যন্ত সম্পন্ন হয়েছে:

- 5.10 Media Gallery (Upload section, Gallery view, Lightbox, Delete functionality)
- 5.11 Chat (Chat interface, Messages, Real-time updates, Edit/Delete messages)

---

### 5.12 Reviews (`/dashboard/reviews`)

#### Page Title

"Reviews"

**Description:** "Manage your reviews and see what others say about you"

---

#### API Integration

**List Reviews:**
- **Endpoint:** `GET /api/v1/reviews`
- **Authentication:** Required
- **Query Parameters:**
  - `rating`: Filter by rating (1-5, optional)
  - `source`: Filter by source - "USER_TO_USER" or "USER_TO_TRIP" (optional)
  - `reviewerId`: Filter by reviewer ID (UUID, optional)
  - `reviewedUserId`: Filter by reviewed user ID (UUID, optional)
  - `planId`: Filter by plan ID (UUID, optional)
  - `isEdited`: Filter by edited status - "true" or "false" (optional)
  - `searchTerm`: Search in comments (optional)
  - `page`: Page number (optional, default: 1)
  - `limit`: Items per page (optional, default: 10)
  - `sortBy`: Sort field (optional)
  - `sortOrder`: "asc" or "desc" (optional)
- **Response Structure:**
```json
{
  "success": true,
  "message": "Reviews retrieved successfully.",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  },
  "data": [
    {
      "id": "reviewId",
      "reviewerId": "userId",
      "reviewedUserId": "userId",
      "planId": "planId",
      "rating": 5,
      "comment": "Great travel companion!",
      "source": "USER_TO_USER",
      "isEdited": false,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "reviewer": { ... },
      "reviewedUser": { ... },
      "plan": { ... }
    }
  ]
}
```

**Get Single Review:**
- **Endpoint:** `GET /api/v1/reviews/:reviewId`
- **Authentication:** Required
- **Response:** Returns review details with reviewer and reviewed entity information

**Get Review Statistics:**
- **Endpoint:** `GET /api/v1/reviews/statistics?userId=:userId&planId=:planId`
- **Authentication:** Required
- **Query Parameters:**
  - `userId`: Filter by user ID (UUID, optional)
  - `planId`: Filter by plan ID (UUID, optional)
- **Response:** Returns aggregated review statistics (average rating, total reviews, rating distribution)
- **Use Case:** Display statistics in Received Reviews tab

**Create Review:**
- **Endpoint:** `POST /api/v1/reviews`
- **Authentication:** Required
- **Request Body:**
```json
{
  "rating": 5,
  "comment": "Great travel companion!",
  "source": "USER_TO_USER",
  "reviewedUserId": "userId"
}
```
- **Validation Notes:**
  - `rating`: Required, integer 1-5
  - `source`: Required, must be "USER_TO_USER" or "USER_TO_TRIP"
  - `comment`: Optional, string
  - If `source` is "USER_TO_USER": `reviewedUserId` (UUID) is required
  - If `source` is "USER_TO_TRIP": `planId` (UUID) is required
- **Success:** Returns created review object

**Update Review:**
- **Endpoint:** `PATCH /api/v1/reviews/:reviewId`
- **Authentication:** Required (own reviews only)
- **Request Body:** All fields optional
```json
{
  "rating": 4,
  "comment": "Good, but could improve communication."
}
```
- **Success:** Returns updated review object with `isEdited: true`

**Delete Review:**
- **Endpoint:** `DELETE /api/v1/reviews/:reviewId`
- **Authentication:** Required (own reviews or admin)
- **Success:** Returns success message

---

#### Tabs Navigation

**Two Tabs:**

1. **Given Reviews Tab**
   - Reviews you've written
   - **API:** `GET /api/v1/reviews?reviewerId=:currentUserId`
   - Filter: All, User Reviews, Trip Reviews
   - **API Parameter:** `source` (values: "USER_TO_USER" or "USER_TO_TRIP", omit for "All")
   - Default: All

2. **Received Reviews Tab**
   - Reviews about you or your trips
   - **API:** `GET /api/v1/reviews?reviewedUserId=:currentUserId` (for user reviews) or `GET /api/v1/reviews?planId=:planId` (for trip reviews)
   - **API:** `GET /api/v1/reviews/statistics?userId=:currentUserId` for statistics
   - Filter: All, About Me, About My Trips
   - **API Parameters:** 
     - About Me: `reviewedUserId=:currentUserId`
     - About My Trips: `planId=:planId` (for each plan)
   - Default: All

**Styling:**

- Tab navigation (horizontal)
- Active tab highlighted
- Tab badges: Count of reviews in each tab

---

#### Review List

**Filters:**

- **Type Filter:** All, User Reviews, Trip Reviews (for Given Reviews)
  - **API Parameter:** `source` (values: "USER_TO_USER" or "USER_TO_TRIP", omit for "All")
- **Rating Filter:** All, 5 Stars, 4 Stars, 3 Stars, 2 Stars, 1 Star
  - **API Parameter:** `rating` (values: 1, 2, 3, 4, 5, omit for "All")
- **Search:** Search in comments
  - **API Parameter:** `searchTerm`
- **Sort:** Newest, Oldest, Highest Rating, Lowest Rating
  - **API Parameters:**
    - `sortBy`: Sort field (optional)
    - `sortOrder`: "asc" or "desc" (optional)
- **Pagination:**
  - **API Parameters:** `page`, `limit`
  - Use `meta.page`, `meta.limit`, `meta.total` from response
- **Clear Filters Button:** "Clear All"

**Review Card** (Each Review):

**Given Reviews:**

- **Rating:** Star display (1-5 stars, filled/unfilled)
- **Comment:** Review comment (if provided)
- **Reviewed Item:**
  - User: User name, avatar, "Review for [Name]"
  - Trip: Trip name, destination, "Review for [Trip Name]"
- **Date:** "Reviewed on [date]"
- **Actions:**
  - Edit (pencil icon) → Edit review form
  - Delete (trash icon) → Confirmation modal

**Received Reviews:**

- **Rating:** Star display (1-5 stars, filled/unfilled)
- **Comment:** Review comment (if provided)
- **Reviewed Item:**
  - About Me: Reviewer name, avatar, "Review by [Name]"
  - About My Trip: Trip name, reviewer name, "Review by [Name] for [Trip]"
- **Date:** "Reviewed on [date]"
- **Actions:**
  - View Details → Full review view
  - Report (flag icon) → Report inappropriate review (optional)

**Styling:**

- Card layout with padding
- Rating prominently displayed
- Clear reviewed item information
- Hover effects
- Responsive layout

---

#### Create Review Form (Modal)

**Title:** "Write a Review"

**Form Fields:**

**Rating** (required):

- **Type:** Star rating component (interactive)
- **Label:** "Rating \*"
- **Options:** 1-5 stars
- **Display:** Clickable stars, hover to preview rating
- **Validation:** Required, must select at least 1 star
- **Error:** "Please select a rating"

**Source** (required):

- **Type:** radio buttons
- **Label:** "Review Type \*"
- **Options:**
  - **Review a User:** "Write a review about a travel companion"
    - **Backend Value:** "USER_TO_USER"
  - **Review a Trip:** "Write a review about a travel plan"
    - **Backend Value:** "USER_TO_TRIP"
- **Default:** Review a User
- **Validation:** Required, must be "USER_TO_USER" or "USER_TO_TRIP"
- **Error:** "Please select a review type"
- **Backend Field:** `source` (required enum)

**Reviewed User/Plan** (required, based on source):

- **Type:** select dropdown
- **Label:**
  - "Select User \*" (if reviewing user, source: "USER_TO_USER")
  - "Select Trip \*" (if reviewing trip, source: "USER_TO_TRIP")
- **Options:**
  - For User: Shows users you've traveled with (with avatars)
  - For Trip: Shows trips you've been part of (with trip details)
- **Placeholder:** "Select [user/trip] to review"
- **Validation:** Required
- **Error:** "Please select a [user/trip] to review"
- **Backend Fields:**
  - If `source: "USER_TO_USER"`: `reviewedUserId` (UUID, required)
  - If `source: "USER_TO_TRIP"`: `planId` (UUID, required)

**Comment** (optional):

- **Type:** textarea
- **Label:** "Your Review"
- **Placeholder:** "Share your experience... (optional)"
- **Max Length:** 1000 characters
- **Character Counter:** "X / 1000 characters"
- **Rows:** 5-6
- **Help Text:** "Tell others about your experience (optional but helpful)"

**Form Actions:**

- **Cancel Button:** Close modal without saving
- **Submit Button:** "Submit Review"
- **Loading State:** Show spinner during submission
- **API Call:** `POST /api/v1/reviews` with `credentials: 'include'`
- **Request Body:** Convert form data to API format:
```json
{
  "rating": 5,
  "comment": "Great travel companion!",
  "source": "USER_TO_USER",
  "reviewedUserId": "userId"
}
```
OR
```json
{
  "rating": 5,
  "comment": "Amazing trip!",
  "source": "USER_TO_TRIP",
  "planId": "planId"
}
```
- **Validation Notes:**
  - `rating`: Required, integer 1-5
  - `source`: Required, "USER_TO_USER" or "USER_TO_TRIP"
  - `comment`: Optional, string
  - If `source: "USER_TO_USER"`: `reviewedUserId` required
  - If `source: "USER_TO_TRIP"`: `planId` required
- **Success:** 
  - Close modal
  - Refresh review list using `GET /api/v1/reviews`
  - Show success toast: "Review submitted successfully"
- **Error:** Display error from `errorMessages` array

**Styling:**

- Modal overlay
- Interactive star rating
- Clear field labels
- Helpful placeholders

---

#### Review Statistics (Received Reviews Tab)

**Statistics Section:**

- **API Integration:**
  - **Endpoint:** `GET /api/v1/reviews/statistics?userId=:currentUserId`
  - **Authentication:** Required
  - **Query Parameters:**
    - `userId`: Filter by user ID (UUID, optional, use current user ID for "About Me")
    - `planId`: Filter by plan ID (UUID, optional, for "About My Trips")
  - **Response:** Returns aggregated statistics (average rating, total reviews, rating distribution)
- **Average Rating:**
  - Large star display (e.g., 4.5/5)
  - "Based on X reviews"
  - **Data Source:** `averageRating` and `totalReviews` from statistics response
- **Rating Distribution:**
  - Bar chart or list showing:
    - 5 stars: X reviews (XX%)
    - 4 stars: X reviews (XX%)
    - 3 stars: X reviews (XX%)
    - 2 stars: X reviews (XX%)
    - 1 star: X reviews (XX%)
  - **Data Source:** `ratingDistribution` from statistics response
- **Total Reviews Count:** "X total reviews"
  - **Data Source:** `totalReviews` from statistics response

**Styling:**

- Prominent average rating
- Visual rating distribution
- Clear statistics layout

---

#### Edit Review

**Edit Form:**

- Same form as Create Review
- Pre-filled with existing review data
- **Title:** "Edit Review"
- **API Call:** `PATCH /api/v1/reviews/:reviewId` with `credentials: 'include'`
- **Request Body:** All fields optional
```json
{
  "rating": 4,
  "comment": "Good, but could improve communication."
}
```
- **Success:** 
  - Update review in list
  - Show "(edited)" indicator
  - Set `isEdited: true` on review object
  - Show success toast: "Review updated successfully"
- **Error:** Display error from `errorMessages` array
- **Actions:**
  - Cancel → Close without saving
  - Save Changes → Update review

**Styling:**

- Same as create form
- Pre-filled fields clearly visible

---

#### Delete Review

**Confirmation Modal:**

- **Title:** "Delete Review"
- **Message:** "Are you sure you want to delete this review? This action cannot be undone."
- **Buttons:**
  - Cancel → Close modal
  - Delete → Confirm deletion
- **Loading State:** Show spinner during deletion
- **API Call:** `DELETE /api/v1/reviews/:reviewId` with `credentials: 'include'`
- **Success:** 
  - Remove from list
  - Show success toast: "Review deleted successfully"
- **Error:** Display error message

**Styling:**

- Clear confirmation message
- Destructive action button

---

#### Empty States

**Given Reviews:**

- **Message:** "You haven't written any reviews yet"
- **Button:** "Write Your First Review"

**Received Reviews:**

- **Message:** "No reviews yet. Keep traveling and reviews will appear here!"
- **No Button:** (Informational only)

**Styling:**

- Centered content
- Large icon
- Friendly message

---

### 5.13 Subscriptions (`/dashboard/subscriptions`)

#### Page Title

"Subscriptions"

**Description:** "Manage your subscription and access premium features"

---

#### API Integration

**Get Current Subscription Status:**
- **Endpoint:** `GET /api/v1/subscriptions/status`
- **Authentication:** Required
- **Response:** Returns user's active subscription status with plan, validity, status, etc.
- **Use Case:** Display current subscription card

**Get Single Subscription:**
- **Endpoint:** `GET /api/v1/subscriptions/:subscriptionId`
- **Authentication:** Required
- **Response:** Returns subscription details by ID

**Create Subscription:**
- **Endpoint:** `POST /api/v1/subscriptions`
- **Authentication:** Required
- **Request Body:**
```json
{
  "planType": "MONTHLY"
}
```
- **Validation Notes:**
  - `planType`: Required, must be "MONTHLY" or "YEARLY"
- **Response:** Returns Stripe checkout session URL
- **Flow:** 
  1. Create subscription → Get Stripe session URL
  2. Redirect user to Stripe Checkout
  3. User completes payment on Stripe
  4. Stripe webhook updates subscription status
  5. User redirected back to subscriptions page

**Update Subscription:**
- **Endpoint:** `PATCH /api/v1/subscriptions/:subscriptionId`
- **Authentication:** Required
- **Request Body:**
```json
{
  "cancelAtPeriodEnd": true
}
```
- **Validation Notes:**
  - `cancelAtPeriodEnd`: Optional boolean
  - If `true`: Subscription will cancel at end of current billing period
  - If `false`: Cancel immediately
- **Use Case:** Cancel at period end or reactivate subscription

**Cancel Subscription:**
- **Endpoint:** `DELETE /api/v1/subscriptions/:subscriptionId`
- **Authentication:** Required
- **Success:** Cancels (ends) active subscription immediately
- **Note:** Use Update Subscription with `cancelAtPeriodEnd: true` to cancel at period end

**Subscription History (Admin):**
- **Endpoint:** `GET /api/v1/subscriptions`
- **Authentication:** Required (ADMIN role only)
- **Query Parameters:**
  - `status`: Filter by status - "ACTIVE", "PAST_DUE", "CANCELLED", "EXPIRED" (optional)
  - `planType`: Filter by plan type - "MONTHLY" or "YEARLY" (optional)
  - `planName`: Filter by plan name (optional)
  - `page`: Page number (optional, default: 1)
  - `limit`: Items per page (optional, default: 10)
  - `sortBy`: Sort field (optional)
  - `sortOrder`: "asc" or "desc" (optional)
- **Response:** Returns paginated list of all subscriptions

**Stripe Webhook:**
- **Endpoint:** `POST /api/v1/subscriptions/webhook`
- **Authentication:** Not required (Stripe calls this)
- **Headers:** `stripe-signature` (required for verification)
- **Body:** Raw JSON from Stripe
- **Note:** This is called by Stripe, not by frontend. Frontend doesn't need to implement this.

---

#### Current Subscription Card

**Layout:** Large card at top

**If Active Subscription:**

**Status Badge:**

- **Active:** Green badge with "Active" text
- **Past Due:** Yellow badge with "Past Due" text
- **Cancelled:** Gray badge with "Cancelled" text

**Plan Information:**

- **Plan Type:** "Monthly Plan" or "Yearly Plan" (large, bold)
- **Plan Name:** Display plan name
- **Price:** "$9.99/month" or "$99.99/year"

**Subscription Details:**

- **Started At:** "Started on [date]"
- **Expires At:**
  - "Expires on [date]" (if has expiration)
  - "Never expires" (if lifetime)
- **Days Remaining:**
  - Countdown: "X days remaining"
  - Progress bar (visual indicator)
- **Auto-renewal:** "Auto-renews on [date]" or "Cancels on [date]"

**Actions:**

- **Manage Subscription Button:** "Manage Subscription" → Opens management modal
  - **API:** `GET /api/v1/subscriptions/:subscriptionId` to fetch details
  - **API:** `PATCH /api/v1/subscriptions/:subscriptionId` to update settings
- **Cancel Subscription Button:** "Cancel Subscription" → Opens cancellation modal
  - **API:** `PATCH /api/v1/subscriptions/:subscriptionId` with `{ cancelAtPeriodEnd: true }` (cancel at period end)
  - **API:** `DELETE /api/v1/subscriptions/:subscriptionId` (cancel immediately)
- **Upgrade/Renew Button:** "Upgrade Plan" or "Renew Subscription" (if inactive)
  - **API:** `POST /api/v1/subscriptions` with `{ planType: "MONTHLY" | "YEARLY" }`

**Styling:**

- Prominent card design
- Clear status indicator
- Important information highlighted
- Action buttons clearly visible

**If No Active Subscription:**

**Message:** "You don't have an active subscription"

**Benefits List:**

- "Unlimited AI travel plans"
- "Priority support"
- "Advanced collaboration features"
- "Ad-free experience"

**Action Button:** "Subscribe Now" → Scrolls to plans section

---

#### Subscription Plans

**Section Title:** "Choose Your Plan"

**Plan Cards** (2 cards side by side):

**Monthly Plan Card:**

- **Plan Name:** "Monthly Plan"
- **Price:** "$9.99/month"
- **Billing:** "Billed monthly"
- **Features:**
  - ✓ Unlimited AI travel plans
  - ✓ Priority support
  - ✓ Advanced collaboration features
  - ✓ Ad-free experience
  - ✓ All premium features
- **Subscribe Button:** "Subscribe Monthly" (primary)
- **Popular Badge:** Optional (if monthly is popular)

**Yearly Plan Card:**

- **Plan Name:** "Yearly Plan"
- **Price:** "$99.99/year"
- **Savings Badge:** "Save 17%" (highlighted)
- **Billing:** "Billed annually ($8.33/month)"
- **Features:** Same as monthly
- **Subscribe Button:** "Subscribe Yearly" (primary, highlighted)
- **Best Value Badge:** "Best Value" (optional)

**Styling:**

- Side-by-side layout (desktop), stacked (mobile)
- Clear pricing
- Feature checkmarks
- Prominent subscribe buttons
- Savings badge highlighted

---

#### Stripe Checkout Integration

**Subscribe Flow:**

1. **Click Subscribe Button:**
   - Show loading state
   - **API Call:** `POST /api/v1/subscriptions` with `credentials: 'include'`
   - **Request Body:**
   ```json
   {
     "planType": "MONTHLY"
   }
   ```
   - **Response:** Returns Stripe checkout session object with `url` or `sessionId`
   - **Success:** Redirect user to Stripe Checkout URL
   - **Error:** Display error from `errorMessages` array

2. **Stripe Checkout:**
   - User enters payment details on Stripe's secure page
   - Stripe handles payment processing
   - User completes payment

3. **Success Redirect:**
   - Stripe redirects back to success URL (configured in backend)
   - Show success message: "Subscription activated successfully!"
   - **API:** `GET /api/v1/subscriptions/status` to fetch updated subscription
   - Update subscription card with new status
   - Refresh subscription details

4. **Error Handling:**
   - Display error message if payment fails
   - Allow user to retry subscription creation
   - Show support contact if needed
   - **Note:** Stripe webhook handles subscription status updates automatically

**Styling:**

- Seamless integration
- Clear loading states
- Success/error messages prominently displayed

---

#### Subscription Management

**Manage Subscription Modal:**

**Current Plan:**

- Display current plan details
- Status and expiration

**Options:**

- **Cancel Subscription:**
  - "Cancel at period end" (recommended)
    - **API:** `PATCH /api/v1/subscriptions/:subscriptionId` with `{ cancelAtPeriodEnd: true }`
    - Subscription continues until end of billing period
  - "Cancel immediately"
    - **API:** `DELETE /api/v1/subscriptions/:subscriptionId`
    - Subscription ends immediately
  - Confirmation required for both options
- **Update Payment Method:**
  - Link to Stripe customer portal (optional, if implemented)
  - Or redirect to Stripe billing portal
- **View Billing History:**
  - Link to payments page (`/dashboard/payments`)
  - **API:** `GET /api/v1/payments/my-payments`

**Styling:**

- Clear options
- Confirmation for cancellations
- Easy navigation

---

#### Cancel Subscription

**Cancellation Modal:**

**Title:** "Cancel Subscription"

**Warning Message:**

- "You will lose access to premium features when your subscription ends."
- "You can reactivate anytime before the end of your billing period."

**Cancellation Options:**

- **Cancel at Period End:**
  - "Continue until [date]"
  - "You'll have access until [date]"
  - Recommended option
- **Cancel Immediately:**
  - "Cancel now and lose access immediately"
  - Warning about immediate loss of access

**Reason (Optional):**

- **Dropdown:** "Why are you canceling?"
  - Too expensive
  - Not using features
  - Found alternative
  - Other
- **Textarea:** "Additional feedback (optional)"

**Actions:**

- **Keep Subscription:** Close modal
- **Cancel Subscription:** Confirm cancellation
  - **API Call (Cancel at Period End):** `PATCH /api/v1/subscriptions/:subscriptionId` with `credentials: 'include'`
  - **Request Body:**
  ```json
  {
    "cancelAtPeriodEnd": true
  }
  ```
  - **API Call (Cancel Immediately):** `DELETE /api/v1/subscriptions/:subscriptionId` with `credentials: 'include'`
- **Loading State:** Show spinner during cancellation

**Success:**

- Show success message: "Subscription will be cancelled at the end of billing period" or "Subscription cancelled"
- **API:** `GET /api/v1/subscriptions/status` to fetch updated status
- Update subscription status in UI
- Send confirmation email (handled by backend)
- **Error:** Display error message

**Styling:**

- Clear warning messages
- Easy to cancel or keep
- Confirmation required

---

#### Subscription History

**Section Title:** "Subscription History"

**History List:**

- **API Integration (Admin Only):**
  - **Endpoint:** `GET /api/v1/subscriptions?page=1&limit=10&status=ACTIVE&planType=MONTHLY`
  - **Authentication:** Required (ADMIN role only)
  - **Query Parameters:**
    - `status`: Filter by status (ACTIVE, PAST_DUE, CANCELLED, EXPIRED)
    - `planType`: Filter by plan type (MONTHLY, YEARLY)
    - `planName`: Filter by plan name
    - `page`, `limit`: Pagination
    - `sortBy`, `sortOrder`: Sorting
  - **Response:** Returns paginated list of subscriptions
- **Past Subscriptions:**
  - Plan type and name
  - Status (Active, Cancelled, Expired)
  - Dates (started, ended)
  - Payment history link
  - **View Details:** `GET /api/v1/subscriptions/:subscriptionId`

**Styling:**

- List layout
- Clear status indicators
- Chronological order

---

#### Empty State (No Subscription)

**Message:** "No active subscription. Subscribe to unlock premium features!"

**Button:** "View Plans" → Scrolls to plans section

**Styling:**

- Centered content
- Clear call to action

---

**Part 5 Complete!** ✅

এই পর্যন্ত সম্পন্ন হয়েছে:

- 5.12 Reviews (Tabs, Review list, Create/Edit form, Statistics)
- 5.13 Subscriptions (Current subscription, Plans, Stripe integration, Management)

---

### 5.14 Payments (`/dashboard/payments`)

#### Page Title

"Payment History"

**Description:** "View your payment transactions and billing history"

---

#### API Integration

**Get My Payments:**
- **Endpoint:** `GET /api/v1/payments/my-payments`
- **Authentication:** Required
- **Query Parameters:**
  - `status`: Filter by status - "SUCCEEDED", "PENDING", "REFUNDED", "FAILED" (optional)
  - `subscriptionId`: Filter by subscription ID (UUID, optional)
  - `currency`: Filter by currency code (optional)
  - `startDate`: Filter by start date (optional, YYYY-MM-DD)
  - `endDate`: Filter by end date (optional, YYYY-MM-DD)
  - `page`: Page number (optional, default: 1)
  - `limit`: Items per page (optional, default: 10)
  - `sortBy`: Sort field (optional)
  - `sortOrder`: "asc" or "desc" (optional)
- **Response:** Returns paginated list of user's payments

**Get Single Payment:**
- **Endpoint:** `GET /api/v1/payments/:paymentId`
- **Authentication:** Required
- **Response:** Returns payment details by ID

**Get Payment Summary:**
- **Endpoint:** `GET /api/v1/payments/summary?subscriptionId=:subscriptionId`
- **Authentication:** Required
- **Query Parameter:** `subscriptionId` (optional, UUID)
- **Response:** Returns payment summary statistics (total spent, this month, etc.)
- **Use Case:** Display summary cards

**Get All Payments (Admin):**
- **Endpoint:** `GET /api/v1/payments`
- **Authentication:** Required (ADMIN role only)
- **Query Parameters:**
  - `status`: Filter by status (SUCCEEDED, PENDING, REFUNDED, FAILED)
  - `userId`: Filter by user ID (UUID)
  - `subscriptionId`: Filter by subscription ID (UUID)
  - `currency`: Filter by currency code
  - `startDate`, `endDate`: Date range filter
  - `page`, `limit`: Pagination
  - `sortBy`, `sortOrder`: Sorting
- **Response:** Returns paginated list of all payments in system

**Get Payment Statistics (Admin):**
- **Endpoint:** `GET /api/v1/payments/statistics?startDate=2025-01-01&endDate=2025-12-31`
- **Authentication:** Required (ADMIN role only)
- **Query Parameters:**
  - `startDate`: Filter by start date (optional)
  - `endDate`: Filter by end date (optional)
  - `subscriptionId`: Filter by subscription ID (optional, UUID)
  - `currency`: Filter by currency code (optional)
- **Response:** Returns payment statistics (revenue, counts, etc.)

---

#### Payment Summary Cards

**Layout:** Summary cards at top (3 cards)

**Card 1: Total Spent**

- **Label:** "Total Spent"
- **Amount:** Total amount paid (formatted: $X,XXX.XX)
- **Icon:** Dollar icon
- **Color:** Blue
- **Period:** All time
- **API:** `GET /api/v1/payments/summary` → Use `totalSpent` from response

**Card 2: This Month**

- **Label:** "This Month"
- **Amount:** Amount paid this month
- **Icon:** Calendar icon
- **Color:** Green
- **Period:** Current month
- **API:** `GET /api/v1/payments/summary` → Use `thisMonth` from response

**Card 3: Active Subscriptions**

- **Label:** "Active Subscriptions"
- **Count:** Number of active subscriptions
- **Icon:** Credit Card icon
- **Color:** Purple
- **Link:** Links to subscriptions page
- **API:** `GET /api/v1/subscriptions/status` → Check if active subscription exists

**Styling:**

- Grid layout: 1 column (mobile), 3 columns (desktop)
- Card design with shadow
- Hover effects
- Clickable (optional: link to filtered view)

---

#### Payment List

**Filters:**

- **Status Filter:** All, Succeeded, Failed, Pending, Refunded
  - **API Parameter:** `status` (values: "SUCCEEDED", "PENDING", "REFUNDED", "FAILED", omit for "All")
- **Date Range:** Start date - End date picker
  - **API Parameters:** `startDate`, `endDate` (YYYY-MM-DD format)
- **Subscription Filter:** Filter by subscription (optional)
  - **API Parameter:** `subscriptionId` (UUID)
- **Currency Filter:** Filter by currency (optional)
  - **API Parameter:** `currency` (currency code)
- **Clear Filters Button:** "Clear All"

**Sort Options:**

- **Dropdown:** Date (newest first), Date (oldest first), Amount (high to low), Amount (low to high)
- **Default:** Date (newest first)
- **API Parameters:**
  - `sortBy`: Sort field (optional)
  - `sortOrder`: "asc" or "desc" (optional)
- **Pagination:**
  - **API Parameters:** `page`, `limit`
  - Use `meta.page`, `meta.limit`, `meta.total` from response

**View Options:**

- **List View:** Default
- **Grouped by Date:** Optional grouping (client-side)
- **API Call:** `GET /api/v1/payments/my-payments` with query parameters

---

#### Payment Card (Each Payment)

**Display:**

- **Transaction ID:**
  - Short ID: "TXN-XXXXXX"
  - Clickable to view full details
- **Amount and Currency:**
  - Large, prominent (e.g., "$99.99")
  - Currency code (USD, EUR, etc.)
- **Status Badge:**
  - **Succeeded:** Green badge with checkmark
  - **Failed:** Red badge with X icon
  - **Pending:** Yellow badge with clock icon
  - **Refunded:** Gray badge with arrow icon
- **Date and Time:**
  - Formatted date: "Dec 15, 2024"
  - Time: "2:30 PM"
  - Relative time: "2 days ago" (optional)
- **Description:**
  - "Monthly Subscription" or "Yearly Subscription"
  - Or custom description
- **Related Subscription:**
  - Link to subscription (if applicable)
  - Subscription plan name
- **Receipt:**
  - "Download Receipt" link (if available)
  - Opens receipt in new tab
- **Actions:**
  - View Details (eye icon) → Payment details modal
    - **API:** `GET /api/v1/payments/:paymentId` to fetch full payment details
  - Download Receipt (download icon) → Download receipt
    - **Note:** Receipt URL from payment object (if available from Stripe)

**Styling:**

- Card layout with padding
- Status badge prominently displayed
- Amount highlighted
- Hover effects
- Clear action buttons

---

#### Payment Details Modal

**Title:** "Payment Details"

**Information Display:**

- **Transaction ID:** Full transaction ID
- **Amount:** Amount with currency
- **Status:** Status badge with description
- **Date:** Full date and time
- **Description:** Payment description
- **Payment Method:**
  - "Credit Card ending in XXXX"
  - Card brand icon (Visa, Mastercard, etc.)
- **Related Subscription:**
  - Subscription details (if applicable)
  - Plan name, dates
- **Stripe Transaction Details:**
  - Stripe payment intent ID
  - Invoice ID (if applicable)
  - Receipt URL

**Actions:**

- **Download Receipt:** Download PDF receipt
- **Contact Support:** Link to support (if payment failed)
- **Close Button:** Close modal

**Styling:**

- Clear information layout
- Easy to read
- Prominent action buttons

---

#### Payment Statistics (Optional, Advanced)

**Section Title:** "Payment Statistics"

**Charts/Graphs:**

- **Spending Over Time:** Line chart showing monthly spending
- **Payment Status Distribution:** Pie chart (Succeeded, Failed, etc.)
- **Payment Methods:** Breakdown by payment method

**API Integration (Admin Only):**

- **Endpoint:** `GET /api/v1/payments/statistics?startDate=2025-01-01&endDate=2025-12-31`
- **Authentication:** Required (ADMIN role only)
- **Query Parameters:**
  - `startDate`: Filter by start date (optional)
  - `endDate`: Filter by end date (optional)
  - `subscriptionId`: Filter by subscription ID (optional)
  - `currency`: Filter by currency code (optional)
- **Response:** Returns payment statistics (revenue, counts, breakdowns)
- **Use Case:** Display charts and graphs for admin dashboard

**Styling:**

- Visual charts
- Clear labels
- Responsive design

---

#### Empty State

**Message:** "No payment history yet. Payments will appear here after you subscribe."

**Button:** "View Subscriptions" → Links to subscriptions page

**Styling:**

- Centered content
- Large icon
- Friendly message
- Clear call to action

---

### 5.15 Profile Settings (`/dashboard/profile`)

#### Page Title

"Profile Settings"

**Description:** "Manage your profile information and account settings"

---

#### API Integration

**Get Profile:**
- **Endpoint:** `GET /api/v1/users/me`
- **Authentication:** Required
- **Response:** Returns current user's profile data

**Update Profile:**
- **Endpoint:** `PATCH /api/v1/users/me`
- **Authentication:** Required
- **Request Body:** All fields optional
```json
{
  "fullName": "New Name",
  "bio": "A short bio about yourself.",
  "location": "Dhaka, Bangladesh",
  "interests": ["Travel", "Hiking"],
  "visitedCountries": ["BD", "IN"]
}
```

**Update Profile Photo:**
- **Endpoint:** `PATCH /api/v1/users/me/photo`
- **Authentication:** Required
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `photo`: File (image file)
- **Accepted Formats:** JPEG, PNG, WebP
- **Max Size:** 5MB

**Get My Travel Plans:**
- **Endpoint:** `GET /api/v1/users/me/travel-plans`
- **Authentication:** Required
- **Query Parameters:** `page`, `limit`, `sortBy`, `sortOrder`, `searchTerm`, `travelType`, `visibility` (optional)

**Get My Reviews:**
- **Endpoint:** `GET /api/v1/users/me/reviews`
- **Authentication:** Required
- **Query Parameters:** `page`, `limit`, `sortBy`, `sortOrder`, `rating`, `source`, `isEdited`, `searchTerm` (optional)

---

#### Tabs Navigation

**Two Tabs:**

1. **Profile Information Tab** (default)
   - Update profile details
   - Upload profile photo

2. **Change Password Tab**
   - Update password
   - Security settings

**Styling:**

- Tab navigation (horizontal)
- Active tab highlighted
- Clear tab labels

---

#### Profile Information Form

**Profile Photo Section:**

- **Current Photo Display:**
  - Large circular avatar
  - Current profile image or placeholder
  - "Change Photo" button overlay on hover
  - **API:** Fetch current photo from `GET /api/v1/users/me` response (`profileImage` field)
- **Upload New Photo:**
  - **Button:** "Upload New Photo" or "Change Photo"
  - **File Input:** Hidden file input
  - **Accept:** image/\* (JPEG, PNG, WebP)
  - **Max Size:** 5MB
  - **Preview:** Show preview after selection (client-side)
  - **Crop Tool:** Optional image cropper (client-side)
  - **Remove Photo Button:** "Remove Photo" (if photo exists)
    - **Note:** Backend doesn't have a remove photo endpoint. To remove, upload a new photo or leave as is.
- **Upload Progress:** Progress indicator during upload
- **API Call:** `PATCH /api/v1/users/me/photo` with `multipart/form-data`
  - **Form Data:** `photo` (file field)
  - **Content-Type:** `multipart/form-data` (set automatically by browser)
  - **Success:** Returns updated user object with new `profileImage` URL
  - **Error:** Display error message
- **Validation:**
  - File type validation (client-side): JPEG, PNG, WebP
  - File size validation (client-side): Max 5MB
  - Error: "Please upload a valid image file (max 5MB)"
  - Backend validation: File type and size checked on server

**Full Name** (optional):

- **Type:** text input
- **Label:** "Full Name"
- **Placeholder:** "Enter your full name"
- **Current Value:** Pre-filled with existing name
- **Validation:** Min 2 characters, max 100 characters
- **Error:** "Full name must be between 2 and 100 characters"

**Bio** (optional):

- **Type:** textarea
- **Label:** "Bio"
- **Placeholder:** "Tell us about yourself..."
- **Current Value:** Pre-filled with existing bio
- **Max Length:** 500 characters
- **Character Counter:** "X / 500 characters"
- **Rows:** 4-5
- **Help Text:** "Share a bit about yourself (optional)"

**Location** (optional):

- **Type:** text input
- **Label:** "Location"
- **Placeholder:** "Your location (e.g., New York, USA)"
- **Current Value:** Pre-filled with existing location
- **Max Length:** 120 characters
- **Validation:** Max 120 characters
- **Error:** "Location cannot exceed 120 characters"

**Interests** (optional):

- **Type:** Multi-select tags/chips
- **Label:** "Interests"
- **Options:**
  - Travel
  - Photography
  - Food
  - Adventure
  - Culture
  - Nature
  - Sports
  - Music
  - Art
  - Technology
  - (Allow custom interests)
- **Current Selection:** Pre-selected with existing interests
- **Add Custom:** Allow adding custom interest tags
- **Remove:** Click X to remove selected interest
- **Styling:** Tag/chip design, easy to add/remove

**Visited Countries** (optional):

- **Type:** Multi-select with country search
- **Label:** "Visited Countries"
- **Placeholder:** "Search and select countries..."
- **Searchable:** Searchable country list
- **Current Selection:** Pre-selected with existing countries
- **Display:** Selected countries as tags/chips
- **Remove:** Click X to remove country
- **Styling:** Tag/chip design, searchable dropdown

**Form Actions:**

- **Cancel Button:** Discard changes, reset form
- **Save Button:** "Update Profile"
- **Loading State:** Show spinner during submission
- **API Call:** `PATCH /api/v1/users/me` with `credentials: 'include'`
- **Success:** 
  - Show success toast: "Profile updated successfully"
  - Refresh profile data using `GET /api/v1/users/me`
  - Update UI with new data
- **Error:** Display error message from `errorMessages` array

**Styling:**

- Clean form layout
- Clear field labels
- Helpful placeholders
- Visual feedback for changes

---

#### Change Password Form

**Current Password** (required):

- **Type:** password
- **Label:** "Current Password \*"
- **Placeholder:** "Enter your current password"
- **Show/Hide Toggle:** Eye icon to toggle visibility
- **Validation:** Required
- **Error:** "Current password is required"
- **API Error:** "Current password is incorrect" (on submit)

**New Password** (required):

- **Type:** password
- **Label:** "New Password \*"
- **Placeholder:** "Enter your new password"
- **Show/Hide Toggle:** Eye icon
- **Password Strength Indicator:** Visual indicator (weak/medium/strong)
- **Validation Rules** (display as user types):
  - ✓ Minimum 8 characters
  - ✓ At least 1 uppercase letter
  - ✓ At least 1 number
  - ✓ At least 1 special character (!@#$%^&\*)
- **Error:** "Password must meet all requirements"
- **Help Text:** "Password must be at least 8 characters with uppercase, number, and special character"

**Confirm New Password** (required):

- **Type:** password
- **Label:** "Confirm New Password \*"
- **Placeholder:** "Confirm your new password"
- **Show/Hide Toggle:** Eye icon
- **Validation:** Must match new password
- **Error:** "Passwords do not match"
- **Real-time Validation:** Check match as user types

**Form Actions:**

- **Cancel Button:** Clear form, reset
- **Update Password Button:** "Change Password"
- **Loading State:** Show spinner during submission
- **API Call:** 
  - **Note:** Password change endpoint is not in the current API collection. This feature may need to be implemented in the backend or handled differently.
  - If endpoint exists: `PATCH /api/v1/users/me/password` or similar
  - **Request Body:** `{ currentPassword, newPassword }`
- **Success:**
  - Show success toast: "Password updated successfully"
  - Clear form
  - Logout user (optional, for security) - redirect to `/login`
- **Error:** Display error message from `errorMessages` array
  - "Current password is incorrect"
  - Password validation errors

**Security Note:**

- **Warning Message:** "After changing your password, you may need to log in again."
- **Styling:** Info banner, yellow/blue background

**Styling:**

- Clean form layout
- Password strength indicator clearly visible
- Clear validation feedback
- Security warning prominent

---

#### Account Information (Read-only)

**Section Title:** "Account Information"

**Display:**

- **Email:** User email (read-only, cannot be changed)
- **Account Created:** "Member since [date]"
- **Last Login:** "Last login: [date/time]"
- **Account Status:** "Status: Active" (with badge)
- **Verification Status:** "Email Verified" or "Email Not Verified" (with badge)

**Styling:**

- Read-only fields clearly marked
- Informational layout
- Status badges

---

#### Delete Account (Optional, Advanced)

**Section Title:** "Danger Zone"

**Delete Account:**

- **Warning:** "Once you delete your account, there is no going back. Please be certain."
- **Button:** "Delete My Account" (red, destructive)
- **Confirmation:**
  - Requires password confirmation
  - Type "DELETE" to confirm
  - Final confirmation modal

**Styling:**

- Red/warning colors
- Clear warnings
- Multiple confirmations required

---

#### Empty States

**No Profile Photo:**

- **Message:** "No profile photo. Upload one to personalize your profile!"
- **Button:** "Upload Photo"

**Styling:**

- Centered content
- Clear call to action

---

**Part 6 Complete!** ✅

এই পর্যন্ত সম্পন্ন হয়েছে:

- 5.14 Payments (Summary cards, Payment list, Payment details, Statistics)
- 5.15 Profile Settings (Profile form with 6 fields, Change password form with 3 fields, Account information)

---

### 5.16 Notifications (`/dashboard/notifications`)

#### Page Title

"Notifications"

**Description:** "Stay updated with all your activity and updates"

---

#### API Integration

**Get All Notifications:**
- **Endpoint:** `GET /api/v1/notifications`
- **Authentication:** Required
- **Query Parameters:**
  - `page`: Page number (optional, default: 1)
  - `limit`: Items per page (optional, default: 10)
  - `sortBy`: Sort field (optional, default: "createdAt")
  - `sortOrder`: "asc" or "desc" (optional, default: "desc")
  - `type`: NotificationType enum (optional, filter by type)
  - `isRead`: "true" or "false" (optional, filter by read status)
  - `searchTerm`: Search in title/message (optional)
- **Response Structure:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully.",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  },
  "data": [
    {
      "id": "notificationId",
      "userId": "userId",
      "type": "PLAN_UPDATED",
      "title": "Plan Updated",
      "message": "Plan 'Spring Trip' was updated",
      "isRead": false,
      "relatedId": "planId",
      "relatedType": "PLAN",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Get Unread Count:**
- **Endpoint:** `GET /api/v1/notifications/unread-count`
- **Authentication:** Required
- **Response:**
```json
{
  "success": true,
  "message": "Unread count retrieved successfully.",
  "data": {
    "count": 5
  }
}
```
- **Use Case:** Display badge count in sidebar/navbar

**Mark Notification as Read:**
- **Endpoint:** `PATCH /api/v1/notifications/:notificationId/read`
- **Authentication:** Required
- **Success:** Returns updated notification with `isRead: true`
- **Error:** "Notification not found"

**Mark All Notifications Read:**
- **Endpoint:** `PATCH /api/v1/notifications/read-all`
- **Authentication:** Required
- **No body or params needed**
- **Success:** Returns success message
- **Use Case:** Mark all notifications as read at once

---

#### Header Actions

**Actions Bar:**

- **Mark All as Read Button:** "Mark All as Read"
  - Only shown if there are unread notifications
  - **API:** `PATCH /api/v1/notifications/read-all` with `credentials: 'include'`
  - Confirmation: "Mark all notifications as read?" (optional)
  - Success: Refresh notification list and unread count
  - Error: Display error message
- **Filter Dropdown:**
  - **Options:** All, Unread, Read
  - **Default:** All
  - **API Parameter:** `isRead` (values: "true" or "false", omit for "All")
  - **Badge:** Count of unread notifications
  - **API:** `GET /api/v1/notifications/unread-count` to fetch count
- **Notification Type Filter:**
  - **Dropdown:** All Types, Plan Updates, Messages, Invitations, Meetups, Expenses, Subscriptions, Payments
  - **Default:** All Types
  - **API Parameter:** `type` (NotificationType enum value, omit for "All Types")

**Styling:**

- Sticky header (stays at top on scroll)
- Clear action buttons
- Filter dropdowns clearly visible

---

#### Notification List

**Layout:**

- **Chronological Order:** Newest first (default)
- **API Call:** `GET /api/v1/notifications?page=1&limit=10&sortBy=createdAt&sortOrder=desc` with `credentials: 'include'`
- **Query Parameters:**
  - `page`: Current page number
  - `limit`: Items per page (10, 20, 50, etc.)
  - `sortBy`: "createdAt" (default)
  - `sortOrder`: "desc" (default, newest first)
  - `type`: Filter by notification type (optional)
  - `isRead`: Filter by read status (optional, "true" or "false")
  - `searchTerm`: Search in title/message (optional)
- **Pagination:** 
  - Use `meta.page`, `meta.limit`, `meta.total` from response
  - Show page numbers or "Load More" button
  - Update `page` parameter for next page
- **Grouping:** Optional grouping by date (Today, Yesterday, This Week, Older) - client-side
- **Empty States:** Different messages for All/Unread/Read filters

**Notification Item** (Each Notification):

**Display:**

- **Icon:** Notification type icon (color-coded)
- **Title/Message:** Notification message text
- **Timestamp:**
  - Relative: "5 minutes ago", "2 hours ago", "3 days ago"
  - Absolute: "Dec 15, 2024 at 2:30 PM" (for older notifications)
- **Read/Unread Indicator:**
  - **Unread:** Blue dot or highlighted background
  - **Read:** Gray, no indicator
- **Related Item Link:**
  - Clickable notification (navigates to related item)
  - Hover effect
- **Actions:**
  - **Mark as Read** (if unread): Checkmark icon → Mark as read
    - **API:** `PATCH /api/v1/notifications/:notificationId/read` with `credentials: 'include'`
    - **Success:** Update notification in list (set `isRead: true`), update unread count
    - **Error:** Display error message
  - **Delete:** Trash icon → Delete notification (optional)
    - **Note:** Delete endpoint not available in current API. Can be implemented if needed.
  - **Action Button:** Context-specific action (e.g., "View Plan", "Reply")
    - Navigate to related item using `relatedId` and `relatedType` from notification

**Styling:**

- Card or list item layout
- Clear visual distinction between read/unread
- Icons for visual identification
- Hover effects
- Responsive layout

---

#### Notification Types (With Icons and Colors)

**Plan Updates:**

- **Icon:** Map/Plan icon
- **Color:** Blue
- **Types:**
  - PLAN_UPDATED: "Plan '[Plan Name]' was updated"
  - ITINERARY_ADDED: "New itinerary item added to '[Plan Name]'"
  - ITINERARY_UPDATED: "Itinerary updated in '[Plan Name]'"

**Messages:**

- **Icon:** Message icon
- **Color:** Green
- **Types:**
  - NEW_MESSAGE: "[Name] sent you a message in '[Plan Name]'"

**Members:**

- **Icon:** Users icon
- **Color:** Purple
- **Types:**
  - MEMBER_JOINED: "[Name] joined '[Plan Name]'"
  - MEMBER_LEFT: "[Name] left '[Plan Name]'"
  - INVITATION_RECEIVED: "You were invited to join '[Plan Name]'"
  - INVITATION_ACCEPTED: "[Name] accepted your invitation to '[Plan Name]'"

**Meetups:**

- **Icon:** Calendar icon
- **Color:** Orange
- **Types:**
  - MEETUP_CREATED: "New meetup created in '[Plan Name]'"
  - MEETUP_UPDATED: "Meetup updated in '[Plan Name]'"
  - MEETUP_RSVP_ACCEPTED: "[Name] accepted RSVP for meetup in '[Plan Name]'"

**Expenses:**

- **Icon:** Dollar icon
- **Color:** Teal
- **Types:**
  - EXPENSE_ADDED: "New expense added to '[Plan Name]'"
  - EXPENSE_UPDATED: "Expense updated in '[Plan Name]'"
  - EXPENSE_DELETED: "Expense deleted from '[Plan Name]'"

**Subscriptions:**

- **Icon:** Credit Card icon
- **Color:** Indigo
- **Types:**
  - SUBSCRIPTION_CREATED: "Your subscription has been activated"
  - SUBSCRIPTION_UPDATED: "Your subscription has been updated"
  - SUBSCRIPTION_CANCELLED: "Your subscription has been cancelled"
  - SUBSCRIPTION_EXPIRED: "Your subscription has expired"

**Payments:**

- **Icon:** Receipt icon
- **Color:** Green
- **Types:**
  - PAYMENT_SUCCEEDED: "Payment of $X.XX succeeded"
  - PAYMENT_FAILED: "Payment of $X.XX failed"

**AI Usage:**

- **Icon:** Sparkles/AI icon
- **Color:** Yellow
- **Types:**
  - AI_LIMIT_REACHED: "You've reached your AI plan limit. Upgrade for unlimited plans."

**Styling:**

- Color-coded icons
- Consistent icon sizes
- Clear type identification

---

#### Notification Actions

**Mark as Read:**

- **Action:** Click "Mark as Read" button or click notification
- **API Call:** `PATCH /api/v1/notifications/:notificationId/read` with `credentials: 'include'`
- **Success:** 
  - Update notification in list (set `isRead: true`)
  - Update unread count badge using `GET /api/v1/notifications/unread-count`
  - Remove unread indicator (blue dot)
- **Error:** Display error message

**Mark All as Read:**

- **Action:** Click "Mark All as Read" button
- **API Call:** `PATCH /api/v1/notifications/read-all` with `credentials: 'include'`
- **Confirmation:** Optional confirmation modal ("Mark all notifications as read?")
- **Success:** 
  - Refresh notification list (all should show `isRead: true`)
  - Update unread count badge (should be 0)
  - Show success toast: "All notifications marked as read"
- **Error:** Display error message

**Delete Notification:**

- **Action:** Click delete icon
- **Note:** Delete endpoint is not available in current API. This feature can be implemented if needed.
- **Alternative:** Mark as read to hide from unread list

**Navigate to Related Item:**

- **Action:** Click notification
- **Behavior:** Navigate to related page using `relatedId` and `relatedType` from notification
  - `relatedType: "PLAN"` → Navigate to `/dashboard/travel-plans/:relatedId`
  - `relatedType: "MEETUP"` → Navigate to meetup details
  - `relatedType: "EXPENSE"` → Navigate to expense details
  - `relatedType: "CHAT"` → Navigate to chat thread
- **Auto-mark as Read:** 
  - Optionally mark as read when clicked
  - **API:** `PATCH /api/v1/notifications/:notificationId/read`

**Styling:**

- Clear action buttons
- Smooth transitions
- Confirmation for destructive actions

---

#### Unread Badge

**Display Locations:**

- **Sidebar:** Notification menu item with red dot and count
- **Navbar:** Notification icon with badge
- **Page Title:** "Notifications (X)" if unread count > 0

**Badge Design:**

- **Red Dot:** Small red circle
- **Count:** Number of unread notifications
- **Animation:** Pulse animation for new notifications (optional)

**API Integration:**

- **Fetch Count:** `GET /api/v1/notifications/unread-count` with `credentials: 'include'`
- **Response:** `{ success: true, data: { count: 5 } }`
- **Update Frequency:**
  - On page load
  - After marking notification as read
  - After marking all as read
  - Polling: Every 30-60 seconds (optional)
  - WebSocket: Real-time updates (if implemented)

**Real-time Updates:**

- Update badge count when new notifications arrive
- Update when notifications are marked as read
- WebSocket or polling for real-time updates
- **Implementation:** 
  - Polling: Set interval to fetch unread count
  - WebSocket: Subscribe to notification events (if available)

**Styling:**

- Prominent but not intrusive
- Clear count display
- Smooth animations

---

#### Empty States

**No Notifications:**

- **Message:** "You're all caught up! No new notifications."
- **Icon:** Checkmark or bell icon
- **No Action Button**

**No Unread Notifications:**

- **Message:** "All notifications read. You're up to date!"
- **Icon:** Checkmark icon
- **No Action Button**

**No Notifications (Filtered):**

- **Message:** "No notifications match your filters. Try adjusting your filters."
- **Button:** "Clear Filters"

**Styling:**

- Centered content
- Friendly message
- Clear icon

---

### 6. Additional Pages & Features

#### 6.1 Trip Members Management (`/dashboard/travel-plans/:id/members`)

#### Page Title

"Members - [Plan Name]"

**Breadcrumb:** Dashboard > Travel Plans > [Plan Name] > Members

---

#### API Integration

**Get Members of a Plan:**
- **Endpoint:** `GET /api/v1/trip-members/:planId`
- **Authentication:** Required
- **Response Structure:**
```json
{
  "success": true,
  "message": "Members retrieved successfully.",
  "data": [
    {
      "id": "tripMemberId",
      "planId": "planId",
      "userId": "userId",
      "role": "OWNER",
      "status": "JOINED",
      "addedBy": "userId",
      "joinedAt": "2025-01-01T00:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "user": {
        "id": "userId",
        "fullName": "User Name",
        "email": "user@example.com",
        "profileImage": "url"
      }
    }
  ]
}
```

**Add Member to Plan:**
- **Endpoint:** `POST /api/v1/trip-members/:planId/add`
- **Authentication:** Required (plan manager/admin only)
- **Request Body:**
```json
{
  "email": "member@example.com",
  "role": "VIEWER"
}
```
- **Validation Notes:**
  - `email`: Required, valid email format
  - `role`: Required, must be one of: OWNER, ADMIN, EDITOR, VIEWER
  - OWNER role cannot be assigned (automatically assigned when creating plan)
  - Typically use VIEWER or EDITOR for regular members
- **Success Response:** Returns created TripMember object
- **Error Messages:**
  - "User not found" (if email doesn't exist)
  - "User is already a member of this plan"
  - "Invalid role. Must be OWNER, ADMIN, EDITOR, or VIEWER."

**Update Member Role:**
- **Endpoint:** `PATCH /api/v1/trip-members/:planId/update-role`
- **Authentication:** Required (plan manager/admin only)
- **Request Body:**
```json
{
  "userId": "userId",
  "role": "ADMIN"
}
```
- **Validation Notes:**
  - `userId`: Required, must be a member of the plan
  - `role`: Required, must be one of: OWNER, ADMIN, EDITOR, VIEWER
  - Cannot change OWNER role
  - planId is in URL path, userId is in body
- **Success Response:** Returns updated TripMember object
- **Error Messages:**
  - "Trip member not found" (if userId is not a member)
  - "Invalid role. Must be OWNER, ADMIN, EDITOR, or VIEWER."

**Remove Member from Plan:**
- **Endpoint:** `DELETE /api/v1/trip-members/:memberId`
- **Authentication:** Required (plan manager/admin only)
- **Important:** Uses `memberId` (TripMember ID), NOT `userId`
- **Success Response:** Returns success message
- **Error Messages:**
  - "Trip member not found"
  - "Cannot remove the plan owner"

---

#### Member List

**Section Title:** "Plan Members"

**Member Card** (Each Member):

**Display:**

- **Avatar:** User profile photo or placeholder
- **Full Name:** User's full name (bold)
- **Email:** User email address
- **Role Badge:**
  - **OWNER:** "Owner" (purple badge)
  - **ADMIN:** "Admin" (blue badge)
  - **EDITOR:** "Editor" (green badge)
  - **VIEWER:** "Viewer" (gray badge)
- **Status Badge:**
  - **JOINED:** "Joined" (green badge)
  - **PENDING:** "Pending" (yellow badge)
  - **REJECTED:** "Rejected" (red badge)
- **Joined Date:** "Joined on [date]" or "Invited on [date]"
- **Actions** (if user is owner/admin):
  - **Update Role Dropdown:**
    - Select new role (ADMIN, EDITOR, VIEWER)
    - Cannot change OWNER role
    - Confirmation: "Change [Name]'s role to [Role]?"
    - **API Call:** `PATCH /api/v1/trip-members/:planId/update-role`
    - **Request Body:** `{ "userId": "userId", "role": "ADMIN" }`
    - **Success:** Show toast, refresh member list
    - **Error:** Display error from `errorMessages` array
  - **Remove Member Button:**
    - Trash icon
    - Confirmation: "Remove [Name] from this plan?"
    - Warning: "This action cannot be undone"
    - **API Call:** `DELETE /api/v1/trip-members/:memberId`
    - **Important:** Use `memberId` (TripMember ID) from the member object, NOT `userId`
    - **Success:** Show toast, refresh member list
    - **Error:** Display error message

**Styling:**

- Card layout with padding
- Role badge prominently displayed
- Status badge clearly visible
- Action buttons in dropdown menu (mobile)
- Hover effects

---

#### Invite Member Section

**Section Title:** "Invite New Member"

**Invite Form:**

**Email** (required):

- **Type:** email input
- **Label:** "Email Address \*"
- **Placeholder:** "Enter email address"
- **Validation:** Required, valid email format
- **Error:** "Please enter a valid email address"
- **Duplicate Check:** "This user is already a member" (on blur or submit)
- **Backend Validation:** Email must exist in system (user must be registered)

**Role** (required):

- **Type:** select dropdown
- **Label:** "Role \*"
- **Options:**
  - **ADMIN:** "Admin - Can manage members and edit plan"
  - **EDITOR:** "Editor - Can edit plan and add content"
  - **VIEWER:** "Viewer - Can only view plan"
- **Default:** VIEWER
- **Validation:** Required, must be one of: OWNER, ADMIN, EDITOR, VIEWER
- **Error:** "Invalid role. Must be OWNER, ADMIN, EDITOR, or VIEWER."
- **Help Text:** Descriptions for each role
- **Note:** OWNER role cannot be assigned (automatically assigned when creating plan)

**Invite Button:**

- **Text:** "Add Member" or "Send Invitation"
- **Loading State:** Show spinner during submission
- **API Call:** `POST /api/v1/trip-members/:planId/add` with `credentials: 'include'`
- **Request Body:**
```json
{
  "email": "member@example.com",
  "role": "VIEWER"
}
```
- **Success:**
  - Show success toast: "Member added successfully" or "Invitation sent to [email]"
  - Clear form
  - Refresh member list using `GET /api/v1/trip-members/:planId`
- **Error:** Display error message from `errorMessages` array
  - "User not found" (if email doesn't exist in system)
  - "User is already a member of this plan"
  - "Invalid role. Must be OWNER, ADMIN, EDITOR, or VIEWER."

**Styling:**

- Clean form layout
- Clear role descriptions
- Success/error feedback

---

#### Pending Invitations

**Section Title:** "Pending Invitations"

**Invitation List:**

**Invitation Card** (Each Invitation):

- **Email:** Invited user's email
- **Role:** Invited role badge
- **Sent Date:** "Invited on [date]"
- **Status:** PENDING, ACCEPTED, DECLINED, CANCELLED
- **Actions:**
  - **Resend Invitation:** "Resend" button
  - **Cancel Invitation:** "Cancel" button (if pending)
  - **Delete:** Remove from list (if cancelled/declined)

**Styling:**

- List layout
- Status badges
- Clear action buttons

---

#### Role Descriptions

**OWNER:**

- "Full control over the plan. Can delete plan and manage all members."

**ADMIN:**

- "Can manage members, edit plan, and perform most actions except deleting the plan."

**EDITOR:**

- "Can edit plan content, add items, but cannot manage members."

**VIEWER:**

- "Can only view plan content. Cannot make any changes."

**Styling:**

- Tooltip or help text
- Clear descriptions
- Easy to understand

---

#### Empty States

**No Members (except owner):**

- **Message:** "No members yet. Invite friends to collaborate!"
- **Button:** "Invite First Member"

**No Pending Invitations:**

- **Message:** "No pending invitations"
- **No Action Button**

**Styling:**

- Centered content
- Friendly message
- Clear call to action

---

**Part 7 Complete!** ✅

এই পর্যন্ত সম্পন্ন হয়েছে:

- 5.16 Notifications (Header actions, Notification list, All 20+ notification types, Unread badge)
- 6.1 Trip Members Management (Member list, Invite form, Pending invitations, Role management)

---

## 7. Form Validation & Error Handling

### 7.1 Validation Rules (Based on Backend Zod Schemas)

**All Required Fields:**

- Marked with asterisk (\*) in label
- Real-time validation on blur (after user leaves field)
- Form submission blocked if validation fails
- Error messages displayed below fields

**Common Validation Patterns:**

**Email Validation:**

- **Pattern:** Valid email format (RFC 5322)
- **Error Messages:**
  - "Email is required"
  - "Please enter a valid email address"
  - "This email is already registered" (for registration)

**Password Validation:**

- **Rules:**
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&\*)
- **Error Messages:**
  - "Password is required"
  - "Password must be at least 8 characters long"
  - "Password must contain at least 1 uppercase letter"
  - "Password must contain at least 1 number"
  - "Password must contain at least 1 special character"
- **Password Strength Indicator:**
  - Weak (red): Less than 3 requirements met
  - Medium (yellow): 3 requirements met
  - Strong (green): All requirements met

**Text Field Validation:**

- **Min Length:** "Must be at least X characters"
- **Max Length:** "Cannot exceed X characters"
- **Required:** "[Field] is required"
- **Character Counter:** Display "X / Y characters" for limited fields

**Number Validation:**

- **Positive Numbers:** "Must be a positive number"
- **Min Value:** "Must be at least X"
- **Max Value:** "Cannot exceed X"
- **Range:** "Must be between X and Y"

**Date Validation:**

- **Future Date:** "Date must be in the future"
- **Past Date:** "Date cannot be in the past"
- **Date Range:** "End date must be after start date"
- **Within Range:** "Date must be within the travel plan dates"

**File Upload Validation:**

- **File Type:** "Please upload a valid image file (JPEG, PNG, WebP)"
- **File Size:** "File size must be less than 5MB"
- **Max Files:** "Maximum 10 files allowed"

**Select/Dropdown Validation:**

- **Required:** "Please select a [option]"
- **Invalid Option:** "Please select a valid option"

---

### 7.2 Error Messages

**Display Location:**

- **Inline Errors:** Below each form field (red text)
- **Form-Level Errors:** At top of form (error banner)
- **Toast Notifications:** For API errors (top-right corner)

**Error Message Format:**

- **Clear and Specific:** "Password must be at least 8 characters" (not "Invalid input")
- **Actionable:** Tell user what to do to fix the error
- **Consistent:** Use same wording across similar fields

**Error Message Examples:**

**Registration Errors:**

- "Email is required"
- "Please enter a valid email address"
- "This email is already registered"
- "Password must meet all requirements"
- "Passwords do not match"
- "You must agree to the terms to continue"

**Login Errors:**

- "Email is required"
- "Please enter a valid email address"
- "Password is required"
- "Invalid email or password"
- "Account suspended. Please contact support."
- "Too many login attempts. Please try again later."

**Form Submission Errors:**

- "Please fill in all required fields"
- "Please fix the errors above"
- "Connection error. Please try again."
- "Server error. Please try again later."

---

### 7.3 API Error Handling

**HTTP Status Code Handling:**

**401 Unauthorized:**

- **Message:** "Your session has expired. Please log in again."
- **Action:** Redirect to login page
- **Clear:** Clear local storage/cookies

**403 Forbidden:**

- **Message:** "You don't have permission to perform this action."
- **Action:** Show error, stay on page

**404 Not Found:**

- **Message:** "Resource not found."
- **Action:** Show error, navigate back or to home

**400 Bad Request:**

- **Message:** Display API error message
- **Action:** Show error, allow user to fix and retry

**500 Internal Server Error:**

- **Message:** "Server error. Please try again later."
- **Action:** Show error, allow retry

**Network Errors:**

- **Message:** "Connection error. Please check your internet connection and try again."
- **Action:** Show retry button

**Error Display:**

- **Toast Notification:** For non-critical errors
- **Modal:** For critical errors requiring user action
- **Inline:** For form validation errors

**Error Recovery:**

- **Retry Button:** Allow user to retry failed requests
- **Auto-retry:** For network errors (optional, with exponential backoff)
- **Save Draft:** For long forms, save progress on error

---

### 7.4 Success Messages

**Display:**

- **Toast Notifications:** Top-right corner (auto-dismiss after 3-5 seconds)
- **Inline Success:** Green checkmark or success text
- **Success Page:** For major actions (e.g., after registration)

**Success Message Examples:**

- "Account created successfully!"
- "Travel plan created successfully!"
- "Profile updated successfully!"
- "Password changed successfully!"
- "Invitation sent successfully!"
- "Expense added successfully!"
- "Review submitted successfully!"

**Undo Actions:**

- **Delete Operations:** Show "Undo" button for 5-10 seconds
- **Example:** "Plan deleted" with "Undo" button

**Styling:**

- Green color for success
- Clear, concise messages
- Non-intrusive display

---

## 8. Loading States & Empty States

### 8.1 Loading States

**Button Loading States:**

- **Spinner:** Show spinner icon inside button
- **Disabled State:** Disable button during loading
- **Text Change:** "Saving..." or "Loading..." (optional)
- **Styling:** Gray out button, show spinner

**Form Loading States:**

- **Submit Button:** Show spinner, disable all form fields
- **Loading Overlay:** Optional overlay on form during submission
- **Progress Indicator:** For file uploads (progress bar)

**Page Loading States:**

- **Skeleton Loaders:**
  - For lists: Skeleton cards with shimmer effect
  - For forms: Skeleton form fields
  - For images: Blur placeholder
- **Spinner:** Centered spinner for initial page load
- **Progress Bar:** Top progress bar for page transitions

**Data Loading States:**

- **Infinite Scroll:** Show "Loading more..." at bottom
- **Pagination:** Show spinner on page change
- **Refresh:** Show spinner on pull-to-refresh

**Styling:**

- Smooth animations
- Clear loading indicators
- Non-blocking (user can still see content)

---

### 8.2 Empty States

**Empty State Components:**

**No Data Empty States:**

**No Travel Plans:**

- **Icon:** Map or suitcase icon
- **Title:** "No travel plans yet"
- **Message:** "Start planning your next adventure!"
- **Button:** "Create Your First Plan"

**No Expenses:**

- **Icon:** Dollar icon
- **Title:** "No expenses added yet"
- **Message:** "Start tracking your trip expenses!"
- **Button:** "Add First Expense"

**No Meetups:**

- **Icon:** Calendar icon
- **Title:** "No meetups scheduled yet"
- **Message:** "Create your first meetup!"
- **Button:** "Create First Meetup"

**No Media:**

- **Icon:** Image icon
- **Title:** "No media uploaded yet"
- **Message:** "Start sharing your trip memories!"
- **Button:** "Upload First Photo"

**No Messages:**

- **Icon:** Message icon
- **Title:** "No messages yet"
- **Message:** "Start the conversation!"
- **Placeholder:** "Type a message to get started..."

**No Reviews:**

- **Icon:** Star icon
- **Title:** "No reviews yet"
- **Message:** "Keep traveling and reviews will appear here!"
- **Button:** "Write Your First Review" (for given reviews)

**No Notifications:**

- **Icon:** Bell or checkmark icon
- **Title:** "You're all caught up!"
- **Message:** "No new notifications"
- **No Button**

**No Search Results:**

- **Icon:** Search icon
- **Title:** "No results found"
- **Message:** "Try adjusting your search or filters"
- **Button:** "Clear Filters"

**Styling:**

- Centered content
- Large, friendly icons
- Clear, encouraging messages
- Prominent call-to-action buttons
- Generous spacing

---

### 8.3 Error States

**Error State Components:**

**404 Not Found:**

- **Icon:** 404 or broken link icon
- **Title:** "Page Not Found"
- **Message:** "The page you're looking for doesn't exist."
- **Button:** "Go to Home" or "Go Back"

**500 Server Error:**

- **Icon:** Server or warning icon
- **Title:** "Something went wrong"
- **Message:** "We're having trouble loading this page. Please try again."
- **Button:** "Retry" or "Go to Home"

**Network Error:**

- **Icon:** WiFi or connection icon
- **Title:** "Connection Error"
- **Message:** "Please check your internet connection and try again."
- **Button:** "Retry"

**Permission Denied:**

- **Icon:** Lock icon
- **Title:** "Access Denied"
- **Message:** "You don't have permission to view this content."
- **Button:** "Go Back" or "Contact Support"

**Styling:**

- Clear error messaging
- Helpful action buttons
- Professional appearance

---

**Part 8 Complete!** ✅

এই পর্যন্ত সম্পন্ন হয়েছে:

- 7. Form Validation & Error Handling (Validation rules, Error messages, API error handling, Success messages)
- 8. Loading States & Empty States (Loading states, Empty states, Error states)

---

## 9. Responsive Design Guidelines

### 9.1 Breakpoints

**Mobile:**

- **Range:** < 640px
- **Layout:** Single column, stacked elements
- **Navigation:** Hamburger menu, collapsible sidebar
- **Forms:** Full-width inputs
- **Cards:** Full-width cards
- **Tables:** Convert to cards or scrollable

**Tablet:**

- **Range:** 640px - 1024px
- **Layout:** 2 columns for grids, side-by-side forms
- **Navigation:** Collapsible sidebar or top navigation
- **Cards:** 2 columns grid
- **Tables:** Horizontal scroll or card view

**Desktop:**

- **Range:** > 1024px
- **Layout:** Multi-column grids, side-by-side layouts
- **Navigation:** Full sidebar, top navigation
- **Cards:** 3-4 columns grid
- **Tables:** Full table layout

**Large Desktop:**

- **Range:** > 1280px
- **Layout:** Max-width container (e.g., 1280px), centered
- **Spacing:** Increased padding and margins

---

### 9.2 Mobile Adaptations

**Navigation:**

- **Navbar:** Hamburger menu icon, collapsible menu
- **Sidebar:** Slide-out drawer, overlay on mobile
- **User Menu:** Dropdown or bottom sheet

**Forms:**

- **Full-width Inputs:** All form fields take full width
- **Stacked Layout:** Labels above inputs
- **Date Pickers:** Native mobile date pickers
- **File Upload:** Large touch targets

**Tables:**

- **Card View:** Convert tables to cards
- **Horizontal Scroll:** Allow horizontal scrolling
- **Responsive Table:** Hide less important columns

**Modals:**

- **Full Screen:** Modals take full screen on mobile
- **Bottom Sheet:** Use bottom sheet for actions
- **Swipe to Dismiss:** Allow swipe to close

**Cards:**

- **Single Column:** Stack cards vertically
- **Touch Targets:** Minimum 44x44px for buttons
- **Spacing:** Adequate spacing between cards

**Images:**

- **Responsive Images:** Use srcset for different sizes
- **Lazy Loading:** Load images as user scrolls
- **Aspect Ratio:** Maintain aspect ratios

---

### 9.3 Touch Targets

**Minimum Size:**

- **Buttons:** 44x44px minimum
- **Links:** Adequate padding for touch
- **Icons:** 24x24px minimum with padding
- **Checkboxes/Radio:** Larger touch area

**Spacing:**

- **Between Elements:** Minimum 8px spacing
- **Between Buttons:** 12-16px spacing
- **Form Fields:** 16-24px spacing

**Styling:**

- Clear visual feedback on touch
- No hover-only interactions
- Large, easy-to-tap buttons

---

### 9.4 Responsive Components

**Grid Layouts:**

- **Mobile:** 1 column
- **Tablet:** 2 columns
- **Desktop:** 3-4 columns
- **Use:** CSS Grid or Flexbox with media queries

**Navigation:**

- **Mobile:** Hamburger menu, bottom navigation (optional)
- **Tablet:** Collapsible sidebar or top nav
- **Desktop:** Full sidebar + top nav

**Forms:**

- **Mobile:** Stacked, full-width
- **Desktop:** Side-by-side where appropriate
- **Multi-step:** Vertical steps on mobile, horizontal on desktop

**Tables:**

- **Mobile:** Card view or horizontal scroll
- **Desktop:** Full table with all columns

**Modals:**

- **Mobile:** Full screen or bottom sheet
- **Desktop:** Centered modal with max-width

---

### 9.5 Performance Considerations

**Image Optimization:**

- **Responsive Images:** Use srcset and sizes
- **Lazy Loading:** Load images on scroll
- **Format:** Use WebP with JPEG/PNG fallback
- **Compression:** Optimize image sizes

**Code Splitting:**

- **Route-based:** Split code by routes
- **Component-based:** Lazy load heavy components
- **Dynamic Imports:** Load features on demand

**Bundle Size:**

- **Tree Shaking:** Remove unused code
- **Minification:** Minify production builds
- **Compression:** Gzip/Brotli compression

**Caching:**

- **Static Assets:** Long-term caching
- **API Responses:** Cache where appropriate
- **Service Worker:** Offline support (optional)

---

## 10. Implementation Order

### 10.1 Phase 1 - Foundation (Week 1)

**Priority: Critical**

1. **Project Setup**
   - Initialize React/Next.js project
   - Install dependencies (TypeScript, Tailwind CSS, etc.)
   - Set up project structure
   - Configure routing
   - Set up API client (Axios/Fetch)

2. **Authentication Pages**
   - Login page
   - Register page
   - Form validation
   - API integration
   - Error handling

3. **Layout Components**
   - Navbar (public and private)
   - Footer
   - Sidebar (dashboard)
   - Responsive navigation

4. **Homepage**
   - Hero section
   - Features section
   - How it works section
   - Testimonials/Stats section
   - Footer

**Deliverables:**

- Working authentication flow
- Basic layout structure
- Homepage complete

---

### 10.2 Phase 2 - Public Pages (Week 2)

**Priority: High**

1. **All Plans Page**
   - Plan cards grid
   - Filters and search
   - Pagination
   - Empty states

2. **Plan Details Page (Public View)**
   - Plan header
   - Itinerary preview
   - Media gallery preview
   - Reviews section
   - Login prompts for private actions

3. **About Us Page**
   - Mission section
   - Story section
   - Values section
   - Team section (optional)

4. **Contact Us Page**
   - Contact form
   - Contact information
   - Form validation and submission

**Deliverables:**

- All public pages complete
- Public plan viewing functional

---

### 10.3 Phase 3 - Dashboard Core (Week 3)

**Priority: Critical**

1. **Dashboard Layout**
   - Sidebar navigation
   - Main content area
   - Responsive layout
   - Mobile menu

2. **Dashboard Overview**
   - Quick stats cards
   - Recent activity
   - Upcoming meetups
   - Recent notifications

3. **My Travel Plans**
   - Travel plans list/grid
   - Filters and search
   - Create, edit, delete actions
   - Empty states

4. **Create Travel Plan**
   - Complete form with all 11 fields
   - Form validation
   - File upload
   - API integration

**Deliverables:**

- Dashboard structure complete
- Travel plan CRUD operations functional

---

### 10.4 Phase 4 - Travel Plan Features (Week 4)

**Priority: High**

1. **Travel Plan Details**
   - 8 tabs navigation
   - Overview tab
   - Itinerary tab
   - Members tab
   - Other tabs (expenses, meetups, media, chat, reviews)

2. **Itinerary Management**
   - Day-by-day view
   - Add/edit item form
   - Drag & drop reordering
   - Bulk actions

3. **Trip Members Management**
   - Member list
   - Invite member form
   - Role management
   - Pending invitations

4. **Media Gallery**
   - Upload section
   - Gallery view
   - Lightbox
   - Delete functionality

**Deliverables:**

- Complete travel plan management
- Itinerary and members functional

---

### 10.5 Phase 5 - Collaboration Features (Week 5)

**Priority: High**

1. **Chat Interface**
   - Chat layout
   - Message list
   - Message input
   - Real-time updates (if implemented)
   - Edit/delete messages

2. **Notifications**
   - Notification list
   - Mark as read functionality
   - Filters
   - Unread badge
   - Real-time updates (if implemented)

3. **Meetups**
   - Meetup list
   - Create meetup form
   - RSVP functionality
   - Status updates

4. **Expenses**
   - Expense list
   - Create expense form
   - Settlement view
   - Summary cards

**Deliverables:**

- Collaboration features functional
- Real-time features (if implemented)

---

### 10.6 Phase 6 - Advanced Features (Week 6)

**Priority: Medium**

1. **AI Planner**
   - 4-step wizard
   - Form fields for each step
   - AI response display
   - Usage limit indicators
   - Create plan from AI response

2. **Reviews**
   - Review list (given/received)
   - Create review form
   - Edit/delete reviews
   - Review statistics

3. **Subscriptions**
   - Current subscription card
   - Plan selection
   - Stripe checkout integration
   - Subscription management
   - Cancellation flow

4. **Payments**
   - Payment history
   - Payment details
   - Summary cards
   - Statistics (optional)

**Deliverables:**

- Advanced features complete
- Payment integration functional

---

### 10.7 Phase 7 - Polish & Testing (Week 7)

**Priority: High**

1. **Responsive Design Refinement**
   - Test on all breakpoints
   - Fix mobile issues
   - Optimize tablet layout
   - Touch target improvements

2. **Error Handling Improvements**
   - Comprehensive error messages
   - Error recovery flows
   - User-friendly error states

3. **Loading States**
   - Skeleton loaders
   - Button loading states
   - Page loading indicators
   - Progress bars

4. **Empty States**
   - All empty states implemented
   - Friendly messages
   - Clear call-to-action buttons

5. **Testing & Bug Fixes**
   - Cross-browser testing
   - Mobile device testing
   - Bug fixes
   - Performance optimization

6. **Final Polish**
   - UI/UX refinements
   - Animation improvements
   - Accessibility checks
   - Code cleanup

**Deliverables:**

- Production-ready application
- All features tested and polished

---

### 10.8 Dependencies & Priorities

**Critical Path:**

1. Authentication → Dashboard → Travel Plans → Core Features
2. Must complete in order for basic functionality

**Parallel Development:**

- Public pages can be developed alongside dashboard
- Some features can be developed in parallel (e.g., Expenses and Meetups)

**Nice to Have (Can be added later):**

- Advanced statistics and charts
- Calendar view for meetups
- Advanced search filters
- Export functionality
- Offline support

---

### 10.9 Testing Strategy

**Unit Testing:**

- Form validation functions
- Utility functions
- Component logic

**Integration Testing:**

- API integration
- Form submissions
- Navigation flows

**E2E Testing:**

- Critical user flows
- Authentication flow
- Travel plan creation
- Payment flow

**Manual Testing:**

- Cross-browser testing
- Mobile device testing
- Accessibility testing
- Performance testing

---

### 10.10 Deployment Checklist

**Pre-Deployment:**

- [ ] All features implemented and tested
- [ ] Error handling comprehensive
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Responsive design verified
- [ ] Performance optimized
- [ ] Accessibility checked
- [ ] SEO optimized (if applicable)
- [ ] Analytics integrated (if applicable)

**Environment Variables:**

- API base URL
- Stripe publishable key
- Cloudinary configuration
- Other service keys

**Build & Deploy:**

- Production build
- Environment configuration
- Deploy to hosting platform
- Domain configuration
- SSL certificate

---

**Part 9 Complete!** ✅

এই পর্যন্ত সম্পন্ন হয়েছে:

- 9. Responsive Design Guidelines (Breakpoints, Mobile adaptations, Touch targets, Performance)
- 10. Implementation Order (7-phase implementation plan with weekly breakdown, Dependencies, Testing, Deployment)

---

## 🎉 Frontend Roadmap Complete!

**সম্পূর্ণ Frontend_Roadmap.md ফাইল তৈরি সম্পন্ন!**

এই roadmap-এ রয়েছে:

- ✅ সম্পূর্ণ project overview এবং tech stack
- ✅ সব public routes (Homepage, All Plans, Plan Details, About, Contact) - সম্পূর্ণ content সহ
- ✅ Authentication pages (Login, Register) - সব form fields এবং validation
- ✅ Dashboard structure - 16টি page (Overview, Travel Plans, Itinerary, AI Planner, Expenses, Meetups, Media, Chat, Reviews, Subscriptions, Payments, Profile, Notifications, Members)
- ✅ সব form fields - types, labels, placeholders, validation rules, error messages
- ✅ Form Validation & Error Handling - complete guidelines
- ✅ Loading States & Empty States - সব scenarios
- ✅ Responsive Design Guidelines
- ✅ Implementation Order - 7-phase plan

**এই roadmap অনুসরণ করে আপনি সম্পূর্ণ frontend application তৈরি করতে পারবেন!** 🚀
