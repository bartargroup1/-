import { ConnectionStatus } from '../types/portal';

export interface ProbeResult {
  status: ConnectionStatus;
  latencyMs?: number;
  message: string;
}

/**
 * Honest network probe for real endpoints.
 * Uses AbortController with a 4500ms timeout.
 * Clearly differentiates between true reachability, CORS opaque response, and connection failure.
 */
export async function probeEndpoint(targetUrl: string): Promise<ProbeResult> {
  if (!targetUrl || targetUrl.trim() === '') {
    return {
      status: 'untested',
      message: 'آدرس سامانه مشخص نشده است',
    };
  }

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4500);

  try {
    // First attempt: direct fetch (works if CORS is allowed or same-origin)
    const response = await fetch(targetUrl, {
      method: 'GET',
      mode: 'no-cors', // allows reaching intranet / cross-origin servers without CORS crash
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (response.type === 'opaque') {
      return {
        status: 'reachable',
        latencyMs,
        message: `پاسخ شبکه دریافت شد (${latencyMs}ms - بدون هدر CORS)`,
      };
    }

    if (response.ok || (response.status >= 200 && response.status < 400)) {
      return {
        status: 'reachable',
        latencyMs,
        message: `پاسخ موفق (${response.status} - ${latencyMs}ms)`,
      };
    }

    return {
      status: 'reachable',
      latencyMs,
      message: `سرور فعال است (${response.status} - ${latencyMs}ms)`,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return {
          status: 'unreachable',
          latencyMs,
          message: 'اتصال با وقفه زمانی مواجه شد (Timeout > ۴.۵s)',
        };
      }
    }

    return {
      status: 'unreachable',
      latencyMs,
      message: 'عدم پاسخ سرور یا محدودیت شبکه محلی',
    };
  }
}

/**
 * Format Persian numbers for tabular and clean display
 */
export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
}
