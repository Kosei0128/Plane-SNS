/**
 * レート制限ミドルウェア
 * Upstash Redisを使用してAPIリクエストのレート制限を実装します
 * 
 * 環境変数が設定されていない場合は、メモリベースのフォールバックを使用します
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { RATE_LIMIT, ERROR_MESSAGES } from "@/lib/constants";

// Upstash Redis設定
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// レート制限の設定
const createRateLimiter = (maxRequests: number, windowMs: number) => {
  if (!redis) {
    console.warn(
      "⚠️ Upstash Redis not configured. Using in-memory rate limiting (not recommended for production)."
    );
    // メモリベースのフォールバック（開発環境用）
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
    analytics: true,
  });
};

// 各エンドポイントタイプ用のレート制限インスタンス
export const defaultRateLimiter = createRateLimiter(
  RATE_LIMIT.DEFAULT.MAX_REQUESTS,
  RATE_LIMIT.DEFAULT.WINDOW_MS
);

export const authRateLimiter = createRateLimiter(
  RATE_LIMIT.AUTH.MAX_REQUESTS,
  RATE_LIMIT.AUTH.WINDOW_MS
);

export const paymentRateLimiter = createRateLimiter(
  RATE_LIMIT.PAYMENT.MAX_REQUESTS,
  RATE_LIMIT.PAYMENT.WINDOW_MS
);

/**
 * メモリベースのレート制限（フォールバック用）
 */
class InMemoryRateLimiter {
  private requests: Map<string, number[]> = new Map();

  async limit(identifier: string, maxRequests: number, windowMs: number) {
    const now = Date.now();
    const windowStart = now - windowMs;

    // 古いリクエストを削除
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter((timestamp) => timestamp > windowStart);

    if (recentRequests.length >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: new Date(recentRequests[0] + windowMs),
      };
    }

    // 新しいリクエストを記録
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - recentRequests.length,
      reset: new Date(now + windowMs),
    };
  }
}

const inMemoryLimiter = new InMemoryRateLimiter();

/**
 * レート制限を適用するヘルパー関数
 * 
 * @param request NextRequest オブジェクト
 * @param limiter 使用するレート制限インスタンス
 * @param maxRequests 最大リクエスト数（メモリベース用）
 * @param windowMs ウィンドウ時間（メモリベース用）
 * @returns レート制限の結果
 */
export async function applyRateLimit(
  request: NextRequest,
  limiter: Ratelimit | null,
  maxRequests: number = RATE_LIMIT.DEFAULT.MAX_REQUESTS,
  windowMs: number = RATE_LIMIT.DEFAULT.WINDOW_MS
) {
  // IPアドレスまたはユーザーIDを識別子として使用
  const identifier = getIdentifier(request);

  if (!limiter) {
    // メモリベースのフォールバック
    return await inMemoryLimiter.limit(identifier, maxRequests, windowMs);
  }

  // Upstash Redisを使用
  const result = await limiter.limit(identifier);

  return result;
}

/**
 * リクエストの識別子を取得
 * 
 * @param request NextRequest オブジェクト
 * @returns 識別子（IPアドレスまたはユーザーID）
 */
function getIdentifier(request: NextRequest): string {
  // 認証トークンからユーザーIDを取得
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    // トークンの一部をハッシュ化して使用（完全なトークンは長すぎるため）
    return `user_${token.substring(0, 20)}`;
  }

  // IPアドレスを取得
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";

  return `ip_${ip}`;
}

/**
 * レート制限エラーレスポンスを生成
 * 
 * @param result レート制限の結果
 * @returns NextResponse
 */
export function createRateLimitResponse(result: {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}) {
  const response = NextResponse.json(
    {
      success: false,
      message: "リクエストが多すぎます。しばらくしてから再試行してください。",
      error: ERROR_MESSAGES.SERVER_ERROR,
    },
    { status: 429 }
  );

  // レート制限情報をヘッダーに追加
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", result.reset.toISOString());

  return response;
}

/**
 * レート制限を適用するデコレーター関数
 * 
 * @param limiter 使用するレート制限インスタンス
 * @param maxRequests 最大リクエスト数（メモリベース用）
 * @param windowMs ウィンドウ時間（メモリベース用）
 * @returns デコレーター関数
 */
export function withRateLimit(
  limiter: Ratelimit | null,
  maxRequests?: number,
  windowMs?: number
) {
  return function (handler: (request: NextRequest) => Promise<NextResponse>) {
    return async function (request: NextRequest): Promise<NextResponse> {
      const result = await applyRateLimit(request, limiter, maxRequests, windowMs);

      if (!result.success) {
        return createRateLimitResponse(result);
      }

      return handler(request);
    };
  };
}

