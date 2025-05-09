/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_member', (table) => {
    table.uuid('member_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('member_name', 100).unique()
    table.string('member_email', 100).nullable()
    table.string('member_password', 220).nullable()
    table.string('member_full_name', 100).nullable()
    table.string('member_phone_number', 20).nullable()
    table.string('member_approval_status', 20).nullable()
    table.string('member_description', 220).nullable()
    table.specificType('status', 'CHAR(1) DEFAULT 1').comment('1 = active, 0 = inactive');
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
  return knex.schema.dropTable('mst_member')
};
