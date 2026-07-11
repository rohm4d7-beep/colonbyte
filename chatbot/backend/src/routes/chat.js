const express = require('express');
const OpenAI = require('openai');

const router = express.Router();

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are a helpful, knowledgeable, and concise AI assistant.
Respond clearly and accurately. Use markdown formatting when it improves readability
(code blocks, lists, bold text). Keep responses focused and avoid unnecessary padding.`,
};

router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  const sanitized = messages
    .filter((m) => m.role && m.content && typeof m.content === 'string')
    .map(({ role, content }) => ({ role, content: content.slice(0, 8000) }))
    .slice(-40);

  if (sanitized.length === 0) {
    return res.status(400).json({ error: 'No valid messages provided' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [SYSTEM_PROMPT, ...sanitized],
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) send({ content: delta });
    }

    send({ done: true });
  } catch (err) {
    const isApiError = err instanceof OpenAI.APIError;
    const message = isApiError
      ? `OpenAI error: ${err.message}`
      : 'An unexpected error occurred. Please try again.';

    send({ error: message });
    console.error('Chat route error:', err.message);
  } finally {
    res.end();
  }
});

module.exports = router;
