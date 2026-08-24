function getBaseUrl() {
  try {
    const envUrl = typeof import.meta !== "undefined" && import.meta && import.meta.env ? import.meta.env.VITE_API_BASE_URL : null;
    if (envUrl) {
      return envUrl.replace(/\/$/, "");
    }
  } catch (e) {}

  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "https://voicecart-backend.onrender.com/api/v1";
  }
  return "http://localhost:5000/api/v1";
}

const BASE_URL = getBaseUrl();

// Render free tier cold-starts can take up to 60 seconds
const TIMEOUT_MS = 60_000;

// Background ping to wake up Render server on page load
if (typeof window !== "undefined") {
  try {
    fetch(`${BASE_URL}/health`).catch(() => {});
  } catch (e) {}
}

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
      throw new Error('Server is taking a moment to start up. Please try again.');
    }
    throw new Error("Server is starting up or offline. Using local session mode.");
  } finally {
    clearTimeout(timeoutId);
  }

  const contentType = response.headers.get("content-type") || "";
  let data;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch (parseErr) {
      throw new Error("Invalid response from server.");
    }
  } else {
    console.warn("Non-JSON response received from API:", response.status, contentType);
    throw new Error("Backend server is waking up. Using local session mode.");
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