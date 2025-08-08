/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_email_employee', (table) => {
    table.uuid('email_employee_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('email_employee_name', 200).nullable()
    table.string('email_employee_email', 200).nullable()
    table.string('email_employee_alias', 200).nullable()
    table.text('email_employee_description').nullable()
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
  return knex.schema.dropTable('mst_email_employee')
};
