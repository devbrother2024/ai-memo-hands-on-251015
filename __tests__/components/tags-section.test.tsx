// __tests__/components/tags-section.test.tsx
// 태그 섹션 컴포넌트 테스트
// 태그 표시, 생성, 재생성, 클릭 기능을 테스트한다
// 관련 파일: components/notes/tags-section.tsx, lib/ai/actions.ts

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TagsSection } from '@/components/notes/tags-section'
import { generateTagsForNote, regenerateTagsForNote } from '@/lib/ai/actions'
import { getTagsByNoteId } from '@/lib/notes/tag-queries'

// 모킹
jest.mock('@/lib/ai/actions')
jest.mock('@/lib/notes/tag-queries')

const mockGenerateTagsForNote = generateTagsForNote as jest.MockedFunction<typeof generateTagsForNote>
const mockRegenerateTagsForNote = regenerateTagsForNote as jest.MockedFunction<typeof regenerateTagsForNote>
const mockGetTagsByNoteId = getTagsByNoteId as jest.MockedFunction<typeof getTagsByNoteId>

describe('TagsSection', () => {
    const mockProps = {
        noteId: 'test-note-id',
        content: '이것은 테스트 노트입니다. 개발, 프로그래밍, 코딩에 관한 내용입니다.',
        onTagClick: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('태그가 없을 때 생성 버튼 표시', async () => {
        // Given
        mockGetTagsByNoteId.mockResolvedValue([])

        // When
        render(<TagsSection {...mockProps} />)

        // Then
        await waitFor(() => {
            expect(screen.getByText('태그 생성')).toBeInTheDocument()
        })
    })

    it('태그가 있을 때 태그 목록 표시', async () => {
        // Given
        const mockTags = [
            { id: '1', name: '개발', color: '#3b82f6', userId: 'user1', createdAt: new Date() },
            { id: '2', name: '프로그래밍', color: '#ef4444', userId: 'user1', createdAt: new Date() }
        ]
        mockGetTagsByNoteId.mockResolvedValue(mockTags)

        // When
        render(<TagsSection {...mockProps} />)

        // Then
        await waitFor(() => {
            expect(screen.getByText('개발')).toBeInTheDocument()
            expect(screen.getByText('프로그래밍')).toBeInTheDocument()
            expect(screen.getByText('재생성')).toBeInTheDocument()
        })
    })

    it('태그 생성 성공', async () => {
        // Given
        mockGetTagsByNoteId.mockResolvedValue([])
        mockGenerateTagsForNote.mockResolvedValue({
            success: true,
            tags: ['개발', '프로그래밍']
        })

        // When
        render(<TagsSection {...mockProps} />)
        
        const generateButton = await screen.findByText('태그 생성')
        fireEvent.click(generateButton)

        // Then
        await waitFor(() => {
            expect(mockGenerateTagsForNote).toHaveBeenCalledWith(
                mockProps.noteId,
                mockProps.content
            )
        })
    })

    it('태그 생성 실패', async () => {
        // Given
        mockGetTagsByNoteId.mockResolvedValue([])
        mockGenerateTagsForNote.mockResolvedValue({
            success: false,
            error: '태그 생성에 실패했습니다'
        })

        // When
        render(<TagsSection {...mockProps} />)
        
        const generateButton = await screen.findByText('태그 생성')
        fireEvent.click(generateButton)

        // Then
        await waitFor(() => {
            expect(screen.getByText('태그 생성에 실패했습니다')).toBeInTheDocument()
        })
    })

    it('태그 재생성', async () => {
        // Given
        const mockTags = [
            { id: '1', name: '개발', color: '#3b82f6', userId: 'user1', createdAt: new Date() }
        ]
        mockGetTagsByNoteId.mockResolvedValue(mockTags)
        mockRegenerateTagsForNote.mockResolvedValue({
            success: true,
            tags: ['새로운태그']
        })

        // When
        render(<TagsSection {...mockProps} />)
        
        const regenerateButton = await screen.findByText('재생성')
        fireEvent.click(regenerateButton)

        // Then
        await waitFor(() => {
            expect(mockRegenerateTagsForNote).toHaveBeenCalledWith(
                mockProps.noteId,
                mockProps.content
            )
        })
    })

    it('태그 클릭 이벤트', async () => {
        // Given
        const mockTags = [
            { id: '1', name: '개발', color: '#3b82f6', userId: 'user1', createdAt: new Date() }
        ]
        mockGetTagsByNoteId.mockResolvedValue(mockTags)

        // When
        render(<TagsSection {...mockProps} />)
        
        const tagButton = await screen.findByText('개발')
        fireEvent.click(tagButton)

        // Then
        expect(mockProps.onTagClick).toHaveBeenCalledWith('개발')
    })

    it('100자 미만 내용 시 생성 버튼 비활성화', async () => {
        // Given
        const shortContent = '짧은 내용'
        mockGetTagsByNoteId.mockResolvedValue([])

        // When
        render(<TagsSection {...mockProps} content={shortContent} />)

        // Then
        await waitFor(() => {
            expect(screen.getByText('노트 내용이 100자 이상일 때 태그를 생성할 수 있습니다')).toBeInTheDocument()
        })
    })

    it('로딩 상태 표시', async () => {
        // Given
        mockGetTagsByNoteId.mockResolvedValue([])
        mockGenerateTagsForNote.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

        // When
        render(<TagsSection {...mockProps} />)
        
        const generateButton = await screen.findByText('태그 생성')
        fireEvent.click(generateButton)

        // Then
        expect(screen.getByText('태그 생성 중...')).toBeInTheDocument()
    })

    it('에러 상태 표시', async () => {
        // Given
        mockGetTagsByNoteId.mockRejectedValue(new Error('데이터베이스 오류'))

        // When
        render(<TagsSection {...mockProps} />)

        // Then
        await waitFor(() => {
            expect(screen.getByText('태그를 불러올 수 없습니다')).toBeInTheDocument()
        })
    })
})
