// lib/ai/gemini-client.ts
// Google Gemini API 클라이언트 구현
// API 호출, 에러 처리, 헬스체크, 사용량 추적 기능 제공
// 관련 파일: lib/ai/types.ts, lib/ai/errors.ts, lib/ai/utils.ts, lib/ai/config.ts

import { GoogleGenAI } from '@google/genai'
import {
    GeminiConfig,
    GenerateTextRequest,
    GenerateTextResponse,
    AIService,
    HealthCheckResult,
    APIUsageLog
} from './types'
import { GeminiError, GeminiErrorType, parseGeminiError } from './errors'
import {
    estimateTokens,
    validateTokenLimit,
    withRetry,
    withTimeout,
    logAPIUsage,
    truncateText
} from './utils'
import { getGeminiConfig, isDebugMode } from './config'

/**
 * Google Gemini API 클라이언트 클래스
 */
export class GeminiClient implements AIService {
    private client: GoogleGenAI
    private config: GeminiConfig

    constructor(config?: Partial<GeminiConfig>) {
        // 설정 로드 및 병합
        const defaultConfig = getGeminiConfig()
        this.config = { ...defaultConfig, ...config }

        // Context7에서 확인한 공식 초기화 방법
        this.client = new GoogleGenAI({
            apiKey: this.config.apiKey
        })

        if (isDebugMode()) {
            console.log('[GeminiClient] Initialized with config:', {
                model: this.config.model,
                maxTokens: this.config.maxTokens,
                timeout: this.config.timeout
            })
        }
    }

    /**
     * 텍스트 생성 API 호출
     * @param request 생성 요청
     * @returns 생성 결과
     */
    async generateText(
        request: GenerateTextRequest
    ): Promise<GenerateTextResponse> {
        const startTime = Date.now()
        const inputTokens = this.estimateTokens(request.prompt)

        // 토큰 제한 검증: 초과 시 입력 텍스트를 잘라내어 진행
        const effectiveMax = request.maxTokens || this.config.maxTokens
        if (!this.validateTokenLimit(inputTokens, effectiveMax)) {
            const truncated = this.truncateToTokenLimit(
                request.prompt,
                effectiveMax
            )
            const truncatedTokens = this.estimateTokens(truncated)
            if (!this.validateTokenLimit(truncatedTokens, effectiveMax)) {
                throw new GeminiError(
                    'TOKEN_LIMIT_EXCEEDED' as GeminiErrorType,
                    `Input tokens (${inputTokens}) exceed limit`,
                    null
                )
            }
            request = { ...request, prompt: truncated }
        }

        try {
            // 재시도 로직과 타임아웃을 포함한 API 호출
            const result = await withRetry(async () => {
                return await withTimeout(
                    this.callGeminiAPI(request),
                    this.config.timeout
                )
            })

            const latencyMs = Date.now() - startTime
            const outputTokens = this.estimateTokens(result.text)

            // 사용량 로깅
            this.logUsage({
                timestamp: new Date(),
                model: request.model || this.config.model,
                inputTokens,
                outputTokens,
                latencyMs,
                success: true
            })

            return {
                text: result.text,
                model: request.model || this.config.model,
                inputTokens,
                outputTokens,
                finishReason: result.finishReason || 'stop'
            }
        } catch (error) {
            const latencyMs = Date.now() - startTime
            const geminiError = parseGeminiError(error)

            // 에러 로깅
            this.logUsage({
                timestamp: new Date(),
                model: request.model || this.config.model,
                inputTokens,
                outputTokens: 0,
                latencyMs,
                success: false,
                error: geminiError.message
            })

            throw geminiError
        }
    }

    /**
     * 실제 Gemini API 호출
     * @param request 생성 요청
     * @returns API 응답
     */
    private async callGeminiAPI(request: GenerateTextRequest): Promise<{
        text: string
        finishReason?: string
    }> {
        try {
            // Context7에서 확인한 정확한 API 호출 방법
            const response = await this.client.models.generateContent({
                model: request.model || this.config.model,
                contents: request.prompt, // 직접 문자열 전달
                config: {
                    maxOutputTokens: request.maxTokens || this.config.maxTokens,
                    temperature: request.temperature || 0.7,
                    topP: 0.9,
                    topK: 40
                }
            })

            if (isDebugMode()) {
                console.log('[GeminiClient] API Response:', {
                    hasText: !!response.text,
                    tokenCount: response.usageMetadata?.totalTokenCount,
                    finishReason: response.candidates?.[0]?.finishReason
                })
            }

            if (!response.text) {
                throw new Error('Empty response from Gemini API')
            }

            return {
                text: response.text,
                finishReason: response.candidates?.[0]?.finishReason || 'stop'
            }
        } catch (error: unknown) {
            if (isDebugMode()) {
                console.error('[GeminiClient] API call failed:', error)
            }
            throw error
        }
    }

