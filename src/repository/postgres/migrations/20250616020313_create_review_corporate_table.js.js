/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_review', (table) => {
    table.uuid('review_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('review_name', 200).nullable()
    table.string('review_email', 200).nullable()
    table.string('review_location', 200).nullable()
    table.string('review_type_of_review', 200).nullable()
    table.string('review_description', 200).nullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.uuid('created_by').nullable()
    table.timestamp('updated_at').nullable()
    table.uuid('updated_by').nullable()
    table.timestamp('deleted_at').nullable()
    table.uuid('deleted_by').nullable()
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('mst_review')
};
