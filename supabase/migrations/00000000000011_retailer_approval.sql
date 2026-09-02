-- Phase 11: Retailer Approval Logic

-- 1. Add is_approved column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- Note: We default to true so that standard B2C customers can login immediately.
-- For B2B Retailers, the application code will explicitly set this to false upon registration.
