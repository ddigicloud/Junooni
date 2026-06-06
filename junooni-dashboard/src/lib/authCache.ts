const BACKEND = import.meta.env.VITE_MEDUSA_BACKEND_URL;
const TTL = 5 * 60 * 1000; // 5 minutes

interface AuthResult {
  status: number;
  ok: boolean;
  vendor?: any;
}

let _cache: { result: AuthResult; ts: number } | null = null;
let _inFlight: Promise<AuthResult> | null = null;

export function clearAuthCache() {
  _cache = null;
  _inFlight = null;
}

export async function getVendorMe(token: string): Promise<AuthResult | null> {
  // Return cache if fresh
  if (_cache && Date.now() - _cache.ts < TTL) return _cache.result;

  // Deduplicate concurrent calls — only 1 network request fires
  if (_inFlight) return _inFlight;

  _inFlight = fetch(`${BACKEND}/vendors/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
    .then(async (res) => {
      const data = res.ok ? await res.json() : null;
      const result: AuthResult = {
        status: res.status,
        ok: res.ok,
        vendor: data?.vendor ?? null,
      };
      _cache = { result, ts: Date.now() };
      _inFlight = null;
      return result;
    })
    .catch((err) => {
      console.warn("Auth verify failed:", err);
      _inFlight = null;
      return null;
    });

  return _inFlight;
}