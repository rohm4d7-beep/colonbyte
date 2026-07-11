const STORAGE_KEY = 'ai_chat_conversations';

export function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage quota exceeded — silently fail
  }
}

export function clearConversations() {
  localStorage.removeItem(STORAGE_KEY);
}
