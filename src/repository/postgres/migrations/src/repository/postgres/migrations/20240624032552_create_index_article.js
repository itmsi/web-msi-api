/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(`
  CREATE INDEX web_article_article_schedule_idx ON public.web_article (article_schedule);
  CREATE INDEX web_article_article_category_id_idx ON public.web_article (article_category_id);
`);
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.raw(
    `DROP INDEX web_article_article_schedule_idx;
    DROP INDEX web_article_article_category_id_idx;`
  );
};
