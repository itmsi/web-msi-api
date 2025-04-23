exports.up = function (knex) {
  return knex.schema.createTable("mst_role", (table) => {
    table.uuid("role_id").defaultTo(knex.raw("uuid_generate_v4()")).primary();
    table.string("role_name", 100).unique();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.uuid("created_by");
    table.timestamp("updated_at");
    table.uuid("updated_by");
    table.timestamp("deleted_at");
    table.uuid("deleted_by");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("mst_role");
};
