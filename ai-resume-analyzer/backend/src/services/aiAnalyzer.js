const Groq = require('groq-sdk')

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are a senior technical recruiter and ATS specialist with 15+ years of experience at top-tier companies including Google, Amazon, and Microsoft. You provide precise, honest, and actionable resume feedback. You never sugarcoat weaknesses — honest feedback helps candidates improve. Always respond with valid JSON only.`

function buildPrompt(resumeText) {
  return `Analyze the following resume thoroughly and return ONLY a valid JSON object.

Resume text:
"""
${resumeText}
"""

Return this exact JSON structure (all fields required):
{
  "overall_score": <integer 0-100: holistic quality of the resume>,
  "ats_score": <integer 0-100: ATS compatibility — formatting, keywords, structure>,
  "experience_level": "<exactly one of: entry | mid | senior | executive>",
  "summary": "<2-3 honest sentences summarising the resume's overall quality, standout aspects, and biggest gap>",
  "strengths": [
    "<specific strength backed by evidence in the resume>",
    "<specific strength>",
    "<specific strength>"
  ],
  "improvements": [
    {
      "title": "<short label e.g. Quantify Achievements>",
      "description": "<specific, actionable advice referencing actual content in the resume>",
      "priority": "<high | medium | low>"
    }
  ],
  "skills": {
    "technical": ["<programming languages, frameworks, etc.>"],
    "soft": ["<communication, leadership, etc.>"],
    "tools": ["<tools, platforms, cloud services>"]
  },
  "keywords_found": ["<relevant industry keyword present in resume>"],
  "keywords_missing": ["<important keyword absent that would strengthen the resume>"],
  "section_scores": {
    "contact_info": <integer 0-100>,
    "professional_summary": <integer 0-100>,
    "work_experience": <integer 0-100>,
    "education": <integer 0-100>,
    "skills": <integer 0-100>
  }
}

Rules:
- strengths: 3-5 items
- improvements: 3-6 items ordered high to low priority
- keywords_found: up to 15 items
- keywords_missing: up to 10 items
- skills arrays may be empty [] if none found
- section score 0 if section is absent`
}

async function analyzeResume(resumeText) {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error('GROQ_API_KEY is not configured on the server')
    err.status = 500
    throw err
  }

  const response = await client.chat.completions.create({
    model:           'llama-3.3-70b-versatile',
    max_tokens:      2048,
    temperature:     0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: buildPrompt(resumeText) },
    ],
  })

  const raw = response.choices[0].message.content.trim()

  try {
    return JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    const err = new Error('AI returned malformed JSON — please retry')
    err.status = 502
    throw err
  }
}

module.exports = { analyzeResume }
