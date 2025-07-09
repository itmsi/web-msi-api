/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('mst_product_dimensi', (table) => {
    table.string('product_flayer', 200).nullable();
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('mst_product_dimensi', (table) => {
    table.dropColumn('product_flayer');
  })
};
