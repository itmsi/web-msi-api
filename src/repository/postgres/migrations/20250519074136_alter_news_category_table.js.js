/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('mst_news_category', (table) => {
    table.dropColumn('news_category_name')
    table.string('news_category_name_id', 200).nullable()
    table.string('news_category_name_en', 200).nullable()
    table.string('news_category_name_cn', 200).nullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('mst_news_category', (table) => {
    table.dropColumn('news_category_name_id')
    table.dropColumn('news_category_name_en')
    table.dropColumn('news_category_name_cn')
    table.string('news_category_name').nullable()
  })
}
