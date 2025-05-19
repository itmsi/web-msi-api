/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('mst_news', (table) => {
    table.dropColumn('news_title')
    table.dropColumn('news_slug')
    table.dropColumn('news_content')
    table.dropColumn('news_meta_description')
    table.dropColumn('news_meta_keywords')
    table.dropColumn('news_meta_title')
    table.string('news_title_id', 200).nullable()
    table.string('news_title_en', 200).nullable()
    table.string('news_title_cn', 200).nullable()
    table.string('news_slug_id', 200).nullable()
    table.string('news_slug_en', 200).nullable()
    table.string('news_slug_cn', 200).nullable()
    table.text('news_content_id').nullable()
    table.text('news_content_en').nullable()
    table.text('news_content_cn').nullable()
    table.text('news_meta_description_id').nullable()
    table.text('news_meta_description_en').nullable()
    table.text('news_meta_description_cn').nullable()
    table.text('news_meta_keywords_id').nullable()
    table.text('news_meta_keywords_en').nullable()
    table.text('news_meta_keywords_cn').nullable()
    table.text('news_meta_title_id').nullable()
    table.text('news_meta_title_en').nullable()
    table.text('news_meta_title_cn').nullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('mst_news', (table) => {
    table.dropColumn('news_title_id')
    table.dropColumn('news_title_en')
    table.dropColumn('news_title_cn')
    table.dropColumn('news_slug_id')
    table.dropColumn('news_slug_en')
    table.dropColumn('news_slug_cn')
    table.dropColumn('news_content_id')
    table.dropColumn('news_content_en')
    table.dropColumn('news_content_cn')
    table.dropColumn('news_meta_description_id')
    table.dropColumn('news_meta_description_en')
    table.dropColumn('news_meta_description_cn')
    table.dropColumn('news_meta_keywords_id')
    table.dropColumn('news_meta_keywords_en')
    table.dropColumn('news_meta_keywords_cn')
    table.dropColumn('news_meta_title_id')
    table.dropColumn('news_meta_title_en')
    table.dropColumn('news_meta_title_cn')
    table.string('news_title', 200).nullable()
    table.string('news_slug', 200).nullable()
    table.text('news_content').nullable()
    table.text('news_meta_description').nullable()
    table.text('news_meta_keywords').nullable()
    table.text('news_meta_title').nullable()
  })
}
