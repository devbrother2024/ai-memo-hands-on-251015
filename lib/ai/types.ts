// lib/ai/types.ts
// AI 관련 타입 정의 파일
// Gemini API 요청/응답 타입과 에러 타입을 정의
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/errors.ts

/**
 * Gemini API 설정 인터페이스
 */
export interface GeminiConfig {
    apiKey: string
    model: string
    maxTokens: number
    timeout: number
    debug: boolean
    rateLimitPerMinute: number
}

/**
 * API 사용량 로그 인터페이스
 */
export interface APIUsageLog {
    timestamp: Date
    model: string
    inputTokens: number
    outputTokens: number
    latencyMs: number
    success: boolean
    error?: string
}

/**
 * 텍스트 생성 요청 인터페이스
 */
export interface GenerateTextRequest {
    prompt: string
    model?: string
    maxTokens?: number
    temperature?: number
}

/**
 * 텍스트 생성 응답 인터페이스
 */
export interface GenerateTextResponse {
    text: string
    model: string
    inputTokens: number
    outputTokens: number
    finishReason: string
}

/**
 * AI 서비스 공통 인터페이스
 */
export interface AIService {
    generateText(request: GenerateTextRequest): Promise<GenerateTextResponse>
    healthCheck(): Promise<boolean>
    estimateTokens(text: string): number
    validateTokenLimit(inputTokens: number, maxTokens?: number): boolean
}

/**
 * 헬스체크 결과 인터페이스
 */
export interface HealthCheckResult {
    success: boolean
    latencyMs: number
    error?: string
    timestamp: Date
}

/**
 * 태그 생성 요청 인터페이스
 */
export interface GenerateTagsRequest {
    content: string
    maxTags?: number
    model?: string
    maxTokens?: number
}

/**
 * 태그 생성 응답 인터페이스
 */
export interface GenerateTagsResponse {
    tags: string[]
    model: string
    inputTokens: number
    outputTokens: number
    finishReason: string
}
