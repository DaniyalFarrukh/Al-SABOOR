-- Phase 2 Seed Data

-- We use DO blocks with exceptions or simple INSERT ON CONFLICT DO NOTHING to avoid breaking if run multiple times.

DO $$
DECLARE
    cat_id UUID;
    subcat_id UUID;
    brand_id UUID;
    bike_mfg_id UUID;
    bike_model_id UUID;
    bike_gen_id UUID;
    bike_year_id UUID;
    prod_id UUID;
    var_carbon_id UUID;
    var_titanium_id UUID;
BEGIN
    -- 1. Category & Subcategory
    INSERT INTO categories (name, slug, description) 
    VALUES ('Motorcycle Parts', 'motorcycle-parts', 'General parts')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO cat_id;

    INSERT INTO categories (name, slug, description, parent_id) 
    VALUES ('Exhausts', 'exhausts', 'Performance Exhausts', cat_id)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO subcat_id;

    -- 2. Brand
    INSERT INTO brands (name, slug, description)
    VALUES ('Akrapovic', 'akrapovic', 'Premium Performance Exhausts')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO brand_id;

    -- 3. Bike Fitment
    INSERT INTO bike_manufacturers (name, slug)
    VALUES ('Honda', 'honda')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO bike_mfg_id;

    INSERT INTO bike_models (manufacturer_id, name, slug)
    VALUES (bike_mfg_id, 'CG 125', 'cg-125')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO bike_model_id;

    INSERT INTO bike_generations (model_id, name, start_year, end_year)
    VALUES (bike_model_id, 'Euro 2', 2012, NULL)
    RETURNING id INTO bike_gen_id;

    INSERT INTO bike_years (generation_id, year)
    VALUES (bike_gen_id, 2023)
    ON CONFLICT (generation_id, year) DO UPDATE SET year = EXCLUDED.year
    RETURNING id INTO bike_year_id;

    -- 4. Product
    INSERT INTO products (name, slug, sku, brand_id, category_id, description, seo_title, is_featured)
    VALUES ('Akrapovic Slip-On Line (Carbon)', 'akrapovic-slip-on-carbon', 'AKR-SLIP-001', brand_id, subcat_id, 'Premium carbon fiber slip-on exhaust.', 'Buy Akrapovic Slip-On Carbon', true)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO prod_id;

    -- 5. Product Pricing & Inventory (Base)
    INSERT INTO product_pricing (product_id, retail_price, cost_price)
    VALUES (prod_id, 45000.00, 30000.00);

    INSERT INTO inventory (product_id, quantity)
    VALUES (prod_id, 10);

    -- 6. Product Variants
    INSERT INTO product_variants (product_id, sku, name, options)
    VALUES (prod_id, 'AKR-SLIP-001-C', 'Carbon Fiber', '{"material": "carbon"}')
    ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO var_carbon_id;

    INSERT INTO product_variants (product_id, sku, name, price_override, options)
    VALUES (prod_id, 'AKR-SLIP-001-T', 'Titanium', 55000.00, '{"material": "titanium"}')
    ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO var_titanium_id;

    -- 7. Compatibility
    -- Fits the entire CG 125 model
    INSERT INTO product_compatibility (product_id, bike_model_id)
    VALUES (prod_id, bike_model_id);

END $$;
