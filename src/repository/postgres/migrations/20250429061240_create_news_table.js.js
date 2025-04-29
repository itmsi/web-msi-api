/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_news', (table) => {
    table
      .uuid('news_id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary();
    table.string('news_title', 100).notNullable()
    table.string('news_slug', 100).notNullable()
    table.text('news_content').notNullable()
    table.uuid('news_category_id').references('mst_news_category.news_category_id')
    table.string('news_image', 100).nullable()
    table.string('news_image_caption', 100).nullable()
    table.string('news_image_alt', 100).nullable()
    table.string('news_image_title', 100).nullable()
    table.string('news_image_description', 100).nullable()
    table.string('news_image_keywords', 100).nullable()
    table.string('news_image_tags', 100).nullable()
    table.string('news_meta_description', 100).nullable()
    table.string('news_meta_keywords', 100).nullable()
    table.string('news_meta_title', 100).nullable()
    table.string('news_status', 100).nullable() // 1 publish, 0 draft
    table.timestamp('news_published_at').nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.timestamp('updated_at');
    table.uuid('updated_by');
    table.timestamp('deleted_at');
    table.uuid('deleted_by');
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('mst_news')
};
