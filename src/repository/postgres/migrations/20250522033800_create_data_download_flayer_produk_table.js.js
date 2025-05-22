/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('data_download_flayer_produk', (table) => {
    table.uuid('data_download_flayer_produk_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('company_name', 200).nullable()
    table.string('email', 220).nullable()
    table.string('phone', 220).nullable()
    table.string('approve', 220).nullable()
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
  return knex.schema.dropTable('data_download_flayer_produk')
};
