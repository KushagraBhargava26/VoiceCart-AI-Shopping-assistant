const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const TIMEOUT_MS = 25_000;

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('The request timed out. Please check your connection and try again.');
    }
    // TypeError: Failed to fetch — server is down or unreachable
    throw new Error("Can't reach the server. Please check your connection and try again.");
  } finally {
    clearTimeout(timeoutId);
  }

  const contentType = response.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (parseErr) {
      throw new Error("Invalid response from server. Please try again.");
    }
  } else {
    console.error("Non-JSON response received from API:", response.status, contentType);
    throw new Error("Backend server is starting up or unavailable. Please try again in a moment.");
  }

  if (!response.ok || !data?.success) {
    const message = data?.error?.message || 'Something went wrong. Please try again.';
    const error = new Error(message);
    error.code = data?.error?.code;
    throw error;
  }

  return data.data;
}

export function get(path) {
  return request(path, { method: 'GET' });
}

export function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
}

export function patch(path, body) {
  return request(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export function del(path) {
  return request(path, { method: 'DELETE' });
}