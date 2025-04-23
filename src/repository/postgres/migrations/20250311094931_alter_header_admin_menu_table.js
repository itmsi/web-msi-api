/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('mst_admin_menu', (table) => {
        table.integer('heading_admin_menu_id')
            .references('heading_admin_menu_id').inTable('mst_heading_admin_menu').nullable()
            .onDelete('CASCADE')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('mst_admin_menu', (table) => {
        table.dropColumn('heading_admin_menu_id');
    })
};
