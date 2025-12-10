-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "trip_bookings" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trip_bookings_user_id_idx" ON "trip_bookings"("user_id");

-- CreateIndex
CREATE INDEX "trip_bookings_plan_id_idx" ON "trip_bookings"("plan_id");

-- CreateIndex
CREATE INDEX "trip_bookings_status_idx" ON "trip_bookings"("status");

-- AddForeignKey
ALTER TABLE "trip_bookings" ADD CONSTRAINT "trip_bookings_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "travel_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_bookings" ADD CONSTRAINT "trip_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
