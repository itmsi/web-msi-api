const { pgCore } = require('../../config/database')
const {
  mappingSuccess, mappingError, manipulateDate, ROLE
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_admin_menu'
const TABLE_HEADING = 'mst_heading_admin_menu'
const COLUMN = [
  'menu_id', 'parent', 'menu_name', 'menu_url', 'menu_status', 'menu_sort', 'menu_icon', 'permission_name', `${TABLE_HEADING}.nama_heading`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`, `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]
const COLUMN_HEADING = [
  'nama_heading'
]
const DEFAULT_SORT = [COLUMN[5], 'ASC']
const condition = (builder, where,) => {
  builder.where(where)
  builder.andWhere('menu_status', 1)
  builder.andWhere(`${TABLE}.deleted_at`, null)
  return builder
}
/**
 *
 *
 * @param {*} where
 * @param {*} search
 * @return {*}
 */
const get = async (where, role, column = COLUMN) => {
  try {
    let result = {}
    if (role === ROLE.ADMIN) {
      const data = await pgCore(TABLE).select(column, COLUMN_HEADING)
        .leftJoin(TABLE_HEADING, `${TABLE}.heading_admin_menu_id`, `${TABLE_HEADING}.heading_admin_menu_id`)
        .where((builder) => {
          condition(builder, where)
        })
        .orderBy(DEFAULT_SORT[0], DEFAULT_SORT[1])

      result = manipulateDate(data)
    } else {
      const data = await pgCore.raw(`select mam.menu_id ,mam.parent ,mam.menu_url, mam.menu_status, mam.menu_sort,
      mam.menu_icon, mam.menu_name, mp.name, mhm.nama_heading from mst_admin_menu mam
      left join mst_role_has_permissions mrhp on mam.menu_id = mrhp.menu_id and mrhp.role_id = (
        select role_id from mst_role where role_name = '${role}'
      )
      inner join mst_permissions mp on mrhp.permission_id = mp.id and mp."name" ='read'
      left join mst_heading_admin_menu mhm on mam.heading_admin_menu_id = mhm.heading_admin_menu_id
      where mam.menu_status = 1 and mam.deleted_at is null ORDER BY mam.menu_sort ASC`)

      result = manipulateDate(data.rows)
    }
    return mappingSuccess(lang.__('get.success'), result)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

const getAccess = async (req) => {
  try {
    let where = ''
    if (req?.query?.role_id) {
      where = `AND mrhp.role_id = '${req?.query?.role_id}'`
    }
    const result = await pgCore.raw(`select distinct
    mmhp.id,
    mmhp.menu_id ,
    mmhp.permission_id,
    mam.menu_id,
    mam.parent,
    mam.menu_name,
    mam.permission_name,
    mp.name,
    case when mrhp.id is null
    then '0' else '1' end as checked,
    mrhp.id as role_permission_id
    from mst_menu_has_permissions mmhp
    inner join mst_permissions mp on mmhp.permission_id = mp.id
    inner join mst_admin_menu mam on mmhp.menu_id  = mam.menu_id
    left join mst_role_has_permissions mrhp on mmhp.permission_id = mrhp.permission_id AND mmhp.menu_id = mrhp.menu_id ${where}`)
    return mappingSuccess(lang.__('get.success'), result?.rows)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  get,
  COLUMN,
  getAccess,
  DEFAULT_SORT
}
