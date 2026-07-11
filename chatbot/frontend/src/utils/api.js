const API_BASE = '/api';

export async function streamChat(messages, { onChunk, onDone, onError, signal }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok) {
    let message = `Server error (${res.status})`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {}
    onError(message);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (!payload) continue;

      try {
        const parsed = JSON.parse(payload);
        if (parsed.error) { onError(parsed.error); return; }
        if (parsed.done)  { onDone(); return; }
        if (parsed.content) onChunk(parsed.content);
      } catch {}
    }
  }

  onDone();
}
