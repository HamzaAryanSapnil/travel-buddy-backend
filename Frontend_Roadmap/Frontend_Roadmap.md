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

#### Filters Section

**Search Bar:**

- **Placeholder:** "Search plans by destination, title..."
- **Icon:** Search icon
- **Functionality:** Real-time search as user types

**Filter Dropdowns:**

- **Travel Type:** All, Solo, Couple, Family, Friends, Group
- **Visibility:** All, Public (Private only shown if user is logged in)
- **Sort By:** Newest, Oldest, Budget (Low to High), Budget (High to Low)

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

**Itinerary Preview:**

- **Section Title:** "Itinerary Preview"
- **Content:** First 3-5 itinerary items only
- **Display:** Day numbers, titles, times (if available)
- **Button:** "View Full Itinerary" (requires login, redirects to login if not authenticated)

**Media Gallery Preview:**

- **Section Title:** "Trip Photos"
- **Content:** First 6-9 images in grid
- **Layout:** 3-column grid
- **Button:** "View All Photos" (requires login)

**Reviews Section:**

- **Average Rating:** Star display (e.g., 4.5/5)
- **Review Count:** "Based on X reviews"
- **Recent Reviews:** Display 2-3 most recent reviews
- **Link:** "View All Reviews" → Full reviews page

---

#### Private Sections (Visible Only When Logged In)

**Action Buttons** (if user is NOT a member):

- **"Join This Plan" Button:**
  - Opens invitation modal or redirects to join flow
  - Primary button style

**Full Access** (if user IS a member):

- **"Open in Dashboard" Button:**
  - Links to: `/dashboard/travel-plans/:id`
  - Primary button style
- **Full Itinerary Access:** Complete itinerary view
- **Full Media Gallery:** All photos with lightbox
- **Chat Access:** Link to chat interface
- **Expense Tracking:** Link to expenses page
- **Meetup Details:** Link to meetups page

---

#### Login Prompt (For Private Actions When Not Logged In)

**Modal/Toast Message:**

- **Title:** "Login Required"
- **Message:** "Please log in to join this plan and access all features"
- **Buttons:**
  - "Login" → `/login`
  - "Register" → `/register`
  - "Cancel" (closes modal)

**Styling:**

- Modal overlay
- Centered modal content
- Clear call-to-action buttons

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

#### Login Form

**Title:** "Welcome Back"

**Subtitle:** "Sign in to your account"

**Form Fields:**

**Email** (required):

- **Type:** email
- **Label:** "Email Address"
- **Placeholder:** "Enter your email"
- **Validation:** Required, valid email format
- **Error:** "Please enter a valid email address"

**Password** (required):

- **Type:** password
- **Label:** "Password"
- **Placeholder:** "Enter your password"
- **Show/Hide Toggle:** Eye icon to toggle visibility
- **Validation:** Required
- **Error:** "Password is required"

**Remember Me** (optional):

- **Type:** checkbox
- **Label:** "Remember me for 30 days"
- **Default:** Unchecked

**Forgot Password Link:**

- **Text:** "Forgot your password?"
- **Link:** `/forgot-password` (if implemented)
- **Position:** Below password field

**Submit Button:**

- **Text:** "Sign In"
- **Loading State:** Show spinner, disable button during submission
- **Success:** Redirect to `/dashboard` or previous page
- **Error:** Display error message below form

**Register Link:**

- **Text:** "Don't have an account? "
- **Link Text:** "Register here"
- **Link:** `/register`
- **Position:** Below submit button

---

#### Error Handling

**Common Errors:**

- "Invalid email or password"
- "Account suspended. Please contact support."
- "Too many login attempts. Please try again later."
- Network errors: "Connection error. Please try again."

**Display:**

- Error banner at top of form
- Red text, clear message
- Auto-dismiss after 5 seconds (optional)

---

### 4.2 Register Page (`/register`)

#### Page Layout

Same as login page (split or centered)

