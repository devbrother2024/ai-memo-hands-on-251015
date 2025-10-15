// __tests__/components/summary-section.test.tsx
// SummarySection 컴포넌트에 대한 React 테스트
// 관련 파일: components/notes/summary-section.tsx

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SummarySection } from '@/components/notes/summary-section'

// fetch 모킹
global.fetch = jest.fn()

const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('SummarySection', () => {
    const mockNoteId = 'test-note-id'
    const mockSummary = {
        id: 'summary-id',
        noteId: mockNoteId,
        model: 'gemini-2.0-flash-001',
        content:
            '• 첫 번째 요약 포인트\n• 두 번째 요약 포인트\n• 세 번째 요약 포인트',
        createdAt: new Date('2025-01-01T00:00:00Z')
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('100자 미만 노트', () => {
        it('노트 내용이 100자 미만이면 컴포넌트를 렌더링하지 않아야 한다', () => {
            const shortContent = '짧은 내용'
            const { container } = render(
                <SummarySection
                    noteId={mockNoteId}
                    noteContent={shortContent}
                />
            )

            expect(container.firstChild).toBeNull()
        })
    })

    describe('100자 이상 노트', () => {
        const longContent = 'a'.repeat(100) + ' 긴 노트 내용입니다.'

        it('요약이 없을 때 요약 생성 버튼을 표시해야 한다', () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ summary: null })
            } as Response)

            render(
                <SummarySection noteId={mockNoteId} noteContent={longContent} />
            )

            expect(screen.getByText('AI 요약')).toBeInTheDocument()
            expect(screen.getByText('요약 생성')).toBeInTheDocument()
            expect(
                screen.getByText(
                    '노트 내용을 기반으로 AI 요약을 생성할 수 있습니다.'
                )
            ).toBeInTheDocument()
        })

        it('기존 요약이 있을 때 요약을 표시하고 재생성 버튼을 보여줘야 한다', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ summary: mockSummary })
            } as Response)

            render(
                <SummarySection noteId={mockNoteId} noteContent={longContent} />
            )

            await waitFor(() => {
                expect(screen.getByText('다시 불러오기')).toBeInTheDocument()
                expect(screen.getByText('재생성')).toBeInTheDocument()
                expect(
                    screen.getByText('• 첫 번째 요약 포인트')
                ).toBeInTheDocument()
            })
        })

        it('요약 생성 중 로딩 상태를 표시해야 한다', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ summary: null })
            } as Response)

            render(
                <SummarySection noteId={mockNoteId} noteContent={longContent} />
            )

            await waitFor(() => {
                expect(screen.getByText('요약 생성')).toBeInTheDocument()
            })

            // 요약 생성 버튼 클릭
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ summary: mockSummary })
            } as Response)

            fireEvent.click(screen.getByText('요약 생성'))

            expect(screen.getByText('생성 중...')).toBeInTheDocument()
        })

        it('요약 생성 실패 시 에러 메시지를 표시해야 한다', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ summary: null })
            } as Response)

            render(
                <SummarySection noteId={mockNoteId} noteContent={longContent} />
            )

            await waitFor(() => {
                expect(screen.getByText('요약 생성')).toBeInTheDocument()
            })

            // 요약 생성 실패 시뮬레이션
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'API 호출 실패' })
            } as Response)

            fireEvent.click(screen.getByText('요약 생성'))

            await waitFor(() => {
                expect(screen.getByText('API 호출 실패')).toBeInTheDocument()
            })
        })

        it('재생성 버튼을 클릭하면 요약을 다시 생성해야 한다', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ summary: mockSummary })
            } as Response)

            render(
                <SummarySection noteId={mockNoteId} noteContent={longContent} />
            )

            await waitFor(() => {
                expect(screen.getByText('재생성')).toBeInTheDocument()
            })

            const newSummary = {
                ...mockSummary,
                content: '• 새로운 요약 포인트\n• 업데이트된 내용'
            }

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ summary: newSummary })
            } as Response)

            fireEvent.click(screen.getByText('재생성'))

            await waitFor(() => {
                expect(
                    screen.getByText('• 새로운 요약 포인트')
                ).toBeInTheDocument()
            })
        })
    })

    describe('API 호출', () => {
        const longContent = 'a'.repeat(100) + ' 긴 노트 내용입니다.'

        it('올바른 API 엔드포인트로 요약 조회 요청을 보내야 한다', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ summary: null })
            } as Response)

            render(
                <SummarySection noteId={mockNoteId} noteContent={longContent} />
            )

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    `/api/notes/${mockNoteId}/summary`
                )
            })
        })

        it('요약 생성 시 POST 요청을 보내야 한다', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ summary: null })
            } as Response)

            render(
                <SummarySection noteId={mockNoteId} noteContent={longContent} />
            )

            await waitFor(() => {
                expect(screen.getByText('요약 생성')).toBeInTheDocument()
            })

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ summary: mockSummary })
            } as Response)

            fireEvent.click(screen.getByText('요약 생성'))

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith(
                    `/api/notes/${mockNoteId}/summary`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ regenerate: false })
                    }
                )
            })
        })
    })
})
