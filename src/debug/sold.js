const { pgCore } = require('../config/database')

const debugSold = async () => {
  try {
    try {
      await pgCore.transaction(async (trx) => {
        const where = `b.auction_id = 'a650c64e-b5d1-47f5-b3f5-5b69266a0086' and
        a.allocation_lane = 'A' and
        a.allocation_lot_number = '1' and
        a.inventory_car_id = 'df98a7c4-da1a-41d8-8489-df30314eafb8'`
        const query = `UPDATE auc_car_allocation_detail AS a
        SET allocation_status = '6', updated_at = '${new Date().toISOString()}'
        FROM auc_car_allocation as b
        WHERE ${where} and a.car_allocation_id = b.car_allocation_id RETURNING a.car_allocation_detail_id`
        const rowDetail = await pgCore.raw(query).transacting(trx)
        console.log(rowDetail.rows[0].car_allocation_detail_id);
      })
    } catch (error) {
      console.error('transaction failed', error)
    }
  } catch (error) {
    console.info('error sold job', error)
  }
}

debugSold()
