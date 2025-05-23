/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('member_vouchers', (table) => {
    table.uuid('member_voucher_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('member_id').nullable()
    table.uuid('voucher_id').nullable();
    table.date('expired_date').nullable();
    table.specificType('status_approve', 'CHAR(1) DEFAULT 0').comment('0 = pending, 1 = approved, 2 = rejected');
    table.text('description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('member_vouchers');
};
