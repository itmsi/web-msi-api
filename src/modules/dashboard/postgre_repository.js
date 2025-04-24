const { pgCore } = require('../../config/database')
const {
  customDateFormat,
  mappingError,
  mappingSuccessPagination,
} = require('../../utils')
const { lang } = require('../../lang');

const getUnit = async (where) => {
  const dataCar = await pgCore.raw('SELECT COUNT(*) FROM mst_users')

  const dataBike = await pgCore.raw('SELECT COUNT(*) FROM mst_users')

  return {
    car: dataCar.rows,
    bike: dataBike.rows
  };
}

const getResult = async (where) => {
  const dataCar = await pgCore.raw('SELECT COUNT(*) FROM mst_users')

  const dataBike = await pgCore.raw('SELECT COUNT(*) FROM mst_users')

  return {
    car: dataCar.rows,
    bike: dataBike.rows
  };
}

const getTotalCustomer = async () => {
  const totalCustomer = await pgCore.raw('select COUNT(*) FROM mst_users')

  return totalCustomer.rows;
}

const getTotalPemenang = async () => {
  const data = await pgCore.raw(`
    SELECT COUNT(*) AS total
    FROM (SELECT users_id
    FROM mst_users
    GROUP BY users_id) AS tbl
  `)

  return data.rows;
}

/**
 *
 *
 * @param {*} where
 * @param {*} filter
 * @return {*}
 */
const get = async (where) => {
  try {
    const unitInfo = await getUnit(where);
    const resultInfo = await getResult(where);
    const [totalCustomer] = await getTotalCustomer();
    const [totalPemenang] = await getTotalPemenang();
    return mappingSuccessPagination(lang.__('get.success'), {
      unitInfo,
      resultInfo,
      totalCustomer: totalCustomer.total,
      totalPemenang: totalPemenang.total
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

/**
 *
 *
 * @param {*} where
 * @param {*} filter
 * @return {*}
 */
const getTable = async (where, filter) => {
  try {
    let sqlWhereCar = '';
    let sqlWhereBike = '';
    if (where?.location_id) {
      sqlWhereCar += ` AND inv_car_stock.location_id = '${where.location_id}'`
      sqlWhereBike += ` AND inv_bike_stock.location_id = '${where.location_id}'`
    }

    if (where?.pool_id) {
      sqlWhereCar += ` AND inv_car_stock.pool_id = '${where.pool_id}'`
      sqlWhereBike += ` AND inv_bike_stock.pool_id = '${where.pool_id}'`
    }

    const sql = `select (coalesce(car.total,0) + coalesce (bike.total,0)) total, mc.client_id, mc.client_no, mc.first_name, mc.last_name from mst_client mc
    left join (SELECT DISTINCT(COUNT(inv_car_stock.inventory_car_id)) as total, inv_car_stock.client_id
    FROM inv_car_stock
    INNER JOIN mst_status_inventory ON mst_status_inventory.status_inventory_id = inv_car_stock.car_status_id
    WHERE (mst_status_inventory.status_name LIKE '%operasi%' OR mst_status_inventory.status_name LIKE '%tersedia%' OR mst_status_inventory.status_name LIKE '%lelang%')
    AND inv_car_stock.deleted_at IS NULL ${sqlWhereCar}
    GROUP BY inv_car_stock.client_id) as car on mc.client_id = car.client_id
    left join (SELECT DISTINCT(COUNT(inv_bike_stock.inventory_bike_id)) as total, inv_bike_stock.client_id
    FROM inv_bike_stock
    INNER JOIN mst_status_inventory ON mst_status_inventory.status_inventory_id = inv_bike_stock.bike_status_id
    WHERE (mst_status_inventory.status_name LIKE '%operasi%' OR mst_status_inventory.status_name LIKE '%tersedia%' OR mst_status_inventory.status_name LIKE '%lelang%')
    AND inv_bike_stock.deleted_at IS NULL ${sqlWhereBike}
    GROUP BY inv_bike_stock.client_id) as bike on mc.client_id = bike.client_id
    where mc.deleted_at IS NULL`;

    const result = await pgCore.raw(`${sql} LIMIT ${filter.limit} OFFSET '${((filter.page - 1) * filter.limit)}'`)
    const count = await pgCore.raw(`${sql}`)

    return mappingSuccessPagination(lang.__('get.success'), {
      result: result.rows,
      count: count.rows.length
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  get,
  getTable
}
