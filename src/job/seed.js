const fs = require('fs')
const path = require('path')
const { pgCore } = require('../config');

const dataPermission = JSON.parse(fs.readFileSync(path.join('./src/repository/postgres/seeders', 'mst_permission.json'), 'utf8'));
const dataPermissionMenu = JSON.parse(fs.readFileSync(path.join('./src/repository/postgres/seeders', 'mst_menu_has_permissions.json'), 'utf8'));
const runSeed = async () => {
  console.info('--------- running seeder ---------')
  try {
    await pgCore.raw('TRUNCATE TABLE mst_permissions RESTART IDENTITY CASCADE;')
    await pgCore.raw('TRUNCATE TABLE mst_menu_has_permissions RESTART IDENTITY CASCADE;')
    await pgCore('mst_permissions').insert(dataPermission)
    await pgCore('mst_menu_has_permissions').insert(dataPermissionMenu)
    console.info('seed run')
    process.exit(0)
  } catch (error) {
    console.info('seed run error', error)
    process.exit(0)
  }
}

runSeed()
