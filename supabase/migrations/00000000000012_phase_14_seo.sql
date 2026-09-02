-- Phase 14: SEO Metadata

ALTER TABLE products 
ADD COLUMN meta_title VARCHAR(255),
ADD COLUMN meta_description TEXT;

ALTER TABLE categories 
ADD COLUMN meta_title VARCHAR(255),
ADD COLUMN meta_description TEXT;

ALTER TABLE brands 
ADD COLUMN meta_title VARCHAR(255),
ADD COLUMN meta_description TEXT;
