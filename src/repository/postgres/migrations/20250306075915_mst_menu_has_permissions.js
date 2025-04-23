/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_menu_has_permissions', (table) => {
    table.increments('id').primary();
    table.integer('menu_id').notNullable();
    table.integer('permission_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by')
    table.timestamp('updated_at')
    table.uuid('updated_by')
    table.timestamp('deleted_at')
    table.uuid('deleted_by')

    table.foreign('menu_id').references('menu_id').inTable('mst_admin_menu');
    table.foreign('permission_id').references('id').inTable('mst_permissions');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('mst_menu_has_permissions');
};
