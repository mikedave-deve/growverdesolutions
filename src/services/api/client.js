// Thin fetch wrapper. Today every service function reads from mock
// data (see src/mocks). Once the Express API exists, only this file
// and the individual service functions change — components never
// call fetch() directly, so no page needs to be rewritten.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, { method = "GET", body, headers } = {}) {
  // FormData (file uploads) must not be JSON-stringified, and the
  // browser needs to set its own multipart Content-Type (with
  // boundary) — so it's sent as-is with no Content-Type override.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include", // JWT/session cookie, not localStorage
    headers: isFormData ? headers : { "Content-Type": "application/json", ...headers },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    throw new Error(problem.message || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
  // For links/downloads that navigate the browser directly rather than
  // going through fetch() — e.g. <a href={apiClient.url("/documents/1/download")}>.
  url: (path) => `${BASE_URL}${path}`,
};

// Simulates network latency + the shape of a real response envelope,
// so pages already handle loading/error states correctly pre-backend.
export function mockRequest(data, { delay = 500, failRate = 0 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) {
        reject(new Error("Something went wrong. Please try again."));
      } else {
        resolve(structuredClone(data));
      }
    }, delay);
  });
}
