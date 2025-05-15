/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('mst_banner', (table) => {
    table.dropColumn('title_banner')
    table.string('banner_tagline_cn', 100).nullable().comment('Banner tagline cn')
    table.string('banner_tagline_en', 100).nullable().comment('Banner tagline en')
    table.string('banner_tagline_id', 100).nullable().comment('Banner tagline id')
    table.string('title_banner_id', 100).nullable().comment('Title banner id')
    table.string('title_banner_en', 100).nullable().comment('Title banner en')
    table.string('title_banner_cn', 100).nullable().comment('Title banner cn')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('mst_banner', (table) => {
    table.string('title_banner', 100).nullable().comment('Title banner')
    table.dropColumn('banner_tagline_cn')
    table.dropColumn('banner_tagline_en')
    table.dropColumn('banner_tagline_id')
    table.dropColumn('title_banner_id')
    table.dropColumn('title_banner_en')
    table.dropColumn('title_banner_cn')
  })
};
