# Frontend Developer Requirements: Admin Travel Plans Management

## Overview
This document outlines the requirements for implementing Admin Travel Plans Management features in the frontend. Admin users need to be able to view, update, and delete any travel plan in the system, regardless of ownership or visibility.

---

## 📋 What to Check

### 1. Postman Collection
**Location:** `Test/Travel_Buddy_API_Collection.json`

**Section:** "Travel Plans" → Admin Routes (at the end of Travel Plans section)

**Endpoints to Check:**
- `GET /api/v1/travel-plans/admin` - Get All Travel Plans (Admin)
- `PATCH /api/v1/travel-plans/admin/:id` - Update Travel Plan (Admin)
- `DELETE /api/v1/travel-plans/admin/:id` - Delete Travel Plan (Admin)

**What to Verify:**
- Request/response examples
- Query parameters for filtering and search
- Authentication requirements (ADMIN role)
- Request body structure for update endpoint

---

### 2. Frontend Roadmap
**Location:** `Frontend_Roadmap/Frontend_Roadmap.md`

**Section:** `### 5.17 Admin Travel Plans Management (/admin/plans)`

**What to Check:**
- Page structure and layout
- API integration details
- Filter and search functionality
- Update and delete operations
- UI/UX specifications

---

## 🎯 Implementation Requirements

### Page Route
- **Path:** `/admin/plans`
- **Access:** ADMIN role only
- **Navigation:** Add to admin sidebar (if exists) or admin dashboard

### Features to Implement

#### 1. Get All Travel Plans (Admin)
- **Endpoint:** `GET /api/v1/travel-plans/admin`
- **Query Parameters:**
  - `searchTerm` (optional) - Search in title and destination
  - `travelType` (optional) - Filter by: SOLO, COUPLE, FAMILY, FRIENDS, GROUP
  - `visibility` (optional) - Filter by: PUBLIC, PRIVATE, UNLISTED
  - `isFeatured` (optional) - Filter by featured status: true/false
  - `ownerId` (optional) - Filter by owner user ID (UUID)
  - `page` (optional) - Page number (default: 1)
  - `limit` (optional) - Items per page (default: 10)
  - `sortBy` (optional) - Sort field (default: startDate)
  - `sortOrder` (optional) - Sort order: asc or desc (default: asc)

**Response Structure:**
```json
{
  "success": true,
  "message": "All travel plans retrieved successfully.",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150
  },
  "data": [
    {
      "id": "plan-uuid",
      "title": "Summer Trip to Cox's Bazar",
      "destination": "Cox's Bazar, Bangladesh",
      "origin": "Dhaka, Bangladesh",
      "startDate": "2025-09-15T00:00:00.000Z",
      "endDate": "2025-09-21T00:00:00.000Z",
      "budgetMin": 5000,
      "budgetMax": 12000,
      "travelType": "FRIENDS",
      "visibility": "PUBLIC",
      "description": "An awesome week-long trip!",
      "coverPhoto": "https://example.com/photo.jpg",
      "isFeatured": true,
      "totalDays": 7,
      "owner": {
        "id": "user-uuid",
        "fullName": "John Doe",
        "email": "john@example.com",
        "profileImage": "https://example.com/profile.jpg"
      },
      "_count": {
        "itineraryItems": 15,
        "tripMembers": 5
      },
      "createdAt": "2025-01-10T10:30:00.000Z",
      "updatedAt": "2025-01-15T14:20:00.000Z"
    }
  ]
}
```

**TypeScript Type Definition:**
```typescript
interface AdminTravelPlan {
  id: string;
  title: string;
  destination: string;
  origin: string | null;
  startDate: string;
  endDate: string;
  budgetMin: number | null;
  budgetMax: number | null;
  travelType: "SOLO" | "COUPLE" | "FAMILY" | "FRIENDS" | "GROUP";
  visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
  description: string | null;
  coverPhoto: string | null;
  isFeatured: boolean;
  totalDays: number;
  owner: {
    id: string;
    fullName: string;
    email: string;
    profileImage: string | null;
  };
  _count: {
    itineraryItems: number;
    tripMembers: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface AdminTravelPlansResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: AdminTravelPlan[];
}
```

#### 2. Update Travel Plan (Admin)
- **Endpoint:** `PATCH /api/v1/travel-plans/admin/:id`
- **Method:** PATCH with multipart/form-data (for file uploads) or application/json
- **All Fields Optional:**
  - `title` (string)
  - `destination` (string)
  - `origin` (string)
  - `startDate` (string, ISO date - must be future date)
  - `endDate` (string, ISO date - must be >= startDate)
  - `travelType` (enum: SOLO, COUPLE, FAMILY, FRIENDS, GROUP)
  - `budgetMin` (number)
  - `budgetMax` (number)
  - `visibility` (enum: PUBLIC, PRIVATE, UNLISTED)
  - `description` (string)
  - `coverPhoto` (string, URL - if not uploading file)
  - `files` (File[], up to 10 images - first replaces coverPhoto, rest added to gallery)

