-- supabase/migrations/0002_seed_mock_notes.sql
-- 요약 기능 테스트를 위한 노트 목업 데이터 생성
-- 다양한 길이와 주제의 노트 샘플 데이터를 제공한다
-- 관련 파일: lib/db/schema/notes.ts, lib/db/schema/summaries.ts

-- 테스트용 사용자 ID (실제 Supabase Auth 사용자 ID로 교체 필요)
-- 사용 방법: 실제 사용자의 UUID를 아래 변수에 설정하고 실행
DO $$
DECLARE
    test_user_id uuid := 'YOUR_USER_ID_HERE'; -- 실제 사용자 ID로 교체
BEGIN
    -- 1. 회의록 (긴 텍스트)
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_user_id,
        '2024년 1분기 마케팅 전략 회의',
        '## 회의 개요
날짜: 2024년 1월 15일
참석자: 김마케팅, 이기획, 박개발, 최디자인

## 주요 안건
1. 신제품 런칭 계획
   - 목표: 3월 중 신제품 출시
   - 예산: 5억원
   - 마케팅 채널: 온라인 광고, 인플루언서 마케팅, PR

2. 브랜드 포지셔닝 전략
   - 타겟 고객: 25-35세 직장인
   - 핵심 메시지: "편리함과 스타일의 조화"
   - 경쟁사 분석 결과 공유

3. 디지털 마케팅 전략
   - SEO 최적화: 블로그 콘텐츠 50개 작성
   - SNS 마케팅: 인스타그램, 틱톡 중심
   - 이메일 마케팅: 주간 뉴스레터 발송

## 액션 아이템
- 김마케팅: 신제품 소재 제작 (1월 말까지)
- 이기획: 경쟁사 분석 보고서 (2월 첫째 주)
- 박개발: 랜딩 페이지 개발 (2월 중순)
- 최디자인: 브랜드 가이드라인 업데이트 (1월 말까지)

## 다음 회의
- 일시: 2024년 1월 29일 오후 2시
- 장소: 회의실 A
- 안건: 1분기 마케팅 예산 배분, 광고 크리에이티브 검토',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '5 days'
    );

    -- 2. 기술 문서 (중간 길이)
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_user_id,
        'Next.js 14 App Router 마이그레이션 가이드',
        '# Next.js 14 App Router 마이그레이션

## 개요
기존 Pages Router에서 App Router로 마이그레이션하는 과정을 정리했습니다.

## 주요 변경사항

### 1. 디렉토리 구조
```
app/
├── layout.tsx          # 루트 레이아웃
├── page.tsx           # 홈페이지
├── loading.tsx        # 로딩 UI
├── error.tsx          # 에러 UI
└── (routes)/
    ├── about/
    │   └── page.tsx
    └── contact/
        └── page.tsx
```

### 2. 서버 컴포넌트 기본
- 모든 컴포넌트는 기본적으로 서버 컴포넌트
- 클라이언트 컴포넌트는 "use client" 지시어 필요

### 3. 데이터 페칭
```typescript
// 서버 컴포넌트에서 직접 데이터 페칭
async function getData() {
  const res = await fetch("https://api.example.com/data");
  return res.json();
}
```

## 마이그레이션 체크리스트
- [ ] 디렉토리 구조 변경
- [ ] 컴포넌트 클라이언트/서버 분리
- [ ] 데이터 페칭 로직 수정
- [ ] 라우팅 로직 업데이트
- [ ] 미들웨어 설정 확인

## 주의사항
- 기존 API 라우트는 그대로 유지
- 점진적 마이그레이션 권장
- 성능 최적화 기회 활용',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '3 days'
    );

    -- 3. 일기 (짧은 텍스트)
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_user_id,
        '오늘의 회고',
        '오늘은 정말 바쁜 하루였다. 아침에 일어나서 커피를 마시며 하루를 시작했는데, 생각보다 많은 일들이 쌓여있었다.

오전에는 팀 미팅이 있었고, 새로운 프로젝트에 대한 논의를 했다. 아이디어들이 많이 나왔는데, 정말 흥미로운 것들이 많았다. 특히 AI를 활용한 새로운 기능에 대한 제안이 인상적이었다.

점심시간에는 동료들과 함께 식사를 했다. 평소보다 가벼운 대화를 나누며 스트레스를 풀 수 있었다.

오후에는 코드 리뷰와 버그 수정에 시간을 보냈다. 예상보다 시간이 오래 걸렸지만, 결국 해결할 수 있어서 다행이었다.

저녁에는 집에서 책을 읽으며 하루를 마무리했다. 내일도 좋은 하루가 되길 바란다.',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    );

    -- 4. 학습 노트 (중간 길이)
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_user_id,
        'React Hook 패턴 정리',
        '# React Hook 패턴 정리

