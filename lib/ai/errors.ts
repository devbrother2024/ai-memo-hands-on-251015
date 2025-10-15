// lib/ai/errors.ts
// AI 관련 에러 타입과 에러 핸들링 유틸리티
// Gemini API 에러를 분류하고 적절한 에러 메시지를 제공
// 관련 파일: lib/ai/gemini-client.ts, lib/ai/utils.ts

/**
 * Gemini API 에러 타입 열거형
 */
export enum GeminiErrorType {
    API_KEY_INVALID = 'API_KEY_INVALID',
    QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
    TIMEOUT = 'TIMEOUT',
    CONTENT_FILTERED = 'CONTENT_FILTERED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    TOKEN_LIMIT_EXCEEDED = 'TOKEN_LIMIT_EXCEEDED',
    MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
    UNKNOWN = 'UNKNOWN'
}

/**
 * Gemini API 커스텀 에러 클래스
 */
export class GeminiError extends Error {
    constructor(
        public type: GeminiErrorType,
        message: string,
        public originalError?: any,
        public statusCode?: number
    ) {
        super(message)
        this.name = 'GeminiError'
    }

    /**
     * 에러가 재시도 가능한지 확인
     */
    isRetryable(): boolean {
        return [
            GeminiErrorType.NETWORK_ERROR,
            GeminiErrorType.TIMEOUT,
            GeminiErrorType.QUOTA_EXCEEDED
        ].includes(this.type)
    }

    /**
     * 사용자 친화적인 에러 메시지 반환
     */
    getUserMessage(): string {
        switch (this.type) {
            case GeminiErrorType.API_KEY_INVALID:
                return 'API 키가 유효하지 않습니다. 설정을 확인해주세요.'
            case GeminiErrorType.QUOTA_EXCEEDED:
                return 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
            case GeminiErrorType.TIMEOUT:
                return '요청 시간이 초과되었습니다. 다시 시도해주세요.'
            case GeminiErrorType.CONTENT_FILTERED:
                return '콘텐츠가 필터링되었습니다. 다른 내용으로 시도해주세요.'
            case GeminiErrorType.TOKEN_LIMIT_EXCEEDED:
                return '텍스트가 너무 깁니다. 더 짧은 내용으로 시도해주세요.'
            case GeminiErrorType.MODEL_NOT_FOUND:
                return '요청한 AI 모델을 찾을 수 없습니다.'
            case GeminiErrorType.NETWORK_ERROR:
                return '네트워크 연결에 문제가 있습니다. 연결을 확인해주세요.'
            default:
                return '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.'
        }
    }
}

/**
 * 원본 에러를 GeminiError로 변환
 */
export function parseGeminiError(error: any): GeminiError {
    // API 키 관련 에러
    if (error.message?.includes('API key') || error.status === 401) {
        return new GeminiError(
            GeminiErrorType.API_KEY_INVALID,
            'Invalid API key',
            error,
            error.status
        )
    }

    // 할당량 초과 에러
    if (error.status === 429 || error.message?.includes('quota')) {
        return new GeminiError(
            GeminiErrorType.QUOTA_EXCEEDED,
            'API quota exceeded',
            error,
            error.status
        )
    }

    // 타임아웃 에러
    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
        return new GeminiError(
            GeminiErrorType.TIMEOUT,
            'Request timeout',
            error
        )
    }

    // 콘텐츠 필터링 에러
    if (
        error.message?.includes('content') &&
        error.message?.includes('filter')
    ) {
        return new GeminiError(
            GeminiErrorType.CONTENT_FILTERED,
            'Content filtered',
            error,
            error.status
        )
    }

    // 토큰 제한 에러
    if (error.message?.includes('token') && error.message?.includes('limit')) {
        return new GeminiError(
            GeminiErrorType.TOKEN_LIMIT_EXCEEDED,
            'Token limit exceeded',
            error,
            error.status
        )
    }

    // 모델 찾을 수 없음 에러
    if (error.status === 404 || error.message?.includes('model')) {
        return new GeminiError(
            GeminiErrorType.MODEL_NOT_FOUND,
            'Model not found',
            error,
            error.status
        )
    }

    // 네트워크 에러
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return new GeminiError(
            GeminiErrorType.NETWORK_ERROR,
            'Network error',
            error
        )
    }

    // 기타 에러
    return new GeminiError(
        GeminiErrorType.UNKNOWN,
        error.message || 'Unknown error',
        error,
        error.status
    )
}

/**
 * 재시도 불가능한 에러인지 확인
 */
export function isNonRetryableError(error: any): boolean {
    const geminiError =
        error instanceof GeminiError ? error : parseGeminiError(error)
    return !geminiError.isRetryable()
}
