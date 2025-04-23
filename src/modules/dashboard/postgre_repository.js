const { pgCore } = require('../../config/database')
const {
  customDateFormat,
  mappingError,
  mappingSuccessPagination,
} = require('../../utils')
const { lang } = require('../../lang');

const getUnit = async (where) => {
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

  if (where?.start_date) {
    const startDate = customDateFormat(new Date(`${where.start_date}`), 'YYYY-MM-DD');
    sqlWhereCar += ` AND DATE(inv_car_stock.created_at) >= '${startDate}'`
    sqlWhereBike += ` AND DATE(inv_bike_stock.created_at) >= '${startDate}'`
  }

  if (where?.end_date) {
    const endDate = customDateFormat(new Date(`${where.end_date}`), 'YYYY-MM-DD');
    sqlWhereCar += ` AND DATE(inv_car_stock.created_at) <= '${endDate}'`
    sqlWhereBike += ` AND DATE(inv_bike_stock.created_at) <= '${endDate}'`
  }

  const dataCar = await pgCore.raw(`
    SELECT SUM(CASE WHEN "mst_status_inventory"."status_name" ILIKE '%terjual%' THEN 1 ELSE 0 END) soldUnit,
    SUM(CASE WHEN "mst_status_inventory"."status_name" ILIKE '%tersedia%' THEN 1 ELSE 0 END) availableUnit,
    SUM(CASE WHEN "mst_status_inventory"."status_name" ILIKE '%operasi%' THEN 1 ELSE 0 END) operationUnit,
    SUM(CASE WHEN ("mst_status_inventory"."status_name" ILIKE '%batal titip%' OR "mst_status_inventory"."status_name" ILIKE '%rilis%') THEN 1 ELSE 0 END) outUnit,
    SUM(CASE WHEN ("inv_car_document".car_document_id IS NOT NULL AND "inv_car_document"."file_bpkb" IS NOT NULL) THEN 1 ELSE 0 END) availableBpkb,
    SUM(CASE WHEN ("inv_car_document".car_document_id IS NOT NULL AND "inv_car_document"."file_bpkb" IS NULL) THEN 1 ELSE 0 END) notAvailableBpkb
    FROM "inv_car_stock"
    LEFT JOIN "inv_car_document" ON "inv_car_document"."inventory_car_id" = "inv_car_stock"."inventory_car_id"
    LEFT JOIN "mst_status_inventory" ON "mst_status_inventory"."status_inventory_id" = "inv_car_stock"."car_status_id"
    WHERE "inv_car_stock"."deleted_at" IS NULL
    ${sqlWhereCar}
  `)

  const dataBike = await pgCore.raw(`
    SELECT SUM(CASE WHEN "mst_status_inventory"."status_name" ILIKE '%terjual%' THEN 1 ELSE 0 END) soldUnit,
    SUM(CASE WHEN "mst_status_inventory"."status_name" ILIKE '%tersedia%' THEN 1 ELSE 0 END) availableUnit,
    SUM(CASE WHEN "mst_status_inventory"."status_name" ILIKE '%operasi%' THEN 1 ELSE 0 END) operationUnit,
    SUM(CASE WHEN ("mst_status_inventory"."status_name" ILIKE '%batal titip%' OR "mst_status_inventory"."status_name" ILIKE '%rilis%') THEN 1 ELSE 0 END) outUnit,
    SUM(CASE WHEN ("inv_bike_document".bike_document_id IS NOT NULL AND "inv_bike_document"."file_bpkb" IS NOT NULL) THEN 1 ELSE 0 END) availableBpkb,
    SUM(CASE WHEN ("inv_bike_document".bike_document_id IS NOT NULL AND "inv_bike_document"."file_bpkb" IS NULL) THEN 1 ELSE 0 END) notAvailableBpkb
    FROM "inv_bike_stock"
    LEFT JOIN "inv_bike_document" ON "inv_bike_document"."inventory_bike_id" = "inv_bike_stock"."inventory_bike_id"
    LEFT JOIN "mst_status_inventory" ON "mst_status_inventory"."status_inventory_id" = "inv_bike_stock"."bike_status_id"
    WHERE "inv_bike_stock"."deleted_at" IS NULL
    ${sqlWhereBike}
  `)

  return {
    car: dataCar.rows,
    bike: dataBike.rows
  };
}

