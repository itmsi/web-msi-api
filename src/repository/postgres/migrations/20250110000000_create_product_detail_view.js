/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // Membuat view untuk product detail
  return knex.schema.raw(`
    CREATE OR REPLACE VIEW view_product_detail AS
    SELECT 
        -- Product Fields
        p.product_id,
        p.type_product_id,
        p.product_name_id,
        p.product_name_en,
        p.product_name_cn,
        p.product_description_id,
        p.product_description_en,
        p.product_description_cn,
        p.banner_product,
        p.tagline_banner_product_id,
        p.tagline_banner_product_en,
        p.tagline_banner_product_cn,
        p.image_product,
        p.slug_product,
        
        -- Type Product Fields
        tp.type_product_name_id,
        tp.type_product_name_en,
        tp.type_product_name_cn,
        tp.slug_type_product,
        
        -- Flayer Product Fields
        fp.flayer_product_id,
        fp.flayer_product_name_id,
        fp.flayer_product_name_en,
        fp.flayer_product_name_cn,
        fp.flayer_product_description,
        fp.flayer_product_file,
        
        -- Feature Product Fields
        f.feature_product_id,
        f.feature_product_title_id,
        f.feature_product_title_en,
        f.feature_product_title_cn,
        f.feature_product_description_id,
        f.feature_product_description_en,
        f.feature_product_description_cn,
        f.no_order,
        
        -- Feature Child Product Fields
        fc.feature_child_product_id,
        fc.feature_child_product_title_id,
        fc.feature_child_product_title_en,
        fc.feature_child_product_title_cn,
        fc.feature_child_product_description_id,
        fc.feature_child_product_description_en,
        fc.feature_child_product_description_cn,
        fc.feature_child_product_image,
        
        -- Gallery Product Fields
        g.gallery_product_id,
        g.gallery_product_image,
        
        -- 360 Product Fields
        p360.product_360_id,
        p360.product_360_image,
        p360.product_360_type,
        p360.sub_type_name
        
    FROM mst_product p
    
    LEFT JOIN mst_type_product tp 
        ON p.type_product_id = tp.type_product_id 
        AND tp.deleted_at IS NULL
    
    LEFT JOIN mst_flayer_product fp 
        ON p.product_id = fp.product_id 
        AND fp.deleted_at IS NULL
    
    LEFT JOIN mst_feature_product f 
        ON p.product_id = f.product_id 
        AND f.deleted_at IS NULL
    
    LEFT JOIN mst_feature_child_product fc 
        ON f.feature_product_id = fc.feature_product_id 
        AND fc.deleted_at IS NULL
    
    LEFT JOIN mst_gallery_product g 
        ON p.product_id = g.product_id 
        AND g.deleted_at IS NULL
    
    LEFT JOIN mst_360_product p360 
        ON p.product_id = p360.product_id 
        AND p360.deleted_at IS NULL
    
    WHERE p.deleted_at IS NULL
    
    ORDER BY f.no_order ASC, p.product_id ASC;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw('DROP VIEW IF EXISTS view_product_detail');
};

