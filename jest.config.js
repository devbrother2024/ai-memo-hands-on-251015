// jest.config.js
// Jest 테스트 프레임워크 설정
// TypeScript 지원 및 기본 환경 설정
// 관련 파일: __tests__/**/*.test.ts

/** @type {import('jest').Config} */
const config = {
    // TypeScript 지원을 위한 ts-jest 사용
    preset: 'ts-jest',

    // 테스트 환경 설정
    testEnvironment: 'jsdom',

    // 테스트 파일 패턴
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],

    // 모듈 경로 매핑
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1'
    },

    // 테스트 전 설정 파일
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    // 환경변수 설정
    setupFiles: ['<rootDir>/jest.env.js'],

    // TypeScript 파일 변환 설정
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    jsx: 'react',
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true
                }
            }
        ]
    },

    // 모듈 파일 확장자
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

    // 커버리지 설정
    collectCoverageFrom: [
        'lib/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**'
    ],

    // 테스트 타임아웃
    testTimeout: 10000,

    // 모듈 무시 패턴
    modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/']
}

module.exports = config
