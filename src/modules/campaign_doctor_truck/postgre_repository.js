const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const {
  mappingSuccess,
  mappingError,
  manipulateDate,
  mappingSuccessPagination,
  todayFormat,
  MODEL_PROPERTIES: { PRIMARY_KEY }
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_campaign_participant'
const VOTING_TABLE = 'mst_campaigen_voting'

const COLUMN_ALL = [
  `${TABLE}.campaign_participant_id`, `${TABLE}.participant_name`, `${TABLE}.participant_phone`, `${TABLE}.participant_company`, `${TABLE}.participant_department`, `${TABLE}.participant_description`, `${TABLE}.participant_file_name_pdf`, `${TABLE}.participant_file_name_img`, `${TABLE}.participant_location`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const COLUMN = [
  `${TABLE}.campaign_participant_id`, `${TABLE}.participant_name`, `${TABLE}.participant_phone`, `${TABLE}.participant_company`, `${TABLE}.participant_department`, `${TABLE}.participant_description`, `${TABLE}.participant_file_name_pdf`, `${TABLE}.participant_file_name_img`, `${TABLE}.participant_location`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = ['vote_count', 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.campaign_participant_id) {
    builder.where(`${TABLE}.campaign_participant_id`, where.campaign_participant_id)
  }

  if (search) {
    builder.whereILike(`${TABLE}.participant_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.participant_phone`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.participant_company`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.participant_department`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.participant_description`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
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
    const result = await Repo.insert(TABLE, payload, COLUMN[0])

    if (!result) {
      transaction.rollback();
      return mappingSuccess(lang.__('created.failed'), null, 200, false)
    }

    transaction.commit();
    return mappingSuccess(lang.__('created.success'), result)
  } catch (error) {
    transaction.rollback();
    error.path = __filename
    return mappingError(error)
  }
}
/**
 * Menghitung jumlah voting untuk setiap participant
 * Logic: Hitung berdasarkan kombinasi unique (email + participant_id) yang terbaru
 * Validasi: Tidak menghitung soft delete dan ambil data terakhir per email
 */
const getVotingCounts = async (participantIds) => {
  try {
    if (!participantIds || participantIds.length === 0) {
      return {}
    }

    // Query untuk mendapatkan vote count per participant
    // Logic: Hitung berdasarkan kombinasi unique (email + participant_id) yang terbaru
    const voteCounts = await pgCore.raw(`
      SELECT 
        v.campaign_participant_id,
        COUNT(DISTINCT v.campaigen_voting_email) as vote_count
      FROM (
        SELECT 
          campaign_participant_id,
          campaigen_voting_email,
          created_at,
          ROW_NUMBER() OVER (
            PARTITION BY campaigen_voting_email, campaign_participant_id 
            ORDER BY created_at DESC
          ) as rn
        FROM ${VOTING_TABLE}
        WHERE deleted_at IS NULL 
          AND campaigen_voting_email IS NOT NULL
      ) v
      WHERE v.rn = 1
        AND v.campaign_participant_id IN (${participantIds.map(() => '?').join(',')})
      GROUP BY v.campaign_participant_id
    `, participantIds)

    // Buat map untuk quick lookup
    const voteCountMap = {}
    voteCounts.rows.forEach(vote => {
      voteCountMap[vote.campaign_participant_id] = parseInt(vote.vote_count || 0)
    })

    return voteCountMap
  } catch (error) {
    console.error('Error getting voting counts:', error)
    return {}
  }
}

/**
 * Menghitung total voting keseluruhan
 */
const getTotalVotes = async () => {
  try {
    // Hitung total unique emails yang sudah melakukan voting
    // Logic: Hitung berdasarkan kombinasi unique (email + participant_id) yang terbaru
    const result = await pgCore.raw(`
      SELECT COUNT(DISTINCT campaigen_voting_email) as total
      FROM (
        SELECT 
          campaigen_voting_email,
          campaign_participant_id,
          created_at,
          ROW_NUMBER() OVER (
            PARTITION BY campaigen_voting_email, campaign_participant_id 
            ORDER BY created_at DESC
          ) as rn
        FROM ${VOTING_TABLE}
        WHERE deleted_at IS NULL 
          AND campaigen_voting_email IS NOT NULL
      ) v
      WHERE v.rn = 1
    `)
    
    return parseInt(result.rows[0]?.total || 0)
  } catch (error) {
    console.error('Error getting total votes:', error)
    return 0
  }
}

/**
 *
 *
 * @param {*} where
 * @param {*} filter
 * @return {*}
 */
const get = async (where, filter, column = COLUMN) => {
  try {
    // Gunakan campaign_participant_id untuk sorting di database karena vote_count belum ada
    const result = await sql(where, filter.search).clone()
      .select(column)
      .orderBy(`${TABLE}.campaign_participant_id`, 'DESC')
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    const [rows] = await sql(where, filter.search).clone().count(column[0])

    // Tambahkan jumlah voting untuk setiap participant
    if (result && result.length > 0) {
      const participantIds = result.map(record => record.campaign_participant_id)
      const voteCounts = await getVotingCounts(participantIds)
      const totalVotes = await getTotalVotes()

      // Tambahkan vote_count dan vote_percentage untuk setiap record
      const resultWithVoteCount = result.map(record => {
        const voteCount = voteCounts[record.campaign_participant_id] || 0
        const votePercentage = totalVotes > 0
          ? Number(((voteCount / totalVotes) * 100).toFixed(2))
          : 0
        
        return {
          ...record,
          vote_count: voteCount,
          vote_percentage: votePercentage
        }
      })

      // Default sorting berdasarkan vote_count tertinggi
      resultWithVoteCount.sort((a, b) => b.vote_count - a.vote_count)

      return mappingSuccessPagination(lang.__('get.success'), {
        result: manipulateDate(resultWithVoteCount),
        count: rows?.count,
        total_votes: totalVotes
      })
    }

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(result),
      count: rows?.count,
      total_votes: 0
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
 * @param {*} column
 * @return {*}
 */
const getByParam = async (where, column = COLUMN_ALL) => {
  try {
    const [rows] = await sql(null).clone()
      .select(column)
      .where(`${TABLE}.${PRIMARY_KEY.CAMPAIGN_PARTICIPANT}`, where?.[PRIMARY_KEY.CAMPAIGN_PARTICIPANT])
    
    if (rows) {
      // Tambahkan jumlah voting untuk participant ini
      const participantId = rows.campaign_participant_id
      const voteCounts = await getVotingCounts([participantId])
      const totalVotes = await getTotalVotes()
      
      const voteCount = voteCounts[participantId] || 0
      const votePercentage = totalVotes > 0
        ? Number(((voteCount / totalVotes) * 100).toFixed(2))
        : 0
      
      const resultWithVoteCount = {
        ...rows,
        vote_count: voteCount,
        vote_percentage: votePercentage,
        total_votes: totalVotes
      }
      
      return mappingSuccess(lang.__('get.success'), resultWithVoteCount)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.[PRIMARY_KEY.CAMPAIGN_PARTICIPANT] }), rows)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}
/**
 *
 *
 * @param {*} where
 * @param {*} payload
 * @return {*}
 */
const update = async (where, payload, name = '') => {
  try {
    let { message, result } = ['', '']
    where[`${TABLE}.deleted_at`] = null
    if (payload.type_method === 'update') {
      message = lang.__('updated.success', { id: where?.campaign_participant_id })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.campaign_participant_id })
      const [rows] = await pgCore(TABLE).select(['campaign_participant_id', 'participant_name', 'participant_phone', 'participant_company', 'participant_department', 'participant_description', 'participant_file_name_pdf', 'participant_file_name_img']).where(where)
      if (rows) {
        payload.participant_description = `archived-${format}-${rows.participant_description}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE).where(where).update(payload).returning(['campaign_participant_id'])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.campaign_participant_id }), result)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  create,
  get,
  update,
  getByParam,
  getVotingCounts,
  getTotalVotes,
  COLUMN,
  DEFAULT_SORT,
  TABLE
}
