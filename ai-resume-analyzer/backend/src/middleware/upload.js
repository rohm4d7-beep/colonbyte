const multer = require('multer')

function pdfOnly(req, file, cb) {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    const err = new Error('Only PDF files are accepted')
    err.status = 400
    cb(err, false)
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: pdfOnly,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
})

module.exports = { upload }
