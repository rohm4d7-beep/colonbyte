// Import via the library path to avoid pdf-parse's test-runner side-effect
const pdfParse = require('pdf-parse/lib/pdf-parse.js')

async function extractText(buffer) {
  const { text } = await pdfParse(buffer)
  const cleaned = text.replace(/\s+/g, ' ').trim()

  if (!cleaned) {
    const err = new Error(
      'No readable text found. Make sure the PDF is text-based, not a scanned image.'
    )
    err.status = 422
    throw err
  }

  return cleaned
}

module.exports = { extractText }
