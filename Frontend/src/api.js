const BASE = 'http://localhost:3000/api';

export const getToken = () => localStorage.getItem('token');
export const setToken = t =>
  t ? localStorage.setItem('token', t) : localStorage.removeItem('token');

export async function api(path, method = 'GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned status ${res.status} (not JSON). Check the backend terminal.`);
  }

  // Token expired or missing: send the user back to the login screen
  if (res.status === 401 && path !== '/auth/login') {
    setToken(null);
    window.dispatchEvent(new Event('logout'));
  }

  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

export const inr = p =>
  '₹' + (p / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });