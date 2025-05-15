/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('mst_banner', (table) => {
    table.integer('status_banner').nullable().comment('Status banner 1: aktif, 2: non aktif').defaultTo(1)
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('mst_banner', (table) => {
    table.dropColumn('status_banner')
  })
}
