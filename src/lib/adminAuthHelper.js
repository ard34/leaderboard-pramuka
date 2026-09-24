import crypto from "crypto";

const TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || "SILOTI_LT2_KWARRAN_MEKAR_BARU_2026_SECRET";

// Server-side in-memory rate limiter per IP
// Key: IP -> { attempts: number, lockUntil: number, firstAttemptAt: number }
const loginRateLimitMap = new Map();

/**
 * Sign an admin session payload with HMAC-SHA256
 */
export function signAdminToken(user) {
  const now = Date.now();
  const payload = {
    id: user.id || "0f1d4b5c-739c-47dd-adca-4b2123b59ec1",
    email: user.email || "admin@kwarranmekarbaru.my.id",
    nama_lengkap: user.nama_lengkap || "Admin Utama",
    role: "admin",
    iat: now,
    exp: now + 24 * 60 * 60 * 1000, // 24 jam
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(payloadB64).digest("hex");
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 signed admin session token
 */
export function verifyAdminToken(tokenStr) {
  if (!tokenStr || typeof tokenStr !== "string") return null;

  try {
    const parts = tokenStr.trim().split(".");
    if (parts.length !== 2) return null;

    const [payloadB64, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", TOKEN_SECRET).update(payloadB64).digest("hex");

    if (
      signature.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!payload || payload.role !== "admin") return null;

    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch (_) {
    return null;
  }
}

/**
 * Extract and verify admin token from Request headers, cookies, or body
 */
export function verifyAdminRequest(request, optionalToken = null) {
  let token = optionalToken;

  if (!token && request) {
    // 1. Cek Authorization Bearer header
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.slice(7).trim();
    }

    // 2. Cek x-admin-token header
    if (!token) {
      token = request.headers.get("x-admin-token");
    }

    // 3. Cek Cookie admin_session
    if (!token && request.cookies) {
      const cookie = request.cookies.get("admin_session");
      if (cookie) token = cookie.value;
    }
  }

  return verifyAdminToken(token);
}

/**
 * Check if client IP is currently rate-limited
 */
export function checkAdminLoginRateLimit(ip = "client") {
  const now = Date.now();
  const record = loginRateLimitMap.get(ip);

  if (!record) return { allowed: true };

  // Jika sedang masa lockout
  if (record.lockUntil && now < record.lockUntil) {
    const remainingSeconds = Math.ceil((record.lockUntil - now) / 1000);
    return {
      allowed: false,
      remainingSeconds,
      error: `Terlalu banyak percobaan login gagal. Silakan tunggu ${remainingSeconds} detik lagi.`,
    };
  }

  // Jika masa window 15 menit sudah lewat, reset
  if (record.firstAttemptAt && now - record.firstAttemptAt > 15 * 60 * 1000) {
    loginRateLimitMap.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Record a failed login attempt for client IP
 */
export function recordAdminLoginFailure(ip = "client") {
  const now = Date.now();
  const record = loginRateLimitMap.get(ip) || { attempts: 0, firstAttemptAt: now, lockUntil: 0 };

  record.attempts += 1;

  // Batas 5 kali gagal: Lockout selama 60 detik (berlipat jika berulang)
  if (record.attempts >= 5) {
    const lockoutDuration = record.attempts >= 8 ? 5 * 60 * 1000 : 60 * 1000;
    record.lockUntil = now + lockoutDuration;
  }

  loginRateLimitMap.set(ip, record);
}

/**
 * Reset failed login attempts on successful login
 */
export function resetAdminLoginRateLimit(ip = "client") {
  loginRateLimitMap.delete(ip);
}
