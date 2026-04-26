
-- Add custom_meal_name to meal_plans table
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS custom_meal_name VARCHAR(255);

-- Ensure recipe_id is nullable (it should be already, but let's be explicit if needed)
-- ALTER TABLE meal_plans ALTER COLUMN recipe_id DROP NOT NULL;
