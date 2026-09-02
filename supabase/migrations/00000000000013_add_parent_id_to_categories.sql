-- Migration to ensure parent_id exists for subcategory hierarchy (2-level max)
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;

-- Note: Existing RLS policies on 'categories' do not need modification 
-- for this column addition as they do not strictly filter by column.
