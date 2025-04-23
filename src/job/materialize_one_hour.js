const { raw } = require('../repository/postgres/core_postgres')
const { MODEL_PROPERTIES: { TABLES } } = require('../utils')

const refreshInventory = async () => {
  const bike = await raw(`REFRESH MATERIALIZED VIEW ${TABLES.VW_INV_BIKE};`)
  const car = await raw(`REFRESH MATERIALIZED VIEW ${TABLES.VW_INV_CAR};`)
  const bidder = await raw(`REFRESH MATERIALIZED VIEW ${TABLES.VW_INFO_BIDDER};`)
  const batal_titip_car = await raw(`REFRESH MATERIALIZED VIEW ${TABLES.VW_BATAL_TITIP_CAR};`)
  const batal_titip_bike = await raw(`REFRESH MATERIALIZED VIEW ${TABLES.VW_BATAL_TITIP_BIKE};`)

  return {
    car: car?.rowCount,
    bike: bike?.rowCount,
    bidder: bidder?.rowCount,
    batal_titip_car: batal_titip_car?.rowCount,
    batal_titip_bike: batal_titip_bike?.rowCount,
  }
}

refreshInventory().then((r) => {
  console.info('refreshing materialized view', r)
  process.exit(0)
}).catch((error) => {
  console.info('error refreshing materialized view', error)
  process.exit(0)
})
