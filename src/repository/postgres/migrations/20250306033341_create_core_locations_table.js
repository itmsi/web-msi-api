exports.up = function (knex) {
  return knex.schema.createTable('mst_location', (table) => {
    table
      .uuid('location_id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary();
    table.string('location_code', 100).nullable();
    table.string('location_name', 100);
    table.string('location_account_number', 25);
    table.string('location_code_inventory', 10);
    table.string('location_code_accounting', 10);
    table.enum('location_type', ['car', 'bike', 'car and bike']);
    table.string('location_detail', 100);
    table
      .specificType('location_status', 'CHAR(1) DEFAULT 1')
      .comment('1 = active, 0 = inactive');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.timestamp('updated_at');
    table.uuid('updated_by');
    table.timestamp('deleted_at');
    table.uuid('deleted_by');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('mst_location');
};
