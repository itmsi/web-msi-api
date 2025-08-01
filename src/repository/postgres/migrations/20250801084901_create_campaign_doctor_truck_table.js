/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_campaign_participant', (table) => {
    table.uuid('campaign_participant_id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    table.string('participant_name', 200).nullable()
    table.string('participant_phone', 200).nullable()
    table.string('participant_company', 200).nullable()
    table.string('participant_department', 200).nullable()
    table.text('participant_description').nullable()
    table.text('participant_file_name_pdf').nullable()
    table.text('participant_file_name_img').nullable()
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
  return knex.schema.dropTable('mst_campaign_participant')
};
