// /* eslint-disable max-len */
// /* eslint-disable no-restricted-syntax */
// const data = [
//   {
//     id: 1,
//     nominal: 2000,
//     operator: 'lte',
//     logic: 'percen',
//     admin: 0
//   },
//   {
//     id: 2,
//     nominal: 2001,
//     operator: 'gte',
//     logic: 'nominal',
//     admin: 1000
//   },
//   {
//     id: 3,
//     nominal: 4000,
//     operator: 'gte',
//     logic: 'percen',
//     admin: 10
//   },
//   {
//     id: 4,
//     nominal: 6000,
//     operator: 'gte',
//     logic: 'nominal',
//     admin: 1500
//   },
// ]
// const price = 6000
// // Filter data sesuai kondisi
// const filtered = data.filter((item) => {
//   if (item.operator === 'gte') {
//     return price >= item.nominal;
//   } if (item.operator === 'lte') {
//     return price <= item.nominal;
//   }
//   return 0; // Default jika operator tidak dikenal
// });

// // Urutkan data berdasarkan nominal (descending)
// filtered.sort((a, b) => b.nominal - a.nominal);

// // Ambil elemen pertama dari hasil yang relevan
// const result = filtered[0] ?? 0;
// if (result?.id) {
//   if (result.logic === 'percen') {
//     result.admin = price * (result.admin / 100);
//   }

//   console.log(`Output: ${result.admin}`);
// } else {
//   console.log(0);
// }
const { pgCore } = require('../config/database');
const { customDateFormat } = require('../utils');

const checkFee = async (payload, auction_date) => {
  const date = await pgCore.raw('select auction_start_date, auction_code from auc_auction order by auction_id desc limit 1')
  console.log(date.rows[0].auction_code);
  console.log(customDateFormat(date.rows[0].auction_start_date));

  const data = await pgCore.raw(`select condition_operator, condition_amount, value_type, admin_fee_value
    from mst_admin_fee_setting where ? between active_start_date and active_end_date and deleted_at is null
    order by condition_amount asc`, [auction_date])
  let fee = 0
  const last_price = Number(payload?.last_price ?? 0)
  if (data.rows.length > 0) {
    const filtered = data.rows.filter((item) => {
      if (item.condition_operator === 'gte') {
        return last_price >= +item.condition_amount;
      } if (item.condition_operator === 'lte') {
        return last_price <= +item.condition_amount;
      }
      return 0; // Default jika operator tidak dikenal
    });

    // Urutkan data berdasarkan nominal (descending)
    filtered.sort((a, b) => b.condition_amount - a.condition_amount);

    // Ambil elemen pertama dari hasil yang relevan
    const result = filtered[0] ?? 0;
    if (result?.condition_amount) {
      if (result.value_type === 'percentage') {
        result.admin_fee_value = last_price * (result.admin_fee_value / 100);
      }
      fee = +result.admin_fee_value
    }
  }
  return fee
}

checkFee({ last_price: 505000000 }, '2025-01-23').then((result) => {
  console.log(`Output: ${result}`);
  process.exit(0);
});
