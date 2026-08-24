-- Replace the timestamped shot list with a single caption describing the clip.
--
-- Each clip shows one space rather than a walkthrough, so a timestamped list
-- would have to be invented. `videoCaption` says what the room on screen is.
--
-- The new column is required, and the table already holds rows, so it is added
-- with a temporary empty default and the default is then dropped. Written this
-- way so the migration is safe to run against a database that already has data
-- rather than only against one that can be wiped and reseeded.
ALTER TABLE "Property" DROP COLUMN "shotList";
ALTER TABLE "Property" ADD COLUMN "videoCaption" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Property" ALTER COLUMN "videoCaption" DROP DEFAULT;
