/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_feature_child_product', (table) => {
    table.uuid('feature_child_product_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('feature_product_id').references('mst_feature_product.feature_product_id').nullable()
    table.string('feature_child_product_title_id', 200).nullable()
    table.string('feature_child_product_title_en', 200).nullable()
    table.string('feature_child_product_title_cn', 200).nullable()
    table.text('feature_child_product_description_id').nullable()
    table.text('feature_child_product_description_en').nullable()
    table.text('feature_child_product_description_cn').nullable()
    table.text('feature_child_product_image').nullable()
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
  return knex.schema.dropTable('mst_feature_child_product')
};
