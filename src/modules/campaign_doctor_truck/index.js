const { Router } = require('express')
const multer = require('multer')
const {
  store, storePublic, fetch, fetchByParam, update, softDelete
} = require('./handler')
const { paramValidation, publicPostValidation } = require('./validation')

const router = Router()
const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1 GB dalam bytes
    files: 10 // maksimal 10 file
  }
})

// Error handling middleware untuk multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(200).json({
        status: false,
        message: 'Ukuran file terlalu besar. Maksimal ukuran file adalah 1 GB.',
        data: []
      })
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(200).json({
        status: false,
        message: 'Jumlah file terlalu banyak. Maksimal 10 file.',
        data: []
      })
    }
    return res.status(200).json({
      status: false,
      message: 'Error upload file: ' + error.message,
      data: []
    })
  }
  next(error)
}

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', upload.any(), handleMulterError, store)
router.post('/public', upload.any(), handleMulterError, publicPostValidation, storePublic)
router.get('/', fetch)
router.get('/:campaign_participant_id', paramValidation, fetchByParam)
router.put('/:campaign_participant_id', upload.any(), handleMulterError, update)
router.delete('/:campaign_participant_id', softDelete)

module.exports = router
