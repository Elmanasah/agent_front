import api from './axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Stream a chat message via SSE (Server-Sent Events).
 *
 * @param {object} params
 * @param {string}   params.message
 * @param {object[]} params.attachments   [{ data: base64, mimeType }]
 * @param {string|null} params.sessionId
 * @param {function} params.onEvent       (event: object) => void
 * @param {AbortSignal} [params.signal]   Optional AbortController signal
 * @returns {Promise<void>}
 *
 * Event types the callback receives:
 *   { type: "token",       text: "..." }
 *   { type: "tool_start",  tool: "...", args: {...} }
 *   { type: "tool_result", tool: "...", result: {...} }
 *   { type: "error",       message: "..." }
 *   { type: "done",        sessionId: "...", toolResults: [...] }
 */
async function streamChat({ message, attachments = [], sessionId, onEvent, signal }) {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // sends the HTTP-only JWT cookie
    body: JSON.stringify({ message, attachments, sessionId }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.error || err.message || `HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep incomplete last line in buffer

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;
        try {
          const event = JSON.parse(jsonStr);
          onEvent(event);
        } catch {
          // skip malformed event
        }
      }
    }
  }
}

const ChatService = {
  streamChat,
  reset: async ({ sessionId } = {}) => {
    const response = await api.post('/chat/reset', { sessionId });
    return response.data;
  },
};

export default ChatService;
