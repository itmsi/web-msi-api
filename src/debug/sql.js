const { pgCore } = require('../config');
const {
  MODEL_PROPERTIES: { TABLES, PRIMARY_KEY },
} = require('../utils')

const test = async () => {
  const [rowAuctionResult] = await pgCore(TABLES.AUCTION_RESULT_BIKE)
    .leftJoin(TABLES.BIKE_ALLOCATION_DETAIL, (builder) => {
      builder
        .on(
          `${TABLES.BIKE_ALLOCATION_DETAIL}.${PRIMARY_KEY.BIKE_ALLOCATION_DETAIL}`,
          `${TABLES.AUCTION_RESULT_BIKE}.${PRIMARY_KEY.BIKE_ALLOCATION_DETAIL}`
        )
        .andOn(pgCore.raw(`${TABLES.BIKE_ALLOCATION_DETAIL}.deleted_at IS NULL`));
    })
    .leftJoin(TABLES.BIKE_INVENTORY, (builder) => {
      builder
        .on(
          `${TABLES.BIKE_INVENTORY}.${PRIMARY_KEY.BIKE_INVENTORY}`,
          `${TABLES.BIKE_ALLOCATION_DETAIL}.${PRIMARY_KEY.BIKE_INVENTORY}`
        )
        .andOn(pgCore.raw(`${TABLES.BIKE_INVENTORY}.deleted_at IS NULL`));
    })
    .leftJoin(TABLES.CLIENT, (builder) => {
      builder
        .on(
          `${TABLES.CLIENT}.${PRIMARY_KEY.CLIENT}`,
          `${TABLES.BIKE_INVENTORY}.${PRIMARY_KEY.CLIENT}`
        )
        .andOn(pgCore.raw(`${TABLES.CLIENT}.deleted_at IS NULL`));
    })
    .where(`${TABLES.AUCTION_RESULT_BIKE}.${PRIMARY_KEY.AUCTION_RESULT_BIKE}`, '6d03bb27-39de-4e2b-9ac5-8dd7d13b08d4')
    .select([
      `${TABLES.CLIENT}.ppn_percentage`
    ]);
  return rowAuctionResult
}

test().then((r) => {
  console.log(r);
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
