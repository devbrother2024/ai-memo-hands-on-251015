import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // postgres 패키지를 서버 사이드에서만 사용하도록 설정
    serverExternalPackages: ['postgres'],
    // Turbopack 설정
    turbopack: {
        rules: {
            '*.node': {
                loaders: ['file-loader'],
                as: '*.js'
            }
        }
    },
    // 웹팩 설정으로 Node.js 내장 모듈들을 외부로 처리
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                perf_hooks: false,
                os: false,
                crypto: false,
                stream: false
            }
        }
        return config
    }
}

export default nextConfig