const getResult = async (where) => {
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

  if (where?.start_date) {
    const startDate = customDateFormat(new Date(`${where.start_date}`), 'YYYY-MM-DD');
    sqlWhereCar += ` AND DATE(inv_car_stock.created_at) >= '${startDate}'`
    sqlWhereBike += ` AND DATE(inv_bike_stock.created_at) >= '${startDate}'`
  }

  if (where?.end_date) {
    const endDate = customDateFormat(new Date(`${where.end_date}`), 'YYYY-MM-DD');
    sqlWhereCar += ` AND DATE(inv_car_stock.created_at) <= '${endDate}'`
    sqlWhereBike += ` AND DATE(inv_bike_stock.created_at) <= '${endDate}'`
  }

  const dataCar = await pgCore.raw(`
    SELECT SUM(CASE WHEN "payment_car"."payment_car_status" = 2 THEN 1 ELSE 0 END) paidUnit,
    SUM(CASE WHEN ("payment_car"."payment_car_status" != 2 OR "payment_car"."payment_car_status" IS NULL) THEN 1 ELSE 0 END) unPaidUnit
    FROM "auc_result_auction_car"
    INNER JOIN "auc_car_allocation_detail" ON "auc_car_allocation_detail"."car_allocation_detail_id" = "auc_result_auction_car"."car_allocation_detail_id" AND auc_car_allocation_detail.deleted_at IS NULL
    INNER JOIN "auc_auction" ON "auc_auction"."auction_id" = "auc_result_auction_car"."auction_id" AND auc_auction.deleted_at IS NULL
    INNER JOIN "auc_customer_nipl" ON "auc_customer_nipl"."nipl_id" = "auc_result_auction_car"."nipl_id" AND auc_customer_nipl.deleted_at IS NULL
    LEFT JOIN "mst_fee_setting" ON "mst_fee_setting"."fee_setting_id" = "auc_result_auction_car"."fee_setting_id" AND mst_fee_setting.deleted_at IS NULL
    LEFT JOIN "payment_car" ON "payment_car"."auction_car_id" = "auc_result_auction_car"."auction_car_id" AND payment_car.deleted_at IS NULL
    LEFT JOIN "inv_car_stock" ON "inv_car_stock"."inventory_car_id" = "auc_car_allocation_detail"."inventory_car_id" AND inv_car_stock.deleted_at IS NULL
    LEFT JOIN "auc_customer_bidder" ON "auc_customer_bidder"."bidder_id" = "auc_customer_nipl"."bidder_id" AND auc_customer_bidder.deleted_at IS NULL
    LEFT JOIN "mst_customer" ON "mst_customer"."customer_id" = "auc_customer_bidder"."customer_id" AND mst_customer.deleted_at IS NULL
    WHERE "auc_result_auction_car"."deleted_at" IS NULL
    ${sqlWhereCar}
  `)

  const dataBike = await pgCore.raw(`
    SELECT SUM(CASE WHEN "payment_bike"."payment_bike_status" = 2 THEN 1 ELSE 0 END) paidUnit,
    SUM(CASE WHEN ("payment_bike"."payment_bike_status" != 2 OR "payment_bike"."payment_bike_status" IS NULL) THEN 1 ELSE 0 END) unPaidUnit
    FROM "auc_result_auction_bike"
    INNER JOIN "auc_bike_allocation_detail" ON "auc_bike_allocation_detail"."bike_allocation_detail_id" = "auc_result_auction_bike"."bike_allocation_detail_id" AND auc_bike_allocation_detail.deleted_at IS NULL
    INNER JOIN "auc_auction" ON "auc_auction"."auction_id" = "auc_result_auction_bike"."auction_id" AND auc_auction.deleted_at IS NULL
    INNER JOIN "auc_customer_nipl" ON "auc_customer_nipl"."nipl_id" = "auc_result_auction_bike"."nipl_id" AND auc_customer_nipl.deleted_at IS NULL
    LEFT JOIN "mst_fee_setting" ON "mst_fee_setting"."fee_setting_id" = "auc_result_auction_bike"."fee_setting_id" AND mst_fee_setting.deleted_at IS NULL
    LEFT JOIN "payment_bike" ON "payment_bike"."auction_bike_id" = "auc_result_auction_bike"."auction_bike_id" AND payment_bike.deleted_at IS NULL
    LEFT JOIN "inv_bike_stock" ON "inv_bike_stock"."inventory_bike_id" = "auc_bike_allocation_detail"."inventory_bike_id" AND inv_bike_stock.deleted_at IS NULL
    LEFT JOIN "auc_customer_bidder" ON "auc_customer_bidder"."bidder_id" = "auc_customer_nipl"."bidder_id" AND auc_customer_bidder.deleted_at IS NULL
    LEFT JOIN "mst_customer" ON "mst_customer"."customer_id" = "auc_customer_bidder"."customer_id" AND mst_customer.deleted_at IS NULL
    WHERE "auc_result_auction_bike"."deleted_at" IS NULL
    ${sqlWhereBike}
  `)

  return {
    car: dataCar.rows,
    bike: dataBike.rows
  };
}

const getTotalCustomer = async () => {
  const totalCustomer = await pgCore.raw('select count("mst_customer"."customer_id") as total from "mst_customer" where deleted_at is null')

  return totalCustomer.rows;
}

const getTotalPemenang = async () => {
  const data = await pgCore.raw(`
    SELECT COUNT(*) AS total
    FROM (SELECT auction_id, customer_id
    FROM info_bidder
    WHERE status = 'Menang'
    GROUP BY auction_id, customer_id) AS tbl
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
