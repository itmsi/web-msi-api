const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const {
  mappingSuccess,
  mappingError,
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_review'

const COLUMN = [
  `${TABLE}.review_id`, `${TABLE}.review_name`, `${TABLE}.review_email`, `${TABLE}.review_location`,
  `${TABLE}.review_type_of_review`,
  `${TABLE}.review_description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`
]

/**
 * Map review location to place ID
 * @param {string} location - The review location
 * @return {string} - The corresponding place ID
 */
const getPlaceId = (location) => {
  const locationMap = {
    jakarta: 'ChIJk3f3ukKCei4Rcn7Oh9VIn48',
    kalimantan: 'ChIJk3f3ukKCei4Rcn7Oh9VIn48',
    sulawesi: 'ChIJk3f3ukKCei4Rcn7Oh9VIn48',
    sumatra: 'ChIJk3f3ukKCei4Rcn7Oh9VIn48'
  }

  const normalizedLocation = location?.toLowerCase()?.trim()
  return locationMap[normalizedLocation] || 'default_place_id'
}

/**
 *
 *
 * @param {*} payload
 * @return {*}
 */
const create = async (payload) => {
  const transaction = await pgCore.transaction();

  try {
    const result = await Repo.insert(TABLE, payload, COLUMN[0])

    if (!result) {
      transaction.rollback();
      return mappingSuccess(lang.__('created.failed'), null, 200, false)
    }

    // Get place ID based on review location
    const placeId = getPlaceId(payload.review_location)
    const redirectUrl = `https://search.google.com/local/writereview?placeid=${placeId}`

    // Add redirect_url to the result
    const responseData = {
      ...result,
      redirect_url: redirectUrl
    }

    transaction.commit();
    return mappingSuccess(lang.__('created.success'), responseData)
  } catch (error) {
    transaction.rollback();
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  create,
  COLUMN,
  TABLE
}
