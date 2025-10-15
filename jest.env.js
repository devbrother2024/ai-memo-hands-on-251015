// jest.env.js
// Jest 환경변수 설정 파일
// 테스트 실행 시 필요한 환경변수들을 설정

// 테스트용 환경변수 설정
process.env.GOOGLE_API_KEY = 'test-api-key-for-jest-environment'
process.env.GEMINI_MODEL = 'gemini-2.5-flash'
process.env.GEMINI_MAX_TOKENS = '8192'
process.env.GEMINI_TIMEOUT_MS = '10000'
process.env.GEMINI_DEBUG = 'false'
process.env.NODE_ENV = 'test'

// Supabase 테스트 환경변수 (필요시)
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
