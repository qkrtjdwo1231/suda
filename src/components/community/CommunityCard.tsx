'use client'

import { useState } from 'react'
import { formatRelativeTime } from '@/lib/time'
import CommunityPasswordModal from '@/components/community/CommunityPasswordModal'
import CommunityForm from '@/components/community/CommunityForm'
import type { Community } from '@/types/community'

interface CommunityCardProps {
  community: Community
  onUpdate: (updated: Community) => void
  onDelete: (id: string) => void
}

export default function CommunityCard({ community, onUpdate, onDelete }: CommunityCardProps) {
  const [showEnter, setShowEnter] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault()
    setDeleteError('')
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/communities/${community.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setDeleteError(data.error ?? '오류가 발생했습니다.'); return }
      onDelete(community.id)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors border-b border-neutral-100 dark:border-neutral-800">
        <button
          onClick={() => setShowEnter(true)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center shrink-0">
            <span className="text-white dark:text-neutral-900 font-bold text-sm">
              {community.name[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {community.name}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {formatRelativeTime(community.created_at)} 개설
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => setShowEdit(true)}
            className="px-2.5 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      {showEnter && (
        <CommunityPasswordModal community={community} onClose={() => setShowEnter(false)} />
      )}

      {showEdit && (
        <CommunityForm
          mode="edit"
          community={community}
          onClose={() => setShowEdit(false)}
          onSuccess={(updated) => { onUpdate(updated); setShowEdit(false) }}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <form onSubmit={handleDelete} className="relative w-full sm:max-w-lg mx-auto bg-white dark:bg-[#1e1e1e] rounded-t-2xl sm:rounded-2xl shadow-xl z-10 p-5 space-y-4">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">수다방 삭제</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{community.name}</span> 수다방와 내부 글이 모두 삭제됩니다.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
              autoFocus
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-neutral-400"
            />
            {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                취소
              </button>
              <button type="submit" disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold disabled:opacity-50 hover:opacity-80 transition-opacity">
                {deleteLoading ? '삭제 중...' : '삭제하기'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
