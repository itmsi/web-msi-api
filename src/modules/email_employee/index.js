const { Router } = require('express')
const multer = require('multer')
const {
  store, importExcel, fetch, fetchByParam, update, softDelete, downloadTemplateExcel
} = require('./handler')
const { postValidation, putValidation, paramValidation } = require('./validation')

const router = Router()

// Configure multer for Excel file upload
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit for Excel files
    files: 1 // Only allow 1 file
  },
  fileFilter: (req, file, cb) => {
    // Check if file is Excel
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true)
    } else {
      cb(new Error('Hanya file Excel (.xlsx, .xls) yang diperbolehkan'), false)
    }
  }
})

// Error handling middleware untuk multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(200).json({
        status: false,
        message: 'Ukuran file terlalu besar. Maksimal ukuran file adalah 10 MB.',
        data: []
      })
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(200).json({
        status: false,
        message: 'Jumlah file terlalu banyak. Maksimal 1 file.',
        data: []
      })
    }
    return res.status(200).json({
      status: false,
      message: 'Error upload file: ' + error.message,
      data: []
    })
  }
  if (error.message.includes('Hanya file Excel')) {
    return res.status(200).json({
      status: false,
      message: error.message,
      data: []
    })
  }
  next(error)
}

// Routes
router.post('/', postValidation, store)
router.post('/import', upload.single('file'), handleMulterError, importExcel)
router.get('/', fetch)
router.get('/template', downloadTemplateExcel)
router.get('/:email_employee_id', paramValidation, fetchByParam)
router.put('/:email_employee_id', paramValidation, putValidation, update)
router.delete('/:email_employee_id', paramValidation, softDelete)

module.exports = router 