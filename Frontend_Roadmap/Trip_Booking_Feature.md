# Trip Booking/Join Request Feature Documentation

## Overview

The Trip Booking feature allows users to request to join PUBLIC or UNLISTED travel plans. Plan owners and admins can approve or reject these requests. Upon approval, users are automatically added as trip members with VIEWER role.

---

## Public Plan Details Page - Request to Join Button

**Location:** `/plans/:id` (Public Plan Details Page)

**For Authenticated Users (Non-Members):**

- **"Request to Join" Button** 
  - **Text:** "Request to Join"
  - **Icon:** User plus icon
  - **Visible when:** User is authenticated, plan is PUBLIC or UNLISTED, and user is NOT already a member
  - **Action:** Opens join request modal
  - **API:** `POST /api/v1/trip-bookings/request`
  - **Request Body:**
    ```json
    {
      "planId": "uuid",
      "message": "Optional message (max 500 chars)"
    }
    ```
  - **Modal Fields:**
    - Plan title (display only)
    - Optional message field (textarea): "Tell the owner why you'd like to join (optional)"
    - Submit button: "Send Request"
    - Cancel button
  - **Success Response:** Show toast "Join request sent successfully!" and button changes to "Request Pending" (disabled)
  - **Error Handling:**
    - Already member: "You are already a member of this plan"
    - Already requested: "You already have a pending request for this plan"
    - Private plan: "Cannot request to join a private plan. You must receive an invitation."

**"Request Pending" Button State:**

- **Text:** "Request Pending"
- **Icon:** Clock icon
- **State:** Disabled
- **Style:** Secondary/muted button
- **Tooltip:** "Your join request is awaiting approval"
- **Visible when:** User has a PENDING request for this plan

---

## Dashboard: My Join Requests Page

**Route:** `/dashboard/my-requests`

**Page Title:** "My Join Requests"

**Sidebar Menu Item:**

- **Icon:** User check icon
- **Label:** "My Requests"
- **Badge:** Show pending request count (if > 0)

**API Integration:**

**Get My Requests:**
- **Endpoint:** `GET /api/v1/trip-bookings/my-requests`
- **Authentication:** Required (USER or ADMIN)
- **Response Structure:**
  ```json
  [
    {
      "id": "booking-uuid",
      "planId": "plan-uuid",
      "userId": "user-uuid",
      "status": "PENDING" | "APPROVED" | "REJECTED",
      "message": "Optional message text",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "plan": {
        "id": "plan-uuid",
        "title": "Plan Title",
        "destination": "Destination",
        "startDate": "2024-03-15T00:00:00Z",
        "endDate": "2024-03-20T00:00:00Z",
        "coverPhoto": "https://...",
        "visibility": "PUBLIC"
      }
    }
  ]
  ```

**Request List Layout:**

- **Card Layout** - One card per request
- **Card Content:**
  - Plan cover photo (thumbnail, 200x150px)
  - Plan title (heading)
  - Destination (with location icon)
  - Start date - End date (with calendar icon)
  - Request status badge (PENDING/APPROVED/REJECTED)
  - Request sent date: "Requested on Jan 15, 2024"
  - Your message (if provided): Display in muted text
  - Action button (based on status)

**Request Status Badges:**

- **PENDING:** Yellow/orange badge with clock icon - "Pending"
- **APPROVED:** Green badge with check icon - "Approved"
- **REJECTED:** Red badge with X icon - "Rejected"

**Action Buttons (per request):**

- **PENDING Status:**
  - "Cancel Request" button (red, danger style)
  - **API:** `DELETE /api/v1/trip-bookings/:bookingId`
  - **Confirmation Modal:** "Are you sure you want to cancel this join request?"
  - **Success:** Show toast "Request cancelled successfully" and remove card from list
- **APPROVED Status:**
  - "View Plan" button (primary, green)
  - **Links to:** `/dashboard/travel-plans/:planId`
- **REJECTED Status:**
  - No action button (request is final)
  - Optional: "Browse Plans" button to explore other plans

**Empty State:**

- **Message:** "You haven't sent any join requests yet"
- **Sub-message:** "Browse public travel plans and request to join adventures that interest you"
- **Icon:** Large user plus icon
- **Button:** "Explore Plans" → `/plans`

**Styling:**

- Responsive grid: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Card shadows and hover effects
- Clear status color coding

---

## Dashboard: Manage Join Requests (Plan Owner/Admin)

**Location:** Integrated into Members Management page `/dashboard/travel-plans/:id/members`

**New Section:** "Pending Join Requests"

**Position:** Above the "Current Members" section

**Section Header:**

- **Title:** "Pending Join Requests (count)"
- **Visibility:** Only show section if there are pending requests for this plan

**API Integration:**

**Get Incoming Requests:**
- **Endpoint:** `GET /api/v1/trip-bookings/plan/:planId`
- **Authentication:** Required (USER or ADMIN)
- **Permission Required:** `canManageMembers` (owner or admin only)
- **Response Structure:**
  ```json
  [
    {
      "id": "booking-uuid",
      "planId": "plan-uuid",
      "userId": "user-uuid",
      "status": "PENDING",
      "message": "I love adventure travel and would like to join!",
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "id": "user-uuid",
        "fullName": "John Doe",
        "email": "john@example.com",
        "profileImage": "https://...",
        "bio": "Adventure enthusiast",
        "location": "New York, USA",
        "interests": ["hiking", "photography", "camping"]
      }
    }
  ]
  ```

**Request Card Layout:**

- **Horizontal card per request**
- **Left Section:**
  - User profile image (avatar, 64x64px)
- **Middle Section:**
  - User full name (heading)
  - User email (muted text)
  - User location (with location icon)
  - User interests (tags/badges)
  - User bio (truncated to 2 lines, expandable with "Read more")
  - Request message section:
    - Label: "Message from requester:"
    - Message text (in quote/highlight box)
  - Request date: "Requested on Jan 15, 2024"
- **Right Section:**
  - Action buttons (stacked vertically)

**Action Buttons (per request):**

- **"Approve" Button** (Green, primary)
  - **Icon:** Check icon
  - **API:** `PATCH /api/v1/trip-bookings/:bookingId/respond`
  - **Request Body:** `{ "status": "APPROVED" }`
  - **Success:** 
    - Show toast: "Request approved! [User Name] has been added as a member"
    - Remove card from pending list
    - User is automatically added to "Current Members" section with VIEWER role
  - **Error:** Display error message

- **"Reject" Button** (Red, secondary/outline)
  - **Icon:** X icon
  - **API:** `PATCH /api/v1/trip-bookings/:bookingId/respond`
  - **Request Body:** `{ "status": "REJECTED" }`
  - **Confirmation Modal:** "Are you sure you want to reject [User Name]'s request to join?"
  - **Success:** 
    - Show toast: "Request rejected"
    - Remove card from pending list
  - **Error:** Display error message

**Empty State:**

- **Display:** Hide entire section if no pending requests
- **Alternative:** Show minimal message: "No pending join requests" (muted, small text)

**Badge Indicator:**

- **Plan Members Badge:** Show count in section header "Pending Join Requests (3)"
- **Optional:** Show notification badge on "My Travel Plans" sidebar item if user has plans with pending requests

**Styling:**

- Card-based layout with clear sections
- Hover effects on cards
- Clear action buttons with distinct colors
- User information displayed professionally
- Responsive layout (stack on mobile)

---

## Admin Dashboard Update

**Location:** `/dashboard/admin/overview`

**New Stat Card:** "Pending Booking Requests"

**API Response Update:**

```json
{
  "stats": {
    ...
    "pendingBookingRequests": 15
  }
}
```

**Card Display:**

- **Number:** Total pending booking requests across all plans
- **Label:** "Pending Booking Requests"
- **Icon:** User check icon or inbox icon
- **Color:** Orange/Yellow
- **Link:** Optional - could link to a system-wide view of all pending requests

