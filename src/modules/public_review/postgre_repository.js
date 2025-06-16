const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const {
  mappingSuccess,
  mappingError,
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_review'
const LOCATION_TABLE = 'mst_location'

const COLUMN = [
  `${TABLE}.review_id`, `${TABLE}.review_name`, `${TABLE}.review_email`, `${TABLE}.review_location`,
  `${TABLE}.review_type_of_review`,
  `${TABLE}.review_description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`
]

/**
 * Map review location to place ID from database
 * @param {string} location - The review location
 * @return {string} - The corresponding place ID
 */
const getPlaceId = async (location) => {
  try {
    const normalizedLocation = location?.toLowerCase()?.trim()

    if (!normalizedLocation) {
      console.log('getPlaceId: No location provided, using default place ID')
      return 'ChIJE0kdlfv1aS4RpCIqAFSnOcQ'
    }

    console.log(`getPlaceId: Searching for location: "${normalizedLocation}"`)

    // Use Knex.js syntax instead of raw query
    const result = await pgCore(LOCATION_TABLE)
      .select('location_code')
      .whereRaw('LOWER(location_name) = ?', [normalizedLocation])
      .first()

    console.log('getPlaceId: Query result:', result)

    if (result && result.location_code) {
      console.log(`getPlaceId: Found place ID: ${result.location_code}`)
      return result.location_code
    }

    console.log(`getPlaceId: No location found for "${normalizedLocation}", using default place ID`)
    return 'ChIJE0kdlfv1aS4RpCIqAFSnOcQ'
  } catch (error) {
    console.error('getPlaceId: Error fetching location_code:', error)
    console.error('getPlaceId: Error details:', {
      message: error.message,
      stack: error.stack,
      location
    })
    return 'ChIJE0kdlfv1aS4RpCIqAFSnOcQ'
  }
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
    console.log(`create: Getting place ID for location: "${payload.review_location}"`)
    const placeId = await getPlaceId(payload.review_location)
    console.log(`create: Retrieved place ID: ${placeId}`)

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
    console.error('create: Error in create function:', error)
    console.error('create: Error details:', {
      message: error.message,
      stack: error.stack,
      payload
    })
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  create,
  COLUMN,
  TABLE
}
