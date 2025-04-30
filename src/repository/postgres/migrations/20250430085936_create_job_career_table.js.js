/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_job_career', (table) => {
    table
      .uuid('job_career_id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary();
    table.string('job_career_name', 100).notNullable()
    table.uuid('departement_id').references('mst_departement.departement_id')
    table.uuid('location_id').references('mst_location.location_id')
    table.text('job_career_content').notNullable()
    table.string('job_career_description', 100).nullable()
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
  return knex.schema.dropTable('mst_job_career');
};
