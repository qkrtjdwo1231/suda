'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import type { Community } from '@/types/community'

interface CommunityFormProps {
  mode: 'create' | 'edit'
  community?: Community
  onClose: () => void
  onSuccess: (community: Community) => void
}

export default function CommunityForm({ mode, community, onClose, onSuccess }: CommunityFormProps) {
  const [name, setName] = useState(community?.name ?? '')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isEdit = mode === 'edit'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEdit ? `/api/communities/${community!.id}` : '/api/communities'
      const method = isEdit ? 'PATCH' : 'POST'
      const body = isEdit
        ? { name, password, newPassword: newPassword || undefined }
        : { name, password }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json() as { error?: string; id?: string; name?: string; created_at?: string; updated_at?: string }

      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다.')
        return
      }

      if (isEdit) {
        onSuccess({ ...community!, name: name || community!.name, updated_at: new Date().toISOString() })
      } else {
        onSuccess({ id: data.id!, name: data.name!, created_at: data.created_at!, updated_at: data.updated_at! })
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
            {isEdit ? '커뮤니티 수정' : '새 커뮤니티 만들기'}
          </h2>
          <button type="button" onClick={onClose} aria-label="닫기"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">✕</button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="커뮤니티 이름 (예: 컴퓨터공학과)"
            maxLength={30}
            required={!isEdit}
            aria-label="커뮤니티 이름"
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? '현재 비밀번호' : '비밀번호 설정 (4~20자)'}
            minLength={4}
            maxLength={20}
            required
            aria-label="비밀번호"
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
          />

          {isEdit && (
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 (변경 시에만 입력)"
              minLength={4}
              maxLength={20}
              aria-label="새 비밀번호"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
            />
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold disabled:opacity-50 hover:opacity-80 transition-opacity"
        >
          {loading ? '처리 중...' : isEdit ? '수정하기' : '커뮤니티 만들기'}
        </button>
      </form>
    </Modal>
  )
}
