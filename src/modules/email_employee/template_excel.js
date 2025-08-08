const ExcelJS = require('exceljs')
const fs = require('fs')
const path = require('path')

/**
 * Generate template Excel untuk import email employee
 * @param {string} filepath - Path untuk menyimpan file Excel
 * @returns {Promise<string>} - Path file yang dibuat
 */
const generateTemplate = async (filepath) => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Email Employee')

    // Set header
    worksheet.columns = [
      { header: 'Nama Email Employee (Opsional)', key: 'email_employee_name', width: 30 },
      { header: 'Email (Opsional)', key: 'email_employee_email', width: 30 },
      { header: 'Alias (Opsional)', key: 'email_employee_alias', width: 20 },
      { header: 'Deskripsi (Opsional)', key: 'email_employee_description', width: 40 }
    ]

    // Style header
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    // Add sample data
    worksheet.addRow({
      email_employee_name: 'John Doe',
      email_employee_email: 'john.doe@example.com',
      email_employee_alias: 'john',
      email_employee_description: 'IT Department'
    })

    worksheet.addRow({
      email_employee_name: 'Jane Smith',
      email_employee_email: 'jane.smith@example.com',
      email_employee_alias: 'jane',
      email_employee_description: 'HR Department'
    })

    // Add example with partial data
    worksheet.addRow({
      email_employee_name: '',
      email_employee_email: 'bob.johnson@example.com',
      email_employee_alias: 'bob',
      email_employee_description: 'Finance Department'
    })

    worksheet.addRow({
      email_employee_name: 'Alice Brown',
      email_employee_email: '',
      email_employee_alias: 'alice',
      email_employee_description: ''
    })

    // Create directory if not exists
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Save file
    await workbook.xlsx.writeFile(filepath)
    return filepath
  } catch (error) {
    throw new Error(`Error generating template: ${error.message}`)
  }
}

/**
 * Download template Excel
 * @param {Object} res - Express response object
 */
const downloadTemplate = async (res) => {
  try {
    const filename = `template_email_employee_${new Date().toISOString().split('T')[0]}.xlsx`
    const filepath = path.join(__dirname, '../../public/excel', filename)
    
    await generateTemplate(filepath)
    
    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('Error downloading template:', err)
      }
      // Clean up file after download
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
    })
  } catch (error) {
    console.error('Error in downloadTemplate:', error)
    res.status(500).json({
      status: false,
      message: 'Error generating template',
      data: []
    })
  }
}

module.exports = {
  generateTemplate,
  downloadTemplate
} 