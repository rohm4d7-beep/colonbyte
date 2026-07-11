export async function analyzeResume(file) {
  const formData = new FormData()
  formData.append('resume', file)

  const res = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || `Server error ${res.status}`)
  }

  return json.data
}
