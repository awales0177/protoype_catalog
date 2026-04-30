/**
 * POST /feedback
 * Set `REACT_APP_API_URL` (e.g. http://localhost:8000/api) when pointing at a non-default API base.
 */

function apiBase() {
  const raw = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  return String(raw).replace(/\/$/, '');
}

function getAuthHeaders() {
  if (typeof localStorage === 'undefined') return {};
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function submitFeedback({ userId, feedbackText }) {
  const response = await fetch(`${apiBase()}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      ...(userId ? { userId: String(userId) } : {}),
      feedbackText: String(feedbackText ?? ''),
    }),
  });
  let data = {};
  try {
    data = await response.json();
  } catch {
    /* non-JSON body */
  }
  if (!response.ok) {
    let msg = data.detail ?? `HTTP ${response.status}`;
    if (Array.isArray(msg)) {
      msg = msg
        .map((x) => (typeof x === 'string' ? x : x.msg || JSON.stringify(x)))
        .join('; ');
    }
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}
