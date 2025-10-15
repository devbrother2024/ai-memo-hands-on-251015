// lib/ai/utils.ts
// AI 관련 유틸리티 함수들
// 토큰 계산, 재시도 로직, 사용량 로깅 등의 공통 기능 제공
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/types.ts, lib/ai/errors.ts

import { APIUsageLog } from './types'
import { isNonRetryableError } from './errors'

/**
 * 텍스트의 대략적인 토큰 수 계산
 * @param text 계산할 텍스트
 * @returns 예상 토큰 수
 */
export function estimateTokens(text: string): number {
    // 대략적인 토큰 수 계산 (1 토큰 ≈ 4 문자)
    // 한글의 경우 더 정확한 계산을 위해 조정
    const koreanChars = (text.match(/[가-힣]/g) || []).length
    const otherChars = text.length - koreanChars

    // 한글은 1.5배, 영문/숫자는 0.25배로 계산
    return Math.ceil(koreanChars * 1.5 + otherChars * 0.25)
}

/**
 * 토큰 제한 검증
 * @param inputTokens 입력 토큰 수
 * @param maxTokens 최대 토큰 수 (기본값: 8192)
 * @returns 제한 내에 있는지 여부
 */
export function validateTokenLimit(
    inputTokens: number,
    maxTokens: number = 8192
): boolean {
    // 응답용 토큰 여유분: 전체의 30% 또는 최대 2000 중 작은 값
    const dynamicReserve = Math.floor(maxTokens * 0.3)
    const reservedTokens = Math.min(2000, dynamicReserve)

    // 최소 1 토큰은 입력에 할당
    const allowedInput = Math.max(1, maxTokens - reservedTokens)
    return inputTokens <= allowedInput
}

/**
 * API 사용량 로깅
 * @param log 로그 데이터
 */
export function logAPIUsage(log: APIUsageLog): void {
    // 개발 환경에서는 콘솔 출력
    if (process.env.NODE_ENV === 'development') {
        console.log('[Gemini API Usage]', {
            timestamp: log.timestamp.toISOString(),
            model: log.model,
            inputTokens: log.inputTokens,
            outputTokens: log.outputTokens,
            latencyMs: log.latencyMs,
            success: log.success,
            error: log.error
        })
    }

    // 프로덕션에서는 실제 로깅 시스템으로 전송
    // TODO: 로깅 시스템 연동 (예: Vercel Analytics, Sentry 등)
}

/**
 * 재시도 로직이 포함된 비동기 함수 실행
 * @param operation 실행할 비동기 함수
 * @param maxRetries 최대 재시도 횟수 (기본값: 3)
 * @param backoffMs 재시도 간격 (기본값: 1000ms)
 * @returns 함수 실행 결과
 */
export async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    backoffMs: number = 1000
): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation()
        } catch (error) {
            lastError = error as Error

            // 재시도 불가능한 에러는 즉시 throw
            if (isNonRetryableError(error)) {
                throw error
            }

            // 마지막 시도가 아니면 대기 후 재시도
            if (attempt < maxRetries) {
                await sleep(backoffMs * attempt) // 지수 백오프
            }
        }
    }

    throw lastError!
}

/**
 * 지정된 시간만큼 대기
 * @param ms 대기 시간 (밀리초)
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 타임아웃이 포함된 Promise 실행
 * @param promise 실행할 Promise
 * @param timeoutMs 타임아웃 시간 (밀리초)
 * @returns Promise 결과
 */
export function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeoutMs}ms`))
            }, timeoutMs)
        })
    ])
}

/**
 * 텍스트를 토큰 제한에 맞게 자르기
 * @param text 원본 텍스트
 * @param maxTokens 최대 토큰 수
 * @returns 잘린 텍스트
 */
export function truncateText(text: string, maxTokens: number): string {
    const estimatedTokens = estimateTokens(text)

    if (estimatedTokens <= maxTokens) {
        return text
    }

    // 대략적인 비율로 텍스트 자르기
    const ratio = maxTokens / estimatedTokens
    const targetLength = Math.floor(text.length * ratio * 0.9) // 10% 여유분

    // 단어 경계에서 자르기
    const truncated = text.substring(0, targetLength)
    const lastSpaceIndex = truncated.lastIndexOf(' ')

    return lastSpaceIndex > 0
        ? truncated.substring(0, lastSpaceIndex)
        : truncated
}

/**
 * 사용량 제한 체크
 * @param currentUsage 현재 사용량
 * @param limit 제한값
 * @param windowMs 시간 윈도우 (밀리초)
 * @returns 제한 내에 있는지 여부
 */
export function checkRateLimit(
    currentUsage: number,
    limit: number,
    windowMs: number = 60000 // 1분
): boolean {
    // 간단한 레이트 리미팅 체크
    // 실제 구현에서는 Redis 등을 사용하여 더 정교한 구현 필요
    return currentUsage < limit
}
