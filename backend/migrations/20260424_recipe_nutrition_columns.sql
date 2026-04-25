DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'recipe_nutrition'
          AND column_name = 'fat'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'recipe_nutrition'
          AND column_name = 'fats'
    ) THEN
        ALTER TABLE recipe_nutrition RENAME COLUMN fat TO fats;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'recipe_nutrition'
          AND column_name = 'fiber'
    ) THEN
        ALTER TABLE recipe_nutrition ADD COLUMN fiber DECIMAL(10, 2);
    END IF;
END $$;
