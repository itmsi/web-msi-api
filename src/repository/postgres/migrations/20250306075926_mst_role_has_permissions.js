/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_role_has_permissions', (table) => {
    table.increments('id').primary();
    table.uuid('role_id').notNullable();
    table.integer('permission_id').notNullable();
    table.integer('menu_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by')
    table.timestamp('updated_at')
    table.uuid('updated_by')
    table.timestamp('deleted_at')
    table.uuid('deleted_by')

    table.foreign('role_id').references('role_id').inTable('mst_role');
    table.foreign('permission_id').references('id').inTable('mst_permissions');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('mst_role_has_permissions');
};