**Important Notes:**
- Admin can update ANY plan without permission checks
- If updating `startDate`, it must be a future date
- `endDate` must be >= `startDate`
- File uploads: Use `multipart/form-data`, first file replaces coverPhoto

#### 3. Delete Travel Plan (Admin)
- **Endpoint:** `DELETE /api/v1/travel-plans/admin/:id`
- **Method:** DELETE
- **Response:** Success message
- **Important:** Admin can delete ANY plan without permission checks

---

## 🎨 UI/UX Requirements

### Page Layout
1. **Header Section:**
   - Page title: "All Travel Plans"
   - Search bar (searchTerm filter)
   - Filter dropdowns (travelType, visibility, isFeatured, ownerId)
   - Sort options (sortBy, sortOrder)

2. **Plans Grid/List:**
   - Display all plans with owner information
   - Show visibility badge (PUBLIC/PRIVATE/UNLISTED)
   - Show featured badge if `isFeatured: true`
   - Show owner name and email
   - Show member count and itinerary items count
   - Action buttons: View, Edit, Delete

3. **Pagination:**
   - Display pagination controls
   - Show total count and current page info

4. **Update Modal/Form:**
   - Reuse existing travel plan update form
   - All fields editable
   - File upload support
   - Validation for dates

5. **Delete Confirmation:**
   - Confirmation dialog before deletion
   - Warning message: "Are you sure you want to delete this plan? This action cannot be undone."

---

## 📝 Admin Get All Users Response Example

For TypeScript type definition reference:

**Endpoint:** `GET /api/v1/users/admin`

**Response Example:**
```json
{
  "success": true,
  "message": "Users retrieved successfully.",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150
  },
  "data": [
    {
      "id": "user-uuid",
      "email": "john@example.com",
      "fullName": "John Doe",
      "profileImage": "https://example.com/profile.jpg",
      "bio": "Travel enthusiast",
      "location": "Dhaka, Bangladesh",
      "interests": ["hiking", "photography"],
      "visitedCountries": ["BD", "IN"],
      "isVerified": true,
      "status": "ACTIVE",
      "avgRating": 4.5,
      "createdAt": "2025-01-10T10:30:00.000Z"
    }
  ]
}
```

**TypeScript Type Definition:**
```typescript
interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  profileImage: string | null;
  bio: string | null;
  location: string | null;
  interests: string[] | null;
  visitedCountries: string[] | null;
  isVerified: boolean;
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  avgRating: number | null;
  createdAt: string;
}

interface AdminUsersResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: AdminUser[];
}
```

---

## ✅ Checklist

- [ ] Read Postman collection admin travel plan endpoints
- [ ] Read Frontend roadmap section 5.17
- [ ] Implement GET all travel plans with filters and search
- [ ] Implement PATCH update travel plan (admin)
- [ ] Implement DELETE travel plan (admin)
- [ ] Add admin route to navigation/sidebar
- [ ] Implement pagination
- [ ] Add TypeScript types for all responses
- [ ] Add error handling
- [ ] Add loading states
- [ ] Add confirmation dialogs for delete
- [ ] Test with different filters and search terms
- [ ] Test update with and without file uploads
- [ ] Verify ADMIN role access only

---

## 🔗 Related Files

1. **Postman Collection:** `Test/Travel_Buddy_API_Collection.json`
   - Section: "Travel Plans" → Admin routes

2. **Frontend Roadmap:** `Frontend_Roadmap/Frontend_Roadmap.md`
   - Section: `### 5.17 Admin Travel Plans Management (/admin/plans)`

3. **Backend Routes:** `src/app/modules/travelPlan/travelPlan.routes.ts`
   - Admin routes: `/admin`, `/admin/:id` (PATCH, DELETE)

4. **Backend Service:** `src/app/modules/travelPlan/travelPlan.service.ts`
   - Functions: `getAllTravelPlans`, `adminUpdateTravelPlan`, `adminDeleteTravelPlan`

---

## 📞 Support

If you have any questions or need clarification:
1. Check the Postman collection for request/response examples
2. Review the Frontend roadmap for detailed UI/UX specifications
3. Test endpoints directly in Postman before implementing

---

**Last Updated:** 2025-01-XX
**Version:** 1.0

