const express = require('express')
const multer = require('multer')
const {
  store, fetch, fetchByParam, update, softDelete
} = require('./handler')
const { postValidation, putValidation } = require('./validation')

const router = express.Router()
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
      message: `Error upload file: ${error.message}`,
      data: []
    })
  }
  next(error)
}

/*
  DEFAULT ROUTE ENDPOINT USING HTTP VERB AND PLURAL NAMING
*/
router.post('/', upload.any(), handleMulterError, postValidation, store)
router.get('/', fetch)
router.get('/:id', fetchByParam)
router.put('/:id', upload.any(), handleMulterError, putValidation, update)
router.delete('/:id', softDelete)

module.exports = router
