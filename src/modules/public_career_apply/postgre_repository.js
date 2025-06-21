const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const { publishToRabbitMqQueueSingle } = require('../../config/rabbitmq')
const {
  mappingSuccess,
  mappingError,
} = require('../../utils')
const { lang } = require('../../lang')
const { CAREER_APPLY_QUEUE, CAREER_APPLY_EXCHANGE } = require('./consumer')

const TABLE = 'mst_career_apply'
const TABLE_JOB_CAREER = 'mst_job_career'
const TABLE_DEPARTEMENT = 'mst_departement'
const TABLE_LOCATION_AREA = 'mst_location_area'
const TABLE_RELIGION = 'mst_religion'
const TABLE_MARITAL_STATUS = 'mst_marital_status'
const TABLE_DEGREE = 'mst_degree'
const TABLE_PROVINCE = 'mst_province'
const TABLE_CITY = 'mst_city'
const COLUMN_ALL = [
  `${TABLE}.career_apply_id`, `${TABLE}.job_career_id`, `${TABLE}.departement_id`, `${TABLE}.location_area_id`, `${TABLE}.religion_id`, `${TABLE}.marital_status_id`, `${TABLE}.degree_id`, `${TABLE}.province_id`, `${TABLE}.city_id`, `${TABLE}.career_apply_name`, `${TABLE}.career_apply_nik`, `${TABLE}.career_apply_birth_date`, `${TABLE}.career_apply_email`, `${TABLE}.career_apply_phone`, `${TABLE}.career_apply_gender`, `${TABLE}.career_apply_street`, `${TABLE}.career_apply_university`, `${TABLE}.career_apply_faculty`, `${TABLE}.career_apply_gpa`, `${TABLE}.career_apply_graduation_date`, `${TABLE}.career_apply_cv`, `${TABLE}.career_apply_description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`,
  `${TABLE_JOB_CAREER}.job_career_name`, `${TABLE_DEPARTEMENT}.departement_name`, `${TABLE_LOCATION_AREA}.location_area_name`, `${TABLE_RELIGION}.religion_name`, `${TABLE_MARITAL_STATUS}.marital_status_name`, `${TABLE_DEGREE}.degree_name`, `${TABLE_PROVINCE}.province_name`, `${TABLE_CITY}.city_name`
]

const COLUMN = [
  `${TABLE}.career_apply_id`, `${TABLE}.job_career_id`, `${TABLE}.departement_id`, `${TABLE}.location_area_id`, `${TABLE}.religion_id`, `${TABLE}.marital_status_id`, `${TABLE}.degree_id`, `${TABLE}.province_id`, `${TABLE}.city_id`, `${TABLE}.career_apply_name`, `${TABLE}.career_apply_nik`, `${TABLE}.career_apply_birth_date`, `${TABLE}.career_apply_email`, `${TABLE}.career_apply_phone`, `${TABLE}.career_apply_gender`, `${TABLE}.career_apply_street`, `${TABLE}.career_apply_university`, `${TABLE}.career_apply_faculty`, `${TABLE}.career_apply_gpa`, `${TABLE}.career_apply_graduation_date`, `${TABLE}.career_apply_cv`, `${TABLE}.career_apply_description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`,
  `${TABLE_JOB_CAREER}.job_career_name`, `${TABLE_DEPARTEMENT}.departement_name`, `${TABLE_LOCATION_AREA}.location_area_name`, `${TABLE_RELIGION}.religion_name`, `${TABLE_MARITAL_STATUS}.marital_status_name`, `${TABLE_DEGREE}.degree_name`, `${TABLE_PROVINCE}.province_name`, `${TABLE_CITY}.city_name`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.career_apply_id) {
    builder.where(`${TABLE}.career_apply_id`, where.career_apply_id)
  }

  if (search) {
    builder.whereILike(`${TABLE}.career_apply_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.career_apply_nik`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
  query = query.leftJoin(TABLE_JOB_CAREER, `${TABLE_JOB_CAREER}.job_career_id`, `${TABLE}.job_career_id`)
  query = query.leftJoin(TABLE_DEPARTEMENT, `${TABLE_DEPARTEMENT}.departement_id`, `${TABLE}.departement_id`)
  query = query.leftJoin(TABLE_LOCATION_AREA, `${TABLE_LOCATION_AREA}.location_area_id`, `${TABLE}.location_area_id`)
  query = query.leftJoin(TABLE_RELIGION, `${TABLE_RELIGION}.religion_id`, `${TABLE}.religion_id`)
  query = query.leftJoin(TABLE_MARITAL_STATUS, `${TABLE_MARITAL_STATUS}.marital_status_id`, `${TABLE}.marital_status_id`)
  query = query.leftJoin(TABLE_DEGREE, `${TABLE_DEGREE}.degree_id`, `${TABLE}.degree_id`)
  query = query.leftJoin(TABLE_PROVINCE, `${TABLE_PROVINCE}.province_id`, `${TABLE}.province_id`)
  query = query.leftJoin(TABLE_CITY, `${TABLE_CITY}.city_id`, `${TABLE}.city_id`)

  if (where != null) {
    query = query.where((builder) => {
      condition(builder, where, search)
    })
  }

  return query
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
    // Step 1: Insert data first and wait for it to complete using insertTrx
    const result = await Repo.insertTrx(TABLE, payload, COLUMN[0], transaction);

    if (!result) {
      await transaction.rollback();
      return mappingSuccess(lang.__('created.failed'), null, 200, false)
    }

    // Step 2: Commit the transaction first to ensure insert is saved
    await transaction.commit();

    // Step 3: Only after successful insert and commit, get the joined data
    const [joinedData] = await sql({ career_apply_id: result.career_apply_id })
      .select(COLUMN_ALL)
      .where(`${TABLE}.career_apply_id`, result.career_apply_id);

    // Step 4: Only after getting joined data, publish to RabbitMQ
    if (joinedData) {
      await publishToRabbitMqQueueSingle(CAREER_APPLY_EXCHANGE, CAREER_APPLY_QUEUE, {
        type: 'NEW_CAREER_APPLY',
        data: {
          ...payload,
          job_career_name: joinedData?.job_career_name,
          departement_name: joinedData?.departement_name,
          location_area_name: joinedData?.location_area_name,
          religion_name: joinedData?.religion_name,
          marital_status_name: joinedData?.marital_status_name,
          degree_name: joinedData?.degree_name,
          province_name: joinedData?.province_name,
          city_name: joinedData?.city_name
        }
      });
    }

    return mappingSuccess(lang.__('created.success'), result)
  } catch (error) {
    // If any error occurs, rollback the transaction
    if (transaction) {
      await transaction.rollback();
    }
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  create,
  COLUMN,
  DEFAULT_SORT,
  TABLE
}
