// lib/ai/config.ts
// AI 관련 설정 관리 파일
// 환경변수를 읽어서 Gemini API 설정을 제공하고 검증
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/types.ts

import { GeminiConfig } from './types'

/**
 * Gemini API 설정을 환경변수에서 읽어와 반환
 * @returns GeminiConfig 객체
 * @throws Error API 키가 없거나 필수 설정이 누락된 경우
 */
export function getGeminiConfig(): GeminiConfig {
    const config: GeminiConfig = {
        apiKey: process.env.GOOGLE_API_KEY!,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '8192'),
        timeout: parseInt(process.env.GEMINI_TIMEOUT_MS || '10000'),
        debug: process.env.GEMINI_DEBUG === 'true',
        rateLimitPerMinute: parseInt(process.env.GEMINI_RATE_LIMIT || '60')
    }

    // 필수 설정 검증
    if (!config.apiKey) {
        throw new Error(
            'GOOGLE_API_KEY is required. Please set it in your environment variables.'
        )
    }

    // 설정값 유효성 검증
    if (config.maxTokens <= 0 || config.maxTokens > 32768) {
        throw new Error('GEMINI_MAX_TOKENS must be between 1 and 32768')
    }

    if (config.timeout <= 0 || config.timeout > 60000) {
        throw new Error('GEMINI_TIMEOUT_MS must be between 1 and 60000')
    }

    if (config.rateLimitPerMinute <= 0 || config.rateLimitPerMinute > 1000) {
        throw new Error('GEMINI_RATE_LIMIT must be between 1 and 1000')
    }

    return config
}

/**
 * 개발 환경 여부 확인
 * @returns 개발 환경인지 여부
 */
export function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
}

/**
 * 프로덕션 환경 여부 확인
 * @returns 프로덕션 환경인지 여부
 */
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production'
}

/**
 * 디버그 모드 여부 확인
 * @returns 디버그 모드인지 여부
 */
export function isDebugMode(): boolean {
    return process.env.GEMINI_DEBUG === 'true'
}

/**
 * 환경별 로그 레벨 반환
 * @returns 로그 레벨 ('debug' | 'info' | 'warn' | 'error')
 */
export function getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
    if (isDevelopment() || isDebugMode()) {
        return 'debug'
    }

    if (isProduction()) {
        return 'warn'
    }

    return 'info'
}

/**
 * 설정 정보를 안전하게 로그용으로 변환 (API 키 마스킹)
 * @param config Gemini 설정
 * @returns 마스킹된 설정 정보
 */
export function maskConfigForLogging(
    config: GeminiConfig
): Partial<GeminiConfig> {
    return {
        model: config.model,
        maxTokens: config.maxTokens,
        timeout: config.timeout,
        debug: config.debug,
        rateLimitPerMinute: config.rateLimitPerMinute,
        apiKey: config.apiKey
            ? `${config.apiKey.substring(0, 8)}...`
            : 'NOT_SET'
    }
}

/**
 * 환경변수 설정 상태 확인
 * @returns 설정 상태 정보
 */
export function checkEnvironmentSetup(): {
    isValid: boolean
    missingVars: string[]
    warnings: string[]
} {
    const missingVars: string[] = []
    const warnings: string[] = []

    // 필수 환경변수 확인
    if (!process.env.GOOGLE_API_KEY) {
        missingVars.push('GOOGLE_API_KEY')
    }

    // 선택적 환경변수 확인 및 경고
    if (!process.env.GEMINI_MODEL) {
        warnings.push('GEMINI_MODEL not set, using default: gemini-2.5-flash')
    }

    if (!process.env.GEMINI_MAX_TOKENS) {
        warnings.push('GEMINI_MAX_TOKENS not set, using default: 8192')
    }

    if (!process.env.GEMINI_TIMEOUT_MS) {
        warnings.push('GEMINI_TIMEOUT_MS not set, using default: 10000')
    }

    return {
        isValid: missingVars.length === 0,
        missingVars,
        warnings
    }
}
