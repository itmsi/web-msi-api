/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_contact_us_user', (table) => {
    table
      .uuid('contact_us_user_id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary();
    table.string('contact_us_user_name_first', 100).notNullable()
    table.string('contact_us_user_name_last', 100).notNullable()
    table.string('contact_us_user_subject', 100).notNullable()
    table.string('contact_us_user_email', 100).notNullable()
    table.text('contact_us_user_message').notNullable()
    table.string('contact_us_user_description', 100).nullable()
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

};
