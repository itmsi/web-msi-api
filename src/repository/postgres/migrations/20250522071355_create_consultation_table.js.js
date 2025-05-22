/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_consultation', (table) => {
    table.uuid('consultation_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('company_name', 200).nullable()
    table.string('username', 220).nullable()
    table.string('email', 220).nullable()
    table.string('phone', 220).nullable()
    table.string('mining_type', 220).nullable()
    table.string('wilayah', 220).nullable()
    table.text('message').nullable()
    table.string('product_name', 220).nullable()
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
  return knex.schema.dropTable('mst_consultation')
};
