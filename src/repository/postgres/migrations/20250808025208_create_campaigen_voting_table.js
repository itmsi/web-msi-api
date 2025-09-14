/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function up(knex) {
  return knex.schema.createTable('mst_campaigen_voting', (table) => {
    table.uuid('campaigen_voting_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.uuid('email_employee_id').nullable();
    table.uuid('campaign_participant_id').notNullable();
    table.string('campaigen_voting_email', 200).nullable();
    table.text('campaigen_voting_description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.uuid('created_by').nullable();
    table.timestamp('updated_at').nullable();
    table.uuid('updated_by').nullable();
    table.timestamp('deleted_at').nullable();
    table.uuid('deleted_by').nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function down(knex) {
  return knex.schema.dropTable('mst_campaigen_voting');
}