## Custom Hook 만들기

### 1. useLocalStorage Hook
```typescript
function useLocalStorage(key: string, initialValue: any) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: any) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
```

### 2. useDebounce Hook
```typescript
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## Hook 규칙
1. 최상위에서만 Hook 호출
2. 조건문, 반복문, 중첩 함수에서 Hook 호출 금지
3. Custom Hook은 "use"로 시작하는 이름 사용

## 실무 팁
- Hook은 로직 재사용을 위한 것
- 컴포넌트 로직을 분리할 때 유용
- 테스트하기 쉬운 구조로 설계',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    );

    -- 5. 프로젝트 계획 (긴 텍스트)
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_user_id,
        'AI 메모장 앱 개발 로드맵',
        '# AI 메모장 앱 개발 로드맵

## 프로젝트 개요
사용자가 음성으로 메모를 입력하고, AI가 자동으로 요약하고 태그를 생성해주는 모바일 앱을 개발합니다.

## 기술 스택
- **Frontend**: React Native, TypeScript
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4, Whisper API
- **Storage**: AWS S3
- **Deployment**: AWS ECS

## 개발 단계

### Phase 1: 기본 기능 (4주)
- [x] 프로젝트 설정 및 환경 구성
- [x] 사용자 인증 시스템
- [x] 기본 메모 CRUD 기능
- [x] 음성 녹음 기능
- [x] 음성을 텍스트로 변환

### Phase 2: AI 기능 (3주)
- [ ] AI 요약 기능 구현
- [ ] 자동 태그 생성
- [ ] 키워드 추출
- [ ] 감정 분석

### Phase 3: 고급 기능 (3주)
- [ ] 메모 검색 및 필터링
- [ ] 카테고리 관리
- [ ] 즐겨찾기 기능
- [ ] 데이터 내보내기

### Phase 4: 최적화 (2주)
- [ ] 성능 최적화
- [ ] UI/UX 개선
- [ ] 테스트 코드 작성
- [ ] 배포 및 모니터링

## 데이터베이스 설계

### Users 테이블
- id, email, name, created_at, updated_at

### Memos 테이블
- id, user_id, title, content, audio_url, created_at, updated_at

### Summaries 테이블
- id, memo_id, content, model, created_at

### Tags 테이블
- id, memo_id, name, confidence

## API 설계

### 인증
- POST /auth/register
- POST /auth/login
- POST /auth/logout

### 메모
- GET /memos
- POST /memos
- GET /memos/:id
- PUT /memos/:id
- DELETE /memos/:id

### AI 기능
- POST /memos/:id/summarize
- POST /memos/:id/tags
- POST /memos/:id/keywords

## 예상 일정
- 총 개발 기간: 12주
- MVP 출시: 8주차
- 정식 출시: 12주차

## 리스크 관리
1. **AI API 비용**: 사용량 모니터링 및 제한 설정
2. **음성 인식 정확도**: 다양한 환경에서 테스트
3. **성능 이슈**: 대용량 데이터 처리 최적화
4. **보안**: 사용자 데이터 암호화 및 보안 강화

## 성공 지표
- 일일 활성 사용자 1,000명
- 평균 세션 시간 5분 이상
- 사용자 만족도 4.5/5.0 이상
- 앱스토어 평점 4.0 이상',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '7 days'
    );

    -- 6. 짧은 메모
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_user_id,
        '할 일 목록',
        '## 오늘 할 일
- [ ] 프로젝트 문서 정리
- [x] 코드 리뷰 완료
- [ ] 테스트 케이스 작성
- [ ] 팀 미팅 준비

## 내일 할 일
- [ ] 새로운 기능 설계
- [ ] 데이터베이스 스키마 수정
- [ ] API 문서 업데이트',
        NOW() - INTERVAL '4 hours',
        NOW() - INTERVAL '4 hours'
    );

    -- 7. 긴 기술 문서
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_user_id,
        '마이크로서비스 아키텍처 설계',
        '# 마이크로서비스 아키텍처 설계 가이드

## 1. 아키텍처 개요

마이크로서비스 아키텍처는 애플리케이션을 독립적으로 배포 가능한 작은 서비스들로 분해하는 아키텍처 패턴입니다. 각 서비스는 비즈니스 기능을 담당하며, API를 통해 통신합니다.

## 2. 핵심 원칙

### 2.1 단일 책임 원칙
각 마이크로서비스는 하나의 비즈니스 기능에만 집중해야 합니다.

### 2.2 독립성
서비스들은 독립적으로 개발, 배포, 확장 가능해야 합니다.

### 2.3 분산 데이터 관리
각 서비스는 자신만의 데이터베이스를 가져야 합니다.

### 2.4 장애 격리
한 서비스의 장애가 전체 시스템에 영향을 주지 않아야 합니다.

## 3. 서비스 분해 전략

### 3.1 비즈니스 기능별 분해
- 사용자 관리 서비스
- 주문 관리 서비스
- 결제 서비스
- 재고 관리 서비스
- 알림 서비스

### 3.2 데이터 일관성 고려사항
- 강한 일관성: ACID 트랜잭션
- 최종 일관성: 이벤트 소싱, CQRS

## 4. 통신 패턴

### 4.1 동기 통신
- HTTP/REST API
- GraphQL
- gRPC

### 4.2 비동기 통신
- 메시지 큐 (RabbitMQ, Apache Kafka)
- 이벤트 스트리밍
- Pub/Sub 패턴

## 5. 데이터 관리

### 5.1 데이터베이스 분리
각 서비스는 독립적인 데이터베이스를 가져야 합니다.

### 5.2 데이터 일관성 패턴
- Saga 패턴
- 이벤트 소싱
- CQRS (Command Query Responsibility Segregation)

## 6. 모니터링 및 관찰 가능성

### 6.1 로깅
- 중앙화된 로그 수집
- 구조화된 로그 형식
- 로그 레벨 관리

### 6.2 메트릭
- 애플리케이션 메트릭
- 인프라 메트릭
- 비즈니스 메트릭

### 6.3 분산 추적
- 요청 추적
- 서비스 간 의존성 파악
- 성능 병목 지점 식별

## 7. 보안 고려사항

### 7.1 인증 및 인가
- JWT 토큰 기반 인증
- OAuth 2.0 / OpenID Connect
- API 게이트웨이를 통한 인증

### 7.2 네트워크 보안
- TLS 암호화
- 서비스 메시 (Istio)
- 네트워크 정책

## 8. 배포 전략

### 8.1 컨테이너화
- Docker 컨테이너
- Kubernetes 오케스트레이션
- 헬스체크 및 라이브니스 프로브

### 8.2 CI/CD 파이프라인
- 자동화된 테스트
- 단계별 배포
- 롤백 전략

## 9. 장애 처리

### 9.1 회로 차단기 패턴
- 서비스 호출 실패 시 빠른 실패
- 장애 전파 방지

### 9.2 재시도 패턴
- 지수 백오프
- 최대 재시도 횟수 제한

### 9.3 타임아웃
- 서비스 호출 타임아웃 설정
- 글로벌 타임아웃 정책

## 10. 성능 최적화

### 10.1 캐싱 전략
- 애플리케이션 레벨 캐싱
- 분산 캐시 (Redis)
- CDN 활용

### 10.2 데이터베이스 최적화
- 읽기 전용 복제본
- 샤딩
- 인덱스 최적화

## 11. 마이그레이션 전략

### 11.1 Strangler Fig 패턴
- 기존 모놀리식을 점진적으로 교체
- 새 기능을 마이크로서비스로 구현

### 11.2 데이터베이스 마이그레이션
- 데이터 동기화
- 점진적 마이그레이션
- 롤백 계획

## 12. 모니터링 대시보드

### 12.1 시스템 상태
- 서비스 상태 모니터링
- 리소스 사용률
- 에러율 및 응답 시간

### 12.2 비즈니스 메트릭
- 사용자 활동
- 거래량
- 수익 지표

## 결론

마이크로서비스 아키텍처는 복잡한 애플리케이션을 관리 가능한 작은 단위로 분해하여 개발과 운영의 효율성을 높이는 강력한 패턴입니다. 하지만 적절한 설계와 운영 없이는 오히려 복잡성만 증가시킬 수 있으므로, 신중한 접근이 필요합니다.',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '10 days'
    );

    -- 8. 간단한 아이디어
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_user_id,
        '새로운 기능 아이디어',
        '## 앱 개선 아이디어

### 1. 다크모드 지원
- 시스템 설정에 따른 자동 전환
- 수동 토글 옵션
- 배경색 커스터마이징

### 2. 오프라인 모드
- 로컬 저장소 활용
- 동기화 기능
- 충돌 해결 메커니즘

### 3. 협업 기능
- 메모 공유
- 실시간 편집
- 댓글 시스템

### 4. AI 기능 강화
- 감정 분석
- 키워드 자동 추출
- 관련 메모 추천',
        NOW() - INTERVAL '6 hours',
        NOW() - INTERVAL '6 hours'
    );

    -- 9. 주말 여행기 (긴 일기)
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_user_id,
        '제주도 2박 3일 여행기',
        '# 제주도 2박 3일 여행기

## 첫째 날 - 도착과 첫인상

오전 10시에 김포공항에서 제주항공으로 출발했다. 비행기에서 내려서 제주도의 따뜻한 바람을 맞는 순간, 일상의 스트레스가 한순간에 사라지는 것 같았다. 공항에서 렌터카를 받고 호텔로 향하는 길, 제주도의 푸른 하늘과 구름이 정말 아름다웠다.

호텔에 도착해서 짐을 풀고 바로 성산일출봉으로 향했다. 등산로는 생각보다 가파르고 힘들었지만, 정상에 도착했을 때의 경치는 정말 장관이었다. 바다와 하늘이 만나는 지평선이 한눈에 들어왔고, 그 순간 모든 피로가 사라졌다.

저녁에는 성산포구에서 신선한 해산물을 먹었다. 전복죽과 회, 그리고 제주도의 특산품인 흑돼지를 맛볼 수 있었다. 특히 전복죽의 진한 맛은 잊을 수 없을 것 같다.

## 둘째 날 - 한라산 등반

둘째 날은 한라산 등반에 도전했다. 새벽 5시에 일어나서 준비하고 출발했다. 성판악 코스를 선택했는데, 편도 9.6km의 긴 코스였다. 초반에는 완만한 오르막이었지만, 중반부터는 점점 가파라졌다.

등반 중에 만난 다양한 식물들과 풍경이 정말 아름다웠다. 구상나무 숲을 지나고, 백록담에 도착했을 때의 감동은 말로 표현할 수 없었다. 백록담의 신비로운 분위기와 주변 풍경은 정말 장관이었다.

하산 후에는 흑돼지 전문점에서 저녁을 먹었다. 등반으로 지친 몸에 고기의 맛이 더욱 좋았다.

## 셋째 날 - 해변과 카페

마지막 날은 여유롭게 해변을 걷고 카페를 방문하는 일정으로 계획했다. 협재 해수욕장의 에메랄드빛 바다를 보며 산책했고, 근처 카페에서 제주도의 감귤을 활용한 음료를 마셨다.

오후에는 공항으로 향하기 전에 동문시장을 들렀다. 다양한 제주도 특산품과 음식을 구경하며 마지막 순간까지 제주도를 즐겼다.

## 여행 후기

이번 제주도 여행은 정말 잊지 못할 추억이 되었다. 자연의 아름다움과 평화로움을 만끽할 수 있었고, 일상의 스트레스에서 벗어나 힐링할 수 있었다. 다음에는 더 많은 시간을 가지고 여유롭게 제주도를 탐험하고 싶다.',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '8 days'
    );

    -- 10. 독서 노트
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        test_user_id,
        '클린 코드 독서 노트',
        '# 클린 코드 - 로버트 C. 마틴

## 1장: 깨끗한 코드

### 핵심 내용
- 코드는 요구사항을 표현하는 언어
- 나쁜 코드는 회사를 망하게 할 수 있다
- 깨끗한 코드는 한 가지를 제대로 한다
- 가독성이 중요하다

### 인상 깊은 구절
"나중은 결코 오지 않는다" - 르블랑의 법칙

## 2장: 의미 있는 이름

### 핵심 원칙
1. 의도를 분명히 밝혀라
2. 그릇된 정보를 피하라
3. 의미 있게 구분하라
4. 발음하기 쉬운 이름을 사용하라
5. 검색하기 쉬운 이름을 사용하라

### 나쁜 예
```typescript
const d = new Date(); // 의도가 불분명
const list1 = []; // 의미 없는 구분
```

### 좋은 예
```typescript
const createdDate = new Date(); // 명확한 의도
const activeUsers = []; // 의미 있는 이름
```

## 3장: 함수

### 함수 작성 규칙
- 작게 만들어라
- 한 가지만 해라
- 서술적인 이름을 사용하라
- 인수는 적을수록 좋다
- 부수 효과를 일으키지 마라

### 실천 사항
- 함수는 20줄 이내로
- 들여쓰기는 2단계 이내로
- switch문은 다형성으로 대체

## 적용할 점

1. **네이밍**: 변수와 함수 이름을 더 명확하게
2. **함수 분리**: 큰 함수를 작은 함수로 나누기
3. **주석 줄이기**: 코드 자체로 설명하기
4. **리팩토링**: 주기적으로 코드 정리하기

## 다음 독서 계획
- 리팩토링 2판 - 마틴 파울러
- 실용주의 프로그래머 - 앤드류 헌트',
        NOW() - INTERVAL '12 hours',
        NOW() - INTERVAL '12 hours'
    );

END $$;

