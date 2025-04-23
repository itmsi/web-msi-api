exports.up = function (knex) {
  return knex.schema.createTable('mst_users', (table) => {
    table.uuid('users_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('location_id')
      .references('location_id').inTable('mst_location').notNull()
      .onDelete('CASCADE')
    table.uuid('role_id')
      .references('role_id').inTable('mst_role').notNull()
      .onDelete('CASCADE')
    table.string('username', 100).unique()
    table.string('email', 100)
    table.string('password', 220)
    table.string('salt', 120)
    table.string('full_name', 100)
    table.string('jabatan', 50)
    table.string('phone_number', 20)
    table.specificType('status', 'CHAR(1) DEFAULT 1').comment('1 = active, 0 = inactive');
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
  return knex.schema.dropTable('mst_users');
};
