export async function request(url: string, init?: RequestInit) {
  const res = await fetch(url, init);

  if (!res.ok) {
    throw new Error(res.statusText || `HTTP ${res.status}`);
  }

  return res.json();
}
