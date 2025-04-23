/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_admin_menu', (table) => {
    table.increments('menu_id').primary();
    table.bigint('parent', 14).nullable()
    table.string('menu_name', 50).nullable()
    table.string('permission_name').nullable()
    table.string('menu_url', 255).nullable()
    table.integer('menu_status', 20).nullable()
    table.integer('menu_sort', 20).nullable()
    table.string('menu_icon', 150).defaultTo('far fa-circle nav-icon')
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
  return knex.schema.dropTable('mst_admin_menu');
};
