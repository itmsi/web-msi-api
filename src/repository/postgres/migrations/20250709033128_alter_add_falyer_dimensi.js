/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'mst_product_dimensi' 
        AND column_name = 'product_flayer'
      ) THEN
        ALTER TABLE mst_product_dimensi ADD COLUMN product_flayer varchar(200) null;
      END IF;
    END $$;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('mst_product_dimensi', (table) => {
    table.dropColumn('product_flayer');
  })
};
