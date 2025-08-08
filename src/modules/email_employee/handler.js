/**
 *
 * @param {*} lang this is for consisent with other language message
 * @param {*} repository this is repository for postgres definition
 * @param {*} req express request you can see with console.log(req)
 * @param {*} res express response you can see with console.log(req)
 * @param {*} requestHttp if request condition is and operator, you can use this
 * @return {JSON}
*/

const repository = require('./postgre_repository')
const {
  baseResponse, paginationResponse, requestHttp, paging, decodeToken
} = require('../../utils')
const ExcelJS = require('exceljs')
const { downloadTemplate } = require('./template_excel')

const store = async (req, res) => {
  try {
    const payload = { ...req?.body, ...decodeToken('created', req) }
    const result = await repository.create(payload)
    return baseResponse(res, result)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

const importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return baseResponse(res, { 
        code: 400, 
        data: { status: false, message: 'File Excel tidak ditemukan' } 
      })
    }

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(req.file.buffer)
    
    const worksheet = workbook.getWorksheet(1) // Get first worksheet
    if (!worksheet) {
      return baseResponse(res, { 
        code: 400, 
        data: { status: false, message: 'Worksheet tidak ditemukan' } 
      })
    }

    const data = []
    let rowNumber = 0

    worksheet.eachRow((row, rowIndex) => {
      rowNumber = rowIndex
      
      // Skip header row (row 1)
      if (rowIndex === 1) return

      const rowData = {
        email_employee_name: row.getCell(1).value?.toString()?.trim() || null,
        email_employee_email: row.getCell(2).value?.toString()?.trim() || null,
        email_employee_alias: row.getCell(3).value?.toString()?.trim() || null,
        email_employee_description: row.getCell(4)?.value?.toString()?.trim() || null
      }

      // Add row if at least one field is filled (to avoid completely empty rows)
      if (rowData.email_employee_name || rowData.email_employee_email || rowData.email_employee_alias) {
        data.push(rowData)
      }
    })

    if (data.length === 0) {
      return baseResponse(res, { 
        code: 400, 
        data: { status: false, message: 'Tidak ada data yang valid untuk diimport' } 
      })
    }

    const payload = {
      data: data,
      created_by: decodeToken('created', req).created_by
    }

    const result = await repository.importFromExcel(payload)
    return baseResponse(res, result)
  } catch (error) {
    console.error('Error in importExcel:', error)
    error.path = __filename
    return baseResponse(res, { 
      code: 500, 
      data: { status: false, message: `Error importing Excel: ${error.message}` } 
    })
  }
}

const fetch = async (req, res) => {
  try {
    const where = req.query
    const filter = paging(req, repository.DEFAULT_SORT)
    const result = await repository.get(where, filter)
    return paginationResponse(req, res, result)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

const fetchByParam = async (req, res) => {
  try {
    const where = requestHttp(req)
    const result = await repository.getByParam(where)
    return baseResponse(res, result)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

const update = async (req, res) => {
  try {
    const where = requestHttp(req)
    const payload = { ...req?.body, type_method: 'update', ...decodeToken('updated', req) }
    const result = await repository.update(where, payload)
    return baseResponse(res, result)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

const softDelete = async (req, res) => {
  try {
    const where = requestHttp(req)
    const payload = { type_method: 'soft-delete', ...decodeToken('deleted', req) }
    const result = await repository.update(where, payload)
    return baseResponse(res, result)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

const downloadTemplateExcel = async (req, res) => {
  try {
    await downloadTemplate(res)
  } catch (error) {
    error.path = __filename
    return baseResponse(res, { code: 500, data: { status: false, message: error.message } })
  }
}

module.exports = {
  store,
  importExcel,
  fetch,
  fetchByParam,
  update,
  softDelete,
  downloadTemplateExcel
} 