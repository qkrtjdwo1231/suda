'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import type { Memo } from '@/types/memo'

interface MemoFormProps {
  mode: 'create' | 'edit'
  memo?: Memo
  onClose: () => void
  onSuccess: (memo: Memo) => void
}

export default function MemoForm({ mode, memo, onClose, onSuccess }: MemoFormProps) {
  const [title, setTitle] = useState(memo?.title ?? '')
  const [content, setContent] = useState(memo?.content ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEdit = mode === 'edit'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEdit ? `/api/memos/${memo!.id}` : '/api/memos'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, password }),
      })

      const data = await res.json() as { error?: string; id?: string; created_at?: string }

      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다.')
        return
      }

      if (isEdit) {
        onSuccess({ ...memo!, title, content, updated_at: new Date().toISOString() })
      } else {
        onSuccess({
          id: data.id!,
          title,
          content,
          created_at: data.created_at!,
          updated_at: data.created_at!,
        })
      }
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {isEdit ? '수다 수정' : '새 수다'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
              maxLength={100}
              required
              aria-label="제목"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
            <p className="text-right text-xs text-neutral-400 mt-1">{title.length}/100</p>
          </div>

          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요..."
              maxLength={1000}
              required
              rows={5}
              aria-label="내용"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500 resize-none"
            />
            <p className="text-right text-xs text-neutral-400 -mt-1">{content.length}/1000</p>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (수정·삭제에 사용)"
            minLength={4}
            maxLength={20}
            required
            aria-label="비밀번호"
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold disabled:opacity-50 hover:opacity-80 transition-opacity"
        >
          {loading ? '처리 중...' : isEdit ? '수정하기' : '수다 올리기'}
        </button>
      </form>
    </Modal>
  )
}
