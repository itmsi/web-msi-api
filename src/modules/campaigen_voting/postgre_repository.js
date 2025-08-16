const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const {
  mappingSuccess,
  mappingError,
  manipulateDate,
  mappingSuccessPagination,
  todayFormat
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_campaigen_voting'
const EMAIL_TABLE = 'mst_email_employee'
const PARTICIPANT_TABLE = 'mst_campaign_participant'

const COLUMN_ALL = [
  `${TABLE}.campaigen_voting_id`, `${TABLE}.email_employee_id`, `${TABLE}.campaigen_voting_email`, `${TABLE}.campaign_participant_id`, `${TABLE}.campaigen_voting_description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const COLUMN = [
  `${TABLE}.campaigen_voting_id`, `${TABLE}.email_employee_id`, `${TABLE}.campaigen_voting_email`, `${TABLE}.campaign_participant_id`, `${TABLE}.campaigen_voting_description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']

const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.campaigen_voting_id) {
    builder.where(`${TABLE}.campaigen_voting_id`, where.campaigen_voting_id)
  }
  if (where.campaign_participant_id) {
    builder.where(`${TABLE}.campaign_participant_id`, where.campaign_participant_id)
  }
  if (where.campaigen_voting_email) {
    builder.where(`${TABLE}.campaigen_voting_email`, where.campaigen_voting_email)
  }

  if (search) {
    builder.whereILike(`${TABLE}.campaigen_voting_email`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(EMAIL_TABLE, `${TABLE}.email_employee_id`, `${EMAIL_TABLE}.email_employee_id`)
  if (where != null) {
    query = query.where((builder) => {
      condition(builder, where, search)
    })
  }

  return query
}

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

const get = async (where, filter, column = COLUMN) => {
  try {
    // Base query + window function untuk ambil record terbaru per email
    const baseQuery = sql(where, filter.search).clone()
      .select([...column, `${EMAIL_TABLE}.email_employee_email as email_employee`])
      .select(pgCore.raw(
        'ROW_NUMBER() OVER (PARTITION BY COALESCE(??, ??) ORDER BY ?? DESC) as rn',
        [
          `${TABLE}.campaigen_voting_email`,
          `${EMAIL_TABLE}.email_employee_email`,
          `${TABLE}.created_at`,
        ]
      ))

    // Ambil hanya baris rn = 1 (terbaru per email)
    const result = await pgCore.from(baseQuery.as('t'))
      .where('t.rn', 1)
      .orderBy((typeof filter.direction === 'string' ? filter.direction.split('.').pop() : filter.direction), filter.order)
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    // Hitung jumlah grup (distinct email)
    const [rows] = await pgCore.from(baseQuery.as('t')).where('t.rn', 1).count('*')

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(result),
      count: rows?.count
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

const getByParam = async (where, column = COLUMN_ALL) => {
  try {
    const [rows] = await sql(null).clone()
      .select([...column, `${EMAIL_TABLE}.email_employee_email as email_employee`])
      .where(`${TABLE}.campaigen_voting_id`, where?.campaigen_voting_id)
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.campaigen_voting_id }), rows)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

const update = async (where, payload, name = '') => {
  try {
    let { message, result } = ['', '']
    where[`${TABLE}.deleted_at`] = null
    if (payload.type_method === 'update') {
      message = lang.__('updated.success', { id: where?.campaigen_voting_id })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.campaigen_voting_id })
      const [rows] = await pgCore(TABLE).select(['campaigen_voting_id', 'campaigen_voting_email']).where(where)
      if (rows) {
        payload.campaigen_voting_description = `archived-${format}-${rows.campaigen_voting_description || ''}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE).where(where).update(payload).returning(['campaigen_voting_id'])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.campaigen_voting_id }), result)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

const findEmailEmployeeByEmail = async (email) => {
  if (!email) return null
  const rows = await pgCore(EMAIL_TABLE)
    .select(['email_employee_id'])
    .where({ email_employee_email: email, deleted_at: null })
    .first()
  return rows
}

const getParticipantsWithPercentage = async (where, filter) => {
  try {
    console.log('Starting getParticipantsWithPercentage with filter:', filter)

    const participantColumns = [
      'p.campaign_participant_id',
      'p.participant_name',
      'p.participant_company',
      'p.participant_department',
      'p.participant_description',
      'p.participant_file_name_pdf',
      'p.participant_file_name_img',
      'p.participant_location',
      'p.created_at',
      'p.updated_at',
    ]

    // Check if participants table has data
    const totalParticipants = await pgCore(`${PARTICIPANT_TABLE} as p`)
      .whereNull('p.deleted_at')
      .count('* as total')

    console.log('Total participants in DB:', totalParticipants[0]?.total)

    // List participants with paging
    const participants = await pgCore(`${PARTICIPANT_TABLE} as p`)
      .select(participantColumns)
      .whereNull('p.deleted_at')
      .orderBy(filter.direction || 'p.campaign_participant_id', filter.order || 'DESC')
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    console.log('Participants found:', participants.length)

    const ids = participants.map((p) => p.campaign_participant_id)
    console.log('Participant IDs:', ids)

    // Count votes per participant in current page (only latest vote per email)
    let voteCounts = []
    let totalVotes = 0
    
    if (ids.length > 0) {
      // Get all votes for participants in current page
      const allVotes = await pgCore(`${TABLE} as v`)
        .select('v.campaign_participant_id', 'v.campaigen_voting_email', 'v.created_at')
        .whereNull('v.deleted_at')
        .whereIn('v.campaign_participant_id', ids)
        .whereNotNull('v.campaigen_voting_email')
        .orderBy('v.created_at', 'DESC') // Order by created_at DESC to get latest first

      console.log('All votes found:', allVotes.length)

      // Group by email and get latest vote per email
      const emailLatestVotes = {}
      allVotes.forEach((vote) => {
        if (!emailLatestVotes[vote.campaigen_voting_email]) {
          emailLatestVotes[vote.campaigen_voting_email] = vote
        }
        // Since we ordered by created_at DESC, first occurrence is the latest
      })

      console.log('Unique emails with latest votes:', Object.keys(emailLatestVotes).length)

      // Count votes per participant from latest votes
      const voteCountMap = {}
      Object.values(emailLatestVotes).forEach((vote) => {
        const currentCount = voteCountMap[vote.campaign_participant_id] || 0
        voteCountMap[vote.campaign_participant_id] = currentCount + 1
      })

      voteCounts = Object.entries(voteCountMap).map(([campaign_participant_id, vote_count]) => ({
        campaign_participant_id,
        vote_count
      }))

      // Total votes is the count of unique emails
      totalVotes = Object.keys(emailLatestVotes).length
    }

    console.log('Total votes (unique emails):', totalVotes)

    // Total participants (for pagination count)
    const [participantsCountRow] = await pgCore(`${PARTICIPANT_TABLE} as p`)
      .whereNull('p.deleted_at')
      .count({ count: 'p.campaign_participant_id' })

    const countMap = voteCounts.reduce((acc, row) => {
      acc[row.campaign_participant_id] = Number(row.vote_count || 0)
      return acc
    }, {})

    const result = participants.map((p) => {
      const voteCount = countMap[p.campaign_participant_id] || 0
      const votePercentage = totalVotes > 0
        ? Number(((voteCount / totalVotes) * 100).toFixed(2))
        : 0
      return {
        ...p,
        vote_count: voteCount,
        vote_percentage: votePercentage,
      }
    })

    console.log('Final result count:', result.length)

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(result),
      count: participantsCountRow?.count
    })
  } catch (error) {
    console.error('Error in getParticipantsWithPercentage:', error)
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  create,
  get,
  update,
  getByParam,
  getParticipantsWithPercentage,
  findEmailEmployeeByEmail,
  COLUMN,
  DEFAULT_SORT,
  TABLE
}
