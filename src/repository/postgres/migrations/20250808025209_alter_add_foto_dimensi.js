/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('mst_product_dimensi', (table) => {
    table.text('product_dimensi_foto').nullable();
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('mst_product_dimensi', (table) => {
    table.dropColumn('product_dimensi_foto');
  })
};
