/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('mst_career_apply', (table) => {
    table
      .uuid('career_apply_id')
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary();
    table.uuid('job_career_id').references('mst_job_career.job_career_id').nullable()
    table.uuid('departement_id').references('mst_departement.departement_id').nullable()
    table.uuid('location_area_id').references('mst_location_area.location_area_id').nullable()
    table.uuid('religion_id').references('mst_religion.religion_id').nullable()
    table.uuid('marital_status_id').references('mst_marital_status.marital_status_id').nullable()
    table.uuid('degree_id').references('mst_degree.degree_id').nullable()
    table.uuid('province_id').references('mst_province.province_id').nullable()
    table.uuid('city_id').references('mst_city.city_id').nullable()
    table.string('career_apply_name', 100).nullable()
    table.string('career_apply_nik', 100).nullable()
    table.date('career_apply_birth_date').nullable()
    table.string('career_apply_email', 100).nullable()
    table.string('career_apply_phone', 100).nullable()
    table.string('career_apply_gender', 100).nullable()
    table.string('career_apply_street', 100).nullable()
    table.string('career_apply_university', 100).nullable()
    table.string('career_apply_faculty', 100).nullable()
    table.string('career_apply_gpa', 100).nullable()
    table.date('career_apply_graduation_date').nullable()
    table.string('career_apply_cv', 100).nullable()
    table.string('career_apply_description', 100).nullable()
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
  return knex.schema.dropTable('mst_career_apply');
};
