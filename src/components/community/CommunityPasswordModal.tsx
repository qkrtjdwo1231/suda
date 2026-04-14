'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import type { Community } from '@/types/community'

interface CommunityPasswordModalProps {
  community: Community
  onClose: () => void
}

export default function CommunityPasswordModal({ community, onClose }: CommunityPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/communities/${community.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json() as { error?: string }

      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다.')
        return
      }

      sessionStorage.setItem(`community_auth_${community.id}`, '1')
      router.push(`/c/${community.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              수다방 입장
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{community.name}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">✕</button>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호 입력"
          required
          autoFocus
          aria-label="비밀번호"
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            취소
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold disabled:opacity-50 hover:opacity-80 transition-opacity">
            {loading ? '확인 중...' : '입장하기'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
