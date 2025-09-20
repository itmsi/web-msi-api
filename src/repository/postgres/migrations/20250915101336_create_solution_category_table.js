/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_solution_category', (table) => {
    table
      .uuid('solution_category_id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary();
    table.string('solution_category_name_id').nullable().comment('Solution category name in Indonesian');
    table.string('solution_category_name_en').nullable().comment('Solution category name in English');
    table.string('solution_category_name_cn').nullable().comment('Solution category name in Chinese');
    table.text('solution_category_description').nullable().comment('Solution category description');
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
  return knex.schema.dropTable('mst_solution_category');
};