    /**
     * API 연결 상태 확인 (헬스체크)
     * @returns 헬스체크 결과
     */
    async healthCheck(): Promise<boolean> {
        try {
            const result = await this.healthCheckDetailed()
            return result.success
        } catch (error) {
            return false
        }
    }

    /**
     * 상세한 헬스체크 수행
     * @returns 상세한 헬스체크 결과
     */
    async healthCheckDetailed(): Promise<HealthCheckResult> {
        const startTime = Date.now()

        try {
            // 간단한 텍스트 생성으로 헬스체크
            const response = await this.generateText({
                prompt: 'Hello',
                maxTokens: 10
            })

            const latencyMs = Date.now() - startTime

            if (isDebugMode()) {
                console.log('[GeminiClient] Health check passed:', {
                    latencyMs,
                    responseLength: response.text.length
                })
            }

            return {
                success: true,
                latencyMs,
                timestamp: new Date()
            }
        } catch (error) {
            const latencyMs = Date.now() - startTime
            const geminiError = parseGeminiError(error)

            if (isDebugMode()) {
                console.error(
                    '[GeminiClient] Health check failed:',
                    geminiError.message
                )
            }

            return {
                success: false,
                latencyMs,
                error: geminiError.message,
                timestamp: new Date()
            }
        }
    }

    /**
     * 토큰 수 추정
     * @param text 텍스트
     * @returns 추정 토큰 수
     */
    estimateTokens(text: string): number {
        return estimateTokens(text)
    }

    /**
     * 토큰 제한 검증
     * @param inputTokens 입력 토큰 수
     * @param maxTokens 최대 토큰 수
     * @returns 제한 내에 있는지 여부
     */
    validateTokenLimit(inputTokens: number, maxTokens?: number): boolean {
        return validateTokenLimit(
            inputTokens,
            maxTokens || this.config.maxTokens
        )
    }

    /**
     * 텍스트를 토큰 제한에 맞게 자르기
     * @param text 원본 텍스트
     * @param maxTokens 최대 토큰 수
     * @returns 잘린 텍스트
     */
    truncateToTokenLimit(text: string, maxTokens?: number): string {
        return truncateText(text, maxTokens || this.config.maxTokens)
    }

    /**
     * 사용량 로깅
     * @param log 로그 데이터
     */
    private logUsage(log: APIUsageLog): void {
        logAPIUsage(log)
    }

    /**
     * 현재 설정 반환
     * @returns 현재 설정 (API 키 마스킹됨)
     */
    getConfig(): Omit<GeminiConfig, 'apiKey'> & { apiKey: string } {
        return {
            ...this.config,
            apiKey: `${this.config.apiKey.substring(0, 8)}...`
        }
    }

    /**
     * 설정 업데이트
     * @param newConfig 새로운 설정
     */
    updateConfig(newConfig: Partial<GeminiConfig>): void {
        this.config = { ...this.config, ...newConfig }

        // API 키가 변경된 경우 클라이언트 재초기화
        if (newConfig.apiKey) {
            this.client = new GoogleGenAI({
                apiKey: this.config.apiKey
            })
        }

        if (isDebugMode()) {
            console.log('[GeminiClient] Config updated')
        }
    }
}

/**
 * 싱글톤 인스턴스 생성 및 반환
 */
let geminiClientInstance: GeminiClient | null = null

export function getGeminiClient(): GeminiClient {
    if (!geminiClientInstance) {
        geminiClientInstance = new GeminiClient()
    }
    return geminiClientInstance
}

/**
 * 클라이언트 인스턴스 재설정 (테스트용)
 */
export function resetGeminiClient(): void {
    geminiClientInstance = null
}
