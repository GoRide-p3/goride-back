-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RideRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rideId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "boardingAddress" TEXT,
    "boardingLat" REAL,
    "boardingLng" REAL,
    "boardingTime" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "seenBoardingModal" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "RideRequest_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RideRequest_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RideRequest" ("boardingAddress", "boardingLat", "boardingLng", "boardingTime", "createdAt", "id", "passengerId", "rideId", "status", "updatedAt") SELECT "boardingAddress", "boardingLat", "boardingLng", "boardingTime", "createdAt", "id", "passengerId", "rideId", "status", "updatedAt" FROM "RideRequest";
DROP TABLE "RideRequest";
ALTER TABLE "new_RideRequest" RENAME TO "RideRequest";
CREATE INDEX "RideRequest_rideId_idx" ON "RideRequest"("rideId");
CREATE INDEX "RideRequest_passengerId_idx" ON "RideRequest"("passengerId");
CREATE INDEX "RideRequest_status_idx" ON "RideRequest"("status");
CREATE UNIQUE INDEX "RideRequest_rideId_passengerId_key" ON "RideRequest"("rideId", "passengerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
