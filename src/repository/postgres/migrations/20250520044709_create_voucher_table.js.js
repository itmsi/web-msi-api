/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_voucher', (table) => {
    table.uuid('voucher_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('voucher_code', 200).nullable()
    table.string('voucher_name', 220).nullable()
    table.string('voucher_description', 220).nullable()
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
  return knex.schema.dropTable('mst_voucher')
};
