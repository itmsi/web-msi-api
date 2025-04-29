/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_banner', (table) => {
    table
      .uuid('banner_id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary();
    table.string('title_banner', 100).nullable().comment('Title banner');
    table.string('file_banner', 100).nullable().comment('File banner');
    table.string('link_banner', 100).nullable().comment('Link banner');
    table.string('description_banner', 100).nullable().comment('Description banner');
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
  return knex.schema.dropTable('mst_banner');
};
