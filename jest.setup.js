// jest.setup.js
// Jest 테스트 환경 설정 파일
// 테스트 실행 전 공통 설정 및 모킹 설정

require('@testing-library/jest-dom')

// 환경변수 설정 (테스트용)
process.env.GOOGLE_API_KEY = 'test-api-key-for-jest'
process.env.GEMINI_MODEL = 'gemini-2.5-flash'
process.env.GEMINI_MAX_TOKENS = '8192'
process.env.GEMINI_TIMEOUT_MS = '10000'
process.env.NODE_ENV = 'test'

// 콘솔 로그 억제 (필요시 주석 해제)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// }

// 전역 테스트 설정
beforeEach(() => {
    // 각 테스트 전에 모든 모킹 초기화
    jest.clearAllMocks()
})

// 테스트 완료 후 정리
afterAll(() => {
    // 필요시 정리 작업
})
