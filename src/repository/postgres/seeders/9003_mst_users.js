/* eslint-disable implicit-arrow-linebreak */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
  // Deletes ALL existing entries
  const data = [
    {
      users_id: '73d05c65-1567-433b-83bb-4f5c4d692335',
      location_id: 'ccdf2a53-b7b8-4d37-9d65-d30753564baa',
      role_id: 'd91f74b0-2e7d-4f86-a1aa-727d6ea3ac21',
      username: 'admin',
      email: 'info@mail.com',
      password: 'b54488940d736f58f1b56a6299e59e56df08faaa9998e96399d8d19eed9d9d6ffaa1ddfaae4316db6a83a7c1069f333234aec5c1881bf198800bb24dcd7da03b358ad2c91d98eea900bb1da4f6d5959b79a7260a41c91c0b27490d1a2bc84e151f38c2be',
      salt: '4c13eafa25f826ca3a9f96c316005620',
      full_name: 'Administrator',
      jabatan: '',
      phone_number: '',
      status: '1',
      created_at: '2022-10-17 15:55:36.710 +0700',
      created_by: null,
      updated_at: null,
      updated_by: null,
      deleted_at: null,
      deleted_by: null
    }
  ]
  return knex('mst_users').del()
    .then(() =>
      // Inserts seed entries
      knex('mst_users').insert(data));
};
