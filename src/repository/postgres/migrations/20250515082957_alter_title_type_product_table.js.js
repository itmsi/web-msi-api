/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('mst_type_product', (table) => {
    table.dropColumn('type_product_name')
    table.string('type_product_name_id', 200).nullable()
    table.string('type_product_name_en', 200).nullable()
    table.string('type_product_name_cn', 200).nullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('mst_type_product', (table) => {
    table.dropColumn('type_product_name_id')
    table.dropColumn('type_product_name_en')
    table.dropColumn('type_product_name_cn')
  })
}
