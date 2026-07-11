const { Router } = require('express')
const { upload }        = require('../middleware/upload')
const { extractText }   = require('../services/pdfParser')
const { analyzeResume } = require('../services/aiAnalyzer')

const router = Router()

router.post('/analyze', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' })
    }

    const text     = await extractText(req.file.buffer)
    const analysis = await analyzeResume(text)

    res.json({ success: true, filename: req.file.originalname, data: analysis })
  } catch (err) {
    next(err)
  }
})

module.exports = router
