/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_product_model', (table) => {
    table.uuid('product_model_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('product_id').references('mst_product.product_id').nullable()
    table.string('product_model_name', 200).nullable()
    table.string('product_model_description', 200).nullable()
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
  return knex.schema.dropTable('mst_product_model')
};
