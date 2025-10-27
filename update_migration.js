const fs = require('fs');
const newContent = `/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  // Membuat function untuk return JSON product detail
  return knex.schema.raw(\`
    CREATE OR REPLACE FUNCTION get_product_detail_json(
        p_type_slug VARCHAR,
        p_product_slug VARCHAR
    )
    RETURNS JSON AS $$
    BEGIN
        RETURN (
            WITH product_base AS (
                SELECT 
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
                    tp.type_product_name_id,
                    tp.type_product_name_en,
                    tp.type_product_name_cn,
                    tp.slug_type_product
                FROM mst_product p
                INNER JOIN mst_type_product tp 
                    ON p.type_product_id = tp.type_product_id 
                    AND tp.deleted_at IS NULL
                WHERE p.slug_product = p_product_slug
                    AND tp.slug_type_product = p_type_slug
                    AND p.deleted_at IS NULL
                LIMIT 1
            )
            SELECT 
                JSON_BUILD_OBJECT(
                    'product_id', pb.product_id,
                    'type_product_id', pb.type_product_id,
                    'product_name_id', pb.product_name_id,
                    'product_name_en', pb.product_name_en,
                    'product_name_cn', pb.product_name_cn,
                    'product_description_id', pb.product_description_id,
                    'product_description_en', pb.product_description_en,
                    'product_description_cn', pb.product_description_cn,
                    'banner_product', pb.banner_product,
                    'tagline_banner_product_id', pb.tagline_banner_product_id,
                    'tagline_banner_product_en', pb.tagline_banner_product_en,
                    'tagline_banner_product_cn', pb.tagline_banner_product_cn,
                    'image_product', pb.image_product,
                    'slug_product', pb.slug_product,
                    'type_product', JSON_BUILD_OBJECT(
                        'type_product_name_id', pb.type_product_name_id,
                        'type_product_name_en', pb.type_product_name_en,
                        'type_product_name_cn', pb.type_product_name_cn,
                        'slug_type_product', pb.slug_type_product
                    ),
                    'flayers', (
                        SELECT COALESCE(JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'flayer_product_id', fp.flayer_product_id,
                                'flayer_product_name_id', fp.flayer_product_name_id,
                                'flayer_product_name_en', fp.flayer_product_name_en,
                                'flayer_product_name_cn', fp.flayer_product_name_cn,
                                'flayer_product_description', fp.flayer_product_description,
                                'flayer_product_file', fp.flayer_product_file
                            )
                        ), '[]'::JSON)
                        FROM mst_flayer_product fp
                        WHERE fp.product_id = pb.product_id 
                            AND fp.deleted_at IS NULL
                    ),
                    'features', (
                        SELECT COALESCE(
                            JSON_AGG(
                                JSON_BUILD_OBJECT(
                                    'feature_product_id', f.feature_product_id,
                                    'feature_product_title_id', f.feature_product_title_id,
                                    'feature_product_title_en', f.feature_product_title_en,
                                    'feature_product_title_cn', f.feature_product_title_cn,
                                    'feature_product_description_id', f.feature_product_description_id,
                                    'feature_product_description_en', f.feature_product_description_en,
                                    'feature_product_description_cn', f.feature_product_description_cn,
                                    'no_order', f.no_order,
                                    'feature_children', (
                                        SELECT COALESCE(JSON_AGG(
                                            JSON_BUILD_OBJECT(
                                                'feature_child_product_id', fc.feature_child_product_id,
                                                'feature_child_product_title_id', fc.feature_child_product_title_id,
                                                'feature_child_product_title_en', fc.feature_child_product_title_en,
                                                'feature_child_product_title_cn', fc.feature_child_product_title_cn,
                                                'feature_child_product_description_id', fc.feature_child_product_description_id,
                                                'feature_child_product_description_en', fc.feature_child_product_description_en,
                                                'feature_child_product_description_cn', fc.feature_child_product_description_cn,
                                                'feature_child_product_image', fc.feature_child_product_image
                                            )
                                        ), '[]'::JSON)
                                        FROM mst_feature_child_product fc
                                        WHERE fc.feature_product_id = f.feature_product_id
                                            AND fc.deleted_at IS NULL
                                    )
                                )
                                ORDER BY f.no_order
                            ),
                            '[]'::JSON
                        )
                        FROM mst_feature_product f
                        WHERE f.product_id = pb.product_id 
                            AND f.deleted_at IS NULL
                    ),
                    'galleries', (
                        SELECT COALESCE(JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'gallery_product_id', g.gallery_product_id,
                                'gallery_product_image', g.gallery_product_image
                            )
                        ), '[]'::JSON)
                        FROM mst_gallery_product g
                        WHERE g.product_id = pb.product_id 
                            AND g.deleted_at IS NULL
                    ),
                    'product_360', (
                        SELECT JSON_BUILD_OBJECT(
                            'interior', (
                                SELECT COALESCE(JSON_OBJECT_AGG(sub_type_name, product_360_image), '{}'::JSON)
                                FROM mst_360_product
                                WHERE product_id = pb.product_id
                                    AND product_360_type = 'interior'
                                    AND deleted_at IS NULL
                            ),
                            'exterior', (
                                SELECT COALESCE(JSON_AGG(JSON_BUILD_OBJECT('product_360_id', product_360_id, 'product_360_image', product_360_image)), '[]'::JSON)
                                FROM mst_360_product
                                WHERE product_id = pb.product_id
                                    AND product_360_type = 'exterior'
                                    AND deleted_at IS NULL
                            ),
                            'default', (
                                SELECT COALESCE(JSON_AGG(product_360_image), '[]'::JSON)
                                FROM mst_360_product
                                WHERE product_id = pb.product_id
                                    AND product_360_type NOT IN ('interior', 'exterior')
                                    AND deleted_at IS NULL
                            )
                        )
                    )
                )
            FROM product_base pb
        );
    END;
    $$ LANGUAGE plpgsql;
  \`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw('DROP FUNCTION IF EXISTS get_product_detail_json(VARCHAR, VARCHAR)');
};`;

fs.writeFileSync(
  'src/repository/postgres/migrations/20250110000001_create_product_detail_function.js',
  newContent
);

console.log('✅ Migration file updated!');

