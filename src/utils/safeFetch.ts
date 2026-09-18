/**
 * Safe JSON fetch helper
 * Mencegah error "Unexpected token '<' / 'T' ... is not valid JSON"
 * ketika endpoint mengembalikan halaman HTML (misal 404 dari Vercel / server proxy).
 */

export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  isHtmlOrNotJson?: boolean;
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<SafeFetchResult<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options?.headers || {}),
      },
    });

    const contentType = res.headers.get('content-type') || '';

    // Jika response bukan JSON (misal HTML 404 dari Vercel/Vite/proxy)
    if (!contentType.includes('application/json')) {
      const _htmlPreview = await res.text();
      return {
        ok: false,
        status: res.status,
        isHtmlOrNotJson: true,
        error: `Server mengembalikan halaman non-JSON (Status HTTP ${res.status}).`,
      };
    }

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data,
        error: data?.error || `Permintaan gagal dengan status HTTP ${res.status}.`,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err.message || 'Gagal menghubungi server.',
    };
  }
}
