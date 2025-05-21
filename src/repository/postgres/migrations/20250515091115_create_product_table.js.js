/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_product', (table) => {
    table.uuid('product_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('type_product_id').references('mst_type_product.type_product_id').nullable()
    table.string('product_name_id', 200).nullable()
    table.string('product_name_en', 200).nullable()
    table.string('product_name_cn', 200).nullable()
    table.string('banner_product', 200).nullable().comment('Banner product');
    table.string('tagline_banner_product_id', 200).nullable().comment('Tagline product');
    table.string('tagline_banner_product_en', 200).nullable().comment('Tagline product');
    table.string('tagline_banner_product_cn', 200).nullable().comment('Tagline product');
    table.string('image_product', 200).nullable().comment('Image product');
    table.text('product_description_id').nullable().comment('Description product');
    table.text('product_description_en').nullable().comment('Description product');
    table.text('product_description_cn').nullable().comment('Description product');
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.uuid('created_by').nullable()
    table.timestamp('updated_at').nullable()
    table.uuid('updated_by').nullable()
    table.timestamp('deleted_at').nullable()
    table.uuid('deleted_by').nullable()
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('mst_product')
};