---

#### Registration Form

**Title:** "Create Your Account"

**Subtitle:** "Join TravelBuddy and start planning amazing trips"

**Form Fields:**

**Full Name** (optional but recommended):

- **Type:** text
- **Label:** "Full Name"
- **Placeholder:** "Enter your full name"
- **Validation:** Min 2 characters, max 100 characters
- **Error:** "Full name must be between 2 and 100 characters"

**Email** (required):

- **Type:** email
- **Label:** "Email Address"
- **Placeholder:** "Enter your email"
- **Validation:** Required, valid email format
- **Error:** "Please enter a valid email address"
- **Duplicate Check:** "This email is already registered" (on blur or submit)

**Password** (required):

- **Type:** password
- **Label:** "Password"
- **Placeholder:** "Create a password"
- **Show/Hide Toggle:** Eye icon
- **Password Strength Indicator:** Visual indicator (weak/medium/strong)
- **Validation Rules** (display as user types):
  - ✓ Minimum 8 characters
  - ✓ At least 1 uppercase letter
  - ✓ At least 1 number
  - ✓ At least 1 special character (!@#$%^&\*)
- **Error:** "Password must meet all requirements"

**Confirm Password** (required):

- **Type:** password
- **Label:** "Confirm Password"
- **Placeholder:** "Confirm your password"
- **Show/Hide Toggle:** Eye icon
- **Validation:** Must match password field
- **Error:** "Passwords do not match"

**Terms & Conditions** (required):

- **Type:** checkbox
- **Label:** "I agree to the Terms of Service and Privacy Policy"
- **Links:** Terms and Privacy Policy (open in new tab)
- **Validation:** Required
- **Error:** "You must agree to the terms to continue"

**Submit Button:**

- **Text:** "Create Account"
- **Loading State:** Show spinner, disable button
- **Success:** Redirect to `/dashboard` or email verification page
- **Error:** Display error message

**Login Link:**

- **Text:** "Already have an account? "
- **Link Text:** "Sign in here"
- **Link:** `/login`
- **Position:** Below submit button

---

#### Success Flow

**After Registration:**

- Show success message: "Account created successfully!"
- Auto-login or redirect to login page
- Welcome email (handled by backend)

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

#### Quick Stats Cards (4 Cards)

**Card 1: Total Plans**

- **Number:** Total travel plans count
- **Label:** "Travel Plans"
- **Icon:** Map icon
- **Link:** `/dashboard/travel-plans`
- **Color:** Blue

**Card 2: Upcoming Trips**

- **Number:** Count of future trips
- **Label:** "Upcoming Trips"
- **Icon:** Calendar icon
- **Link:** `/dashboard/travel-plans?type=future`
- **Color:** Green

**Card 3: Total Expenses**

- **Number:** Total amount spent (formatted: $X,XXX)
- **Label:** "Total Expenses"
- **Icon:** Dollar icon
- **Link:** `/dashboard/expenses`
- **Color:** Orange

**Card 4: Active Subscription**

- **Number/Status:** Active subscription status or "Inactive"
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

#### Recent Activity Section

**Title:** "Recent Activity"

**List:** Last 5-10 activities

**Activity Item Format:**

- **Icon:** Activity type icon
- **Message:** "You created plan 'Trip to Paris'"
- **Timestamp:** "2 hours ago" or absolute date
- **Link:** Link to related item (if applicable)

**Examples:**

- "You created plan 'Trip to Paris'"
- "John joined your plan 'Beach Vacation'"
- "New expense added to 'Europe Trip'"
- "Meetup scheduled for 'Weekend Getaway'"

**Styling:**

- List layout
- Icons for visual distinction
- Timestamps in gray
- Hover effects
- "View All Activity" link (optional)

---

#### Upcoming Meetups Section

**Title:** "Upcoming Meetups"

**List:** Next 3-5 meetups

**Meetup Item:**

- **Meetup Name/Location:** Title or location
- **Date and Time:** Formatted date/time
- **RSVP Status:** Accepted/Declined/Pending badge
- **Link:** Link to meetup details

**Styling:**

- Card or list layout
- Date highlighted
- Status badges
- "View All Meetups" link

---

#### Recent Notifications Section

**Title:** "Recent Notifications"

**List:** Last 5 unread notifications

**Notification Item:**

- **Icon:** Notification type icon
- **Message:** Notification text
- **Timestamp:** "5 minutes ago"
- **Action:** "Mark as read" button
- **Link:** Link to related item

**Styling:**

- List layout
- Unread indicator (dot or background)
- "View All Notifications" link → `/dashboard/notifications`

---

### 5.3 My Travel Plans (`/dashboard/travel-plans`)

#### Page Header

**Title:** "My Travel Plans"

**Action Button:** "Create New Plan" → `/dashboard/travel-plans/create`

---

#### Filters

**Type Filter:**

- Radio buttons or tabs: All / Future / Past
- Default: All

**Search:**

- Search input: "Search by title or destination..."
- Real-time filtering

**Sort:**

- Dropdown: Newest / Oldest / Alphabetical
- Default: Newest

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
- **Validation:** Must be today or future date
- **Error:** "Start date must be today or in the future"
- **Feature:** Calendar popup, disable past dates

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
  - **Solo:** "Traveling alone"
  - **Couple:** "Traveling with a partner"
  - **Family:** "Family trip"
  - **Friends:** "Trip with friends"
  - **Group:** "Large group trip"
- **Default:** Friends
- **Validation:** Required
- **Error:** "Please select a travel type"
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
- **Success:** Redirect to plan details page
- **Error:** Display error message
- **Styling:** Primary button

---

### 5.5 Travel Plan Details (`/dashboard/travel-plans/:id`)

#### Page Header

**Plan Title and Destination**

**Actions:**

- Edit → `/dashboard/travel-plans/:id/edit`
- Delete → Confirmation modal
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
   - Link to full itinerary page or embedded view
   - Add new item button
   - Day-by-day breakdown

3. **Members Tab**
   - Member list with avatars, names, roles
   - Invite member button
   - Update role dropdown (for owners/admins)
   - Remove member action

4. **Expenses Tab**
   - Link to expenses page or embedded list
   - Expense summary card
   - Add expense button

5. **Meetups Tab**
   - List of meetups for this plan
   - Create meetup button
   - RSVP status for each

6. **Media Tab**
   - Gallery view of all media
   - Upload media button
   - Lightbox for viewing images

7. **Chat Tab**
   - Embedded chat interface or link
   - Message list
   - Send message input

8. **Reviews Tab**
   - Reviews for this plan
   - Create review button (if user hasn't reviewed)

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
- **Validation:** Required, must be within plan duration
- **Error:** "Please select a valid day"

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

**Start Time** (optional):

- **Type:** time picker
- **Label:** "Start Time"
- **Placeholder:** "Select start time"
- **Format:** 12-hour or 24-hour (user preference)
- **Feature:** Time picker component

**End Time** (optional):

- **Type:** time picker
- **Label:** "End Time"
- **Placeholder:** "Select end time"
- **Validation:** Must be after start time (if both provided)
- **Error:** "End time must be after start time"
- **Format:** 12-hour or 24-hour

**Location** (optional):

- **Type:** text input with autocomplete
- **Label:** "Location"
- **Placeholder:** "Location address"
- **Feature:** Google Places autocomplete or similar
- **Map Preview:** Show location on map (optional)

**Order** (optional):

- **Type:** number input
- **Label:** "Order"
- **Placeholder:** "Auto-calculated"
- **Default:** Auto-calculated based on time or sequence
- **Feature:** Can be manually set for custom ordering

**Form Actions:**

- **Cancel Button:** Close form without saving
- **Save Button:** Save item and close form
- **Save & Add Another:** Save and open new form

**Styling:**

- Modal overlay or side panel
- Form validation on submit
- Success toast notification

---

#### Bulk Actions

**Bulk Add Items:**

- **Button:** "Bulk Add Items"
- **Functionality:**
  - Opens modal with textarea
  - User can paste multiple items (one per line)
  - Format: "Day 1 | 9:00 AM | Visit Museum | Description"
  - Parse and create multiple items
- **Use Case:** For AI-generated itineraries

**Drag & Drop Reordering:**

- **Feature:** Drag items within a day or between days
- **Visual Feedback:** Show drop zones
- **Save Order Button:** "Save Order" (appears after reordering)
- **API Call:** PATCH `/api/v1/itinerary/reorder`

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

#### Session List (If User Has Previous Sessions)

**Section Title:** "Previous Sessions"

**Session Card** (each session):

- **Status Badge:** In Progress / Completed
- **Destination:** Session destination
- **Created Date:** "Created on [date]"
- **Actions:**
  - Continue (if In Progress) → Resume session
  - View (if Completed) → View generated plan
  - Delete → Confirmation modal

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
- **Success:** Display generated itinerary
- **Error:** Display error message

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
  - Creates travel plan with generated itinerary
  - Redirects to new travel plan page
  - Success message: "Travel plan created successfully!"

- **"Regenerate" Button:**
  - Returns to Step 1
  - Allows user to modify preferences

- **"Edit Manually" Button:**
  - Opens itinerary editor
  - Allows manual adjustments before creating plan

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
- **Status Filter:** All, Settled, Unsettled
- **Date Range:** Start date - End date picker
- **Clear Filters Button:** "Clear All"

**Sort Options:**

- **Dropdown:** Date (newest first), Date (oldest first), Amount (high to low), Amount (low to high)
- **Default:** Date (newest first)

**View Toggle:**

- **List View:** Default
- **Grouped View:** Group by category or date (optional)

---

#### Expense Card (Each Expense)

**Display:**

- **Category Badge:** Food, Transport, etc. (with icon and color)
- **Title:** Expense title (bold, 16px)
- **Amount:** Large, prominent (e.g., "$150.00")
- **Currency:** Display currency code
- **Paid By:**
  - User avatar/name
  - "Paid by [Name]" text
- **Participants:**
  - List of participants with avatars
  - Amount each owes (for custom/percentage splits)
- **Date:** Expense date (formatted)
- **Description:** Expense description (if available, gray text)
- **Settlement Status Badge:**
  - Fully Settled (green)
  - Partially Settled (yellow)
  - Unsettled (red)
- **Actions:**
  - Edit (pencil icon) → Opens edit form
  - Delete (trash icon) → Confirmation modal
  - Settle (checkmark icon) → Settlement modal

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

**Title** (required):

- **Type:** text input
- **Label:** "Expense Title \*"
- **Placeholder:** "e.g., Dinner at Restaurant"
- **Validation:** Required, min 3 characters, max 200 characters
- **Error:** "Title must be between 3 and 200 characters"

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
- **Default:** All members selected
- **Validation:** At least 1 participant required
- **Error:** "Please select at least one participant"
- **Custom/Percentage Split:**
  - If Custom or Percentage selected, show amount input for each participant
  - Total must equal expense amount
  - Validation: "Total must equal expense amount"

**Date** (required):

- **Type:** date picker
- **Label:** "Date \*"
- **Placeholder:** "Select date"
- **Default:** Today
- **Validation:** Required, must be within plan date range
- **Error:** "Date must be within the travel plan dates"

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
- **Success:** Close modal, refresh expense list, show success toast

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
- **Confirmation:** "Mark [Participant Name] as settled for [Expense Title]?"
- **Success:** Update expense, refresh list

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

#### Meetup List

**Filters:**

- **Status Filter:** All, Pending, Confirmed, Completed, Cancelled
- **Date Range:** Start date - End date picker
- **Clear Filters Button:** "Clear All"

**View Toggle:**

- **List View:** Default (chronological list)
- **Calendar View:** Calendar layout (optional, advanced feature)

**Sort Options:**

- **Dropdown:** Date (upcoming first), Date (past first), Status
- **Default:** Date (upcoming first)

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
  - RSVP (if not organizer) → Accept/Decline buttons
  - Edit (if organizer/plan owner) → Edit form
  - Delete (if organizer/plan owner) → Confirmation modal
  - Update Status (if organizer/plan owner) → Status update dropdown

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

**Description** (optional):

- **Type:** textarea
- **Label:** "Description"
- **Placeholder:** "What's this meetup about? Add any details..."
- **Max Length:** 1000 characters
- **Character Counter:** "X / 1000 characters"
- **Rows:** 4-5

**Form Actions:**

- **Cancel Button:** Close modal without saving
- **Create Button:** Create meetup
- **Loading State:** Show spinner during submission
- **Success:** Close modal, refresh meetup list, show success toast

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

- **Filter by Date:** All, Today, This Week, This Month, Custom Range
- **Filter by Type:** All, Plan Photos, Meetup Photos, Itinerary Photos
- **Sort:** Newest, Oldest, File Size
- **Clear Filters Button:** "Clear All"

**Search:**

- **Search Input:** "Search media by description..."
- **Real-time Filtering:** Filter as user types

---

#### Media Item (Each Image)

**Thumbnail:**

- **Aspect Ratio:** Maintain original or square (1:1)
- **Lazy Loading:** Load images as user scrolls
- **Placeholder:** Blur placeholder while loading
- **Error State:** Show error icon if image fails to load

**Hover Overlay:**

- **View Button:** Eye icon → Opens lightbox
- **Delete Button:** Trash icon → Confirmation modal
- **Info Button:** Info icon → Shows metadata (optional)

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
- **Success:** Remove from gallery, show success toast

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

**Styling:**

- Sticky header (stays at top)
- Clear thread identification
- Member avatars in row

---

#### Messages Area

**Layout:**

- **Scrollable Container:** Auto-scroll to bottom on new messages
- **Message List:** Chronological order (oldest to newest)
- **Date Separators:** "Today", "Yesterday", "[Date]" between messages
- **Loading State:** Show spinner while loading messages
- **Load More:** "Load older messages" button at top (pagination)

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

- **Edit:** Edit own messages (within time limit)
- **Delete:** Delete own messages
- **Copy:** Copy message text
- **Reply:** Reply to message (optional feature)

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
- **Max Length:** 2000 characters
- **Character Counter:** "X / 2000" (optional, shown near limit)
- **Features:**
  - Emoji picker (optional)
  - File attachment (optional, for future)
  - Mention users with @ (optional, for future)

**Send Button:**

- **Icon:** Send icon (paper plane)
- **State:**
  - Enabled when input has text
  - Disabled when input is empty
  - Loading state during send
- **Keyboard:** Enter to send (Shift+Enter for new line)

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
- **Actions:**
  - Save button → Update message
  - Cancel button → Cancel edit
- **Loading State:** Show spinner during update
- **Success:** Update message, show "(edited)" indicator

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
- **Success:** Remove message, show success toast

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

#### Tabs Navigation

**Two Tabs:**

1. **Given Reviews Tab**
   - Reviews you've written
   - Filter: All, User Reviews, Trip Reviews
   - Default: All

2. **Received Reviews Tab**
   - Reviews about you or your trips
   - Filter: All, About Me, About My Trips
   - Default: All

**Styling:**

- Tab navigation (horizontal)
- Active tab highlighted
- Tab badges: Count of reviews in each tab

---

#### Review List

**Filters:**

- **Type Filter:** All, User Reviews, Trip Reviews (for Given Reviews)
- **Rating Filter:** All, 5 Stars, 4 Stars, 3 Stars, 2 Stars, 1 Star
- **Sort:** Newest, Oldest, Highest Rating, Lowest Rating
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
  - **Review a Trip:** "Write a review about a travel plan"
- **Default:** Review a User
- **Validation:** Required
- **Error:** "Please select a review type"

**Reviewed User/Plan** (required, based on source):

- **Type:** select dropdown
- **Label:**
  - "Select User \*" (if reviewing user)
  - "Select Trip \*" (if reviewing trip)
- **Options:**
  - For User: Shows users you've traveled with (with avatars)
  - For Trip: Shows trips you've been part of (with trip details)
- **Placeholder:** "Select [user/trip] to review"
- **Validation:** Required
- **Error:** "Please select a [user/trip] to review"

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
- **Success:** Close modal, refresh review list, show success toast

**Styling:**

- Modal overlay
- Interactive star rating
- Clear field labels
- Helpful placeholders

---

#### Review Statistics (Received Reviews Tab)

**Statistics Section:**

- **Average Rating:**
  - Large star display (e.g., 4.5/5)
  - "Based on X reviews"
- **Rating Distribution:**
  - Bar chart or list showing:
    - 5 stars: X reviews (XX%)
    - 4 stars: X reviews (XX%)
    - 3 stars: X reviews (XX%)
    - 2 stars: X reviews (XX%)
    - 1 star: X reviews (XX%)
- **Total Reviews Count:** "X total reviews"

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
- **Success:** Remove from list, show success toast

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
- **Cancel Subscription Button:** "Cancel Subscription" → Opens cancellation modal
- **Upgrade/Renew Button:** "Upgrade Plan" or "Renew Subscription" (if inactive)

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
   - Create checkout session via API
   - Redirect to Stripe Checkout

2. **Stripe Checkout:**
   - User enters payment details
   - Stripe handles payment processing
   - Secure payment form

3. **Success Redirect:**
   - Redirect back to subscriptions page
   - Show success message: "Subscription activated successfully!"
   - Update subscription status
   - Refresh subscription card

4. **Error Handling:**
   - Display error message if payment fails
   - Allow user to retry
   - Show support contact if needed

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
  - "Cancel immediately"
  - Confirmation required
- **Update Payment Method:**
  - Link to Stripe customer portal (optional)
- **View Billing History:**
  - Link to payments page

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
- **Loading State:** Show spinner during cancellation

**Success:**

- Show success message
- Update subscription status
- Send confirmation email (handled by backend)

**Styling:**

- Clear warning messages
- Easy to cancel or keep
- Confirmation required

---

#### Subscription History

**Section Title:** "Subscription History"

**History List:**

- **Past Subscriptions:**
  - Plan type and name
  - Status (Active, Cancelled, Expired)
  - Dates (started, ended)
  - Payment history link

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

#### Payment Summary Cards

**Layout:** Summary cards at top (3 cards)

**Card 1: Total Spent**

- **Label:** "Total Spent"
- **Amount:** Total amount paid (formatted: $X,XXX.XX)
- **Icon:** Dollar icon
- **Color:** Blue
- **Period:** All time

**Card 2: This Month**

- **Label:** "This Month"
- **Amount:** Amount paid this month
- **Icon:** Calendar icon
- **Color:** Green
- **Period:** Current month

**Card 3: Active Subscriptions**

- **Label:** "Active Subscriptions"
- **Count:** Number of active subscriptions
- **Icon:** Credit Card icon
- **Color:** Purple
- **Link:** Links to subscriptions page

**Styling:**

- Grid layout: 1 column (mobile), 3 columns (desktop)
- Card design with shadow
- Hover effects
- Clickable (optional: link to filtered view)

---

#### Payment List

**Filters:**

- **Status Filter:** All, Succeeded, Failed, Pending, Refunded
- **Date Range:** Start date - End date picker
- **Type Filter:** All, Subscription, One-time
- **Clear Filters Button:** "Clear All"

**Sort Options:**

- **Dropdown:** Date (newest first), Date (oldest first), Amount (high to low), Amount (low to high)
- **Default:** Date (newest first)

**View Options:**

- **List View:** Default
- **Grouped by Date:** Optional grouping

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
  - Download Receipt (download icon) → Download receipt

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
- **Upload New Photo:**
  - **Button:** "Upload New Photo" or "Change Photo"
  - **File Input:** Hidden file input
  - **Accept:** image/\* (JPEG, PNG, WebP)
  - **Max Size:** 5MB
  - **Preview:** Show preview after selection
  - **Crop Tool:** Optional image cropper
  - **Remove Photo Button:** "Remove Photo" (if photo exists)
- **Upload Progress:** Progress indicator during upload
- **Validation:**
  - File type validation
  - File size validation
  - Error: "Please upload a valid image file (max 5MB)"

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
- **Success:** Show success toast, refresh profile data
- **Error:** Display error message

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
- **Success:**
  - Show success toast: "Password updated successfully"
  - Clear form
  - Logout user (optional, for security)
- **Error:** Display error message

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

#### Header Actions

**Actions Bar:**

- **Mark All as Read Button:** "Mark All as Read"
  - Only shown if there are unread notifications
  - Confirmation: "Mark all notifications as read?"
  - Success: Update all notifications, refresh list
- **Filter Dropdown:**
  - **Options:** All, Unread, Read
  - **Default:** All
  - **Badge:** Count of unread notifications
- **Notification Type Filter:**
  - **Dropdown:** All Types, Plan Updates, Messages, Invitations, Meetups, Expenses, Subscriptions, Payments
  - **Default:** All Types

**Styling:**

- Sticky header (stays at top on scroll)
- Clear action buttons
- Filter dropdowns clearly visible

---

#### Notification List

**Layout:**

- **Chronological Order:** Newest first (default)
- **Grouping:** Optional grouping by date (Today, Yesterday, This Week, Older)
- **Pagination:** Load more or infinite scroll
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
  - **Delete:** Trash icon → Delete notification (optional)
  - **Action Button:** Context-specific action (e.g., "View Plan", "Reply")

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
- **Update:** Remove unread indicator, update count
- **API:** PATCH `/api/v1/notifications/:id/read`

**Mark All as Read:**

- **Action:** Click "Mark All as Read" button
- **Confirmation:** Optional confirmation modal
- **Update:** Mark all notifications as read, refresh list
- **API:** PATCH `/api/v1/notifications/read-all`

**Delete Notification:**

- **Action:** Click delete icon
- **Confirmation:** "Delete this notification?"
- **Update:** Remove from list
- **API:** DELETE `/api/v1/notifications/:id` (if implemented)

**Navigate to Related Item:**

- **Action:** Click notification
- **Behavior:** Navigate to related page (plan, chat, etc.)
- **Auto-mark as Read:** Mark as read when clicked

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

**Real-time Updates:**

- Update badge count when new notifications arrive
- Update when notifications are marked as read
- WebSocket or polling for real-time updates

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
  - **Remove Member Button:**
    - Trash icon
    - Confirmation: "Remove [Name] from this plan?"
    - Warning: "This action cannot be undone"

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

**Role** (required):

- **Type:** select dropdown
- **Label:** "Role \*"
- **Options:**
  - **ADMIN:** "Admin - Can manage members and edit plan"
  - **EDITOR:** "Editor - Can edit plan and add content"
  - **VIEWER:** "Viewer - Can only view plan"
- **Default:** VIEWER
- **Validation:** Required
- **Error:** "Please select a role"
- **Help Text:** Descriptions for each role

**Invite Button:**

- **Text:** "Send Invitation"
- **Loading State:** Show spinner during submission
- **Success:**
  - Show success toast: "Invitation sent to [email]"
  - Clear form
  - Refresh pending invitations list
- **Error:** Display error message

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
