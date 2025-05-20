/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_customer', (table) => {
    table.uuid('customer_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('customer_no', 50).notNull()
    table.string('first_name', 50).nullable()
    table.string('last_name', 50).nullable()
    table.string('email', 50).nullable()
    table.string('password', 255).nullable()
    table.string('mobile_phone', 50).nullable()
    table.date('registration_date').defaultTo(knex.fn.now())
    table.string('birthplace', 50).nullable()
    table.date('birthdate').nullable()
    table.string('ktp_no', 50).nullable()
    table.string('address', 255).nullable()
    table.string('company_name', 50).nullable()
    table.string('company_address', 255).nullable()
    table.string('company_phone', 50).nullable()
    table.string('npwp', 50).nullable()
    table.specificType('status', 'CHAR(1) DEFAULT 1').comment('1 = active, 0 = inactive');
    table.string('session', 255).nullable()
    table.string('otp_reset', 255).nullable()
    table.integer('customer_point').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.uuid('created_by')
    table.timestamp('updated_at')
    table.uuid('updated_by')
    table.timestamp('deleted_at')
    table.uuid('deleted_by')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('mst_customer')
};