---

## API Endpoints Summary

### 1. Send Join Request
- **Method:** POST
- **Endpoint:** `/api/v1/trip-bookings/request`
- **Auth:** Required
- **Body:** `{ planId, message? }`
- **Response:** Created booking object

### 2. Get My Requests
- **Method:** GET
- **Endpoint:** `/api/v1/trip-bookings/my-requests`
- **Auth:** Required
- **Response:** Array of booking requests with plan details

### 3. Get Incoming Requests (Plan Owner)
- **Method:** GET
- **Endpoint:** `/api/v1/trip-bookings/plan/:planId`
- **Auth:** Required (canManageMembers permission)
- **Response:** Array of pending requests with user details

### 4. Respond to Request (Approve/Reject)
- **Method:** PATCH
- **Endpoint:** `/api/v1/trip-bookings/:bookingId/respond`
- **Auth:** Required (canManageMembers permission)
- **Body:** `{ status: "APPROVED" | "REJECTED" }`
- **Response:** Updated booking + member (if approved)

### 5. Cancel Request
- **Method:** DELETE
- **Endpoint:** `/api/v1/trip-bookings/:bookingId`
- **Auth:** Required (own request only)
- **Response:** Success message

---

## Notification Integration

The feature uses existing notification types:

- **INVITATION_RECEIVED:** Used when a join request is sent to plan owner/admins
  - Title: "New join request for your travel plan"
  - Message: "[User Name] wants to join [Plan Title]"

- **INVITATION_ACCEPTED:** Used when request is approved
  - Title: "Your join request was approved!"
  - Message: "You are now a member of [Plan Title]"

- **INVITATION_RECEIVED:** Reused for rejection (with custom message)
  - Title: "Join request declined"
  - Message: "Your request to join [Plan Title] was declined"

---

## Business Rules

1. **Plan Visibility:** Only PUBLIC and UNLISTED plans allow join requests. PRIVATE plans require direct invitation.

2. **One Pending Request:** Users can only have one PENDING request per plan at a time.

3. **Already Member:** Users who are already members (status: JOINED) cannot send join requests.

4. **Auto-Add on Approval:** Approved users are automatically added as trip members with:
   - Role: VIEWER
   - Status: JOINED
   - addedBy: The admin/owner who approved

5. **Resubmission:** After a request is APPROVED or REJECTED, users can submit a new request (old request stays in history).

6. **Permission:** Only users with `canManageMembers` capability (OWNER or ADMIN) can approve/reject requests.

7. **Cancellation:** Users can only cancel their own PENDING requests.

---

## Database Schema

**TripBooking Model:**

```prisma
model TripBooking {
  id        String        @id @default(uuid())
  planId    String        @map("plan_id")
  userId    String        @map("user_id")
  status    BookingStatus @default(PENDING)
  message   String?
  createdAt DateTime      @default(now()) @map("created_at")
  updatedAt DateTime      @updatedAt @map("updated_at")

  plan      TravelPlan    @relation(fields: [planId], references: [id], onDelete: Cascade)
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([planId])
  @@index([status])
  @@map("trip_bookings")
}
```

**BookingStatus Enum:**

```prisma
enum BookingStatus {
  PENDING
  APPROVED
  REJECTED
}
```

---

## Testing Checklist

- [ ] User can send join request from public plan details page
- [ ] Request modal displays correctly with validation
- [ ] Error messages show for duplicate/invalid requests
- [ ] My Requests page displays all requests with correct status
- [ ] User can cancel pending requests
- [ ] Plan owner/admin can view incoming requests
- [ ] Approve button adds user as VIEWER member
- [ ] Reject button updates status and sends notification
- [ ] Notifications are sent for all actions
- [ ] Admin dashboard shows pending requests count
- [ ] Permission checks prevent unauthorized access
- [ ] Empty states display correctly

---

**Feature Complete!** ✅

