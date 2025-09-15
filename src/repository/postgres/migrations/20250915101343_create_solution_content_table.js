/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_solution_content', (table) => {
    table
      .uuid('solution_content_id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary();
    table.uuid('solution_category_id').nullable().comment('Foreign key to mst_solution_category');
    table.string('solution_image', 255).nullable().comment('Solution image file path');
    table.string('solution_image_caption', 255).nullable().comment('Solution image caption');
    table.string('solution_image_alt', 255).nullable().comment('Solution image alt text');
    table.string('solution_image_title', 255).nullable().comment('Solution image title');
    table.text('solution_image_description').nullable().comment('Solution image description');
    table.text('solution_image_keywords').nullable().comment('Solution image keywords');
    table.text('solution_image_tags').nullable().comment('Solution image tags');
    table.enum('solution_status', ['draft', 'published', 'archived']).defaultTo('draft').comment('Solution status');
    table.timestamp('solution_published_at').nullable().comment('Solution published date');
    table.string('solution_title_id', 255).nullable().comment('Solution title in Indonesian');
    table.string('solution_title_en', 255).nullable().comment('Solution title in English');
    table.string('solution_title_cn', 255).nullable().comment('Solution title in Chinese');
    table.string('solution_slug_id', 255).nullable().comment('Solution slug in Indonesian');
    table.string('solution_slug_en', 255).nullable().comment('Solution slug in English');
    table.string('solution_slug_cn', 255).nullable().comment('Solution slug in Chinese');
    table.text('solution_content_body_id').nullable().comment('Solution content body in Indonesian');
    table.text('solution_content_body_en').nullable().comment('Solution content body in English');
    table.text('solution_content_body_cn').nullable().comment('Solution content body in Chinese');
    table.text('solution_meta_description_id').nullable().comment('Solution meta description in Indonesian');
    table.text('solution_meta_description_en').nullable().comment('Solution meta description in English');
    table.text('solution_meta_description_cn').nullable().comment('Solution meta description in Chinese');
    table.text('solution_meta_keywords_id').nullable().comment('Solution meta keywords in Indonesian');
    table.text('solution_meta_keywords_en').nullable().comment('Solution meta keywords in English');
    table.text('solution_meta_keywords_cn').nullable().comment('Solution meta keywords in Chinese');
    table.string('solution_meta_title_id', 255).nullable().comment('Solution meta title in Indonesian');
    table.string('solution_meta_title_en', 255).nullable().comment('Solution meta title in English');
    table.string('solution_meta_title_cn', 255).nullable().comment('Solution meta title in Chinese');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by');
    table.timestamp('updated_at');
    table.uuid('updated_by');
    table.timestamp('deleted_at');
    table.uuid('deleted_by');

    // Add foreign key constraint
    table.foreign('solution_category_id').references('solution_category_id').inTable('mst_solution_category').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('mst_solution_content');
};
