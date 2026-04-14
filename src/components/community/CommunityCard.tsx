'use client'

import { useState } from 'react'
import { formatRelativeTime } from '@/lib/time'
import CommunityPasswordModal from '@/components/community/CommunityPasswordModal'
import CommunityForm from '@/components/community/CommunityForm'
import type { Community } from '@/types/community'

// 처음 10개: 색상환 전체를 커버하는 뚜렷하게 다른 10가지
const FIRST_COLORS = [
  'from-red-400 to-red-600',
  'from-orange-400 to-amber-500',
  'from-yellow-300 to-amber-400',
  'from-lime-400 to-green-500',
  'from-emerald-400 to-teal-500',
  'from-cyan-400 to-sky-500',
  'from-blue-400 to-blue-600',
  'from-indigo-400 to-violet-500',
  'from-purple-400 to-fuchsia-500',
  'from-pink-400 to-rose-500',
]

// 11개 이후: 연하거나 진한 변형 색상들
const REST_COLORS = [
  'from-rose-200 to-pink-300',
  'from-rose-600 to-pink-700',
  'from-orange-200 to-amber-300',
  'from-orange-600 to-amber-700',
  'from-emerald-200 to-teal-300',
  'from-emerald-600 to-teal-700',
  'from-blue-200 to-cyan-300',
  'from-blue-600 to-indigo-700',
  'from-violet-200 to-purple-300',
  'from-violet-600 to-purple-700',
  'from-sky-300 to-cyan-400',
  'from-sky-600 to-teal-600',
  'from-yellow-400 to-lime-400',
  'from-lime-300 to-green-400',
  'from-red-300 to-orange-400',
  'from-red-600 to-rose-600',
  'from-fuchsia-400 to-pink-500',
  'from-teal-400 to-emerald-500',
  'from-amber-400 to-yellow-400',
  'from-cyan-500 to-blue-500',
]

interface CommunityCardProps {
  community: Community
  index: number
  onUpdate: (updated: Community) => void
  onDelete: (id: string) => void
}

export default function CommunityCard({ community, index, onUpdate, onDelete }: CommunityCardProps) {
  const [showEnter, setShowEnter] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  const colorClass = index < 10
    ? FIRST_COLORS[index]
    : REST_COLORS[
        community.id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % REST_COLORS.length
      ]

  function truncateAtWord(text: string, max: number) {
    if (text.length <= max) return text
    const cut = text.slice(0, max)
    const lastSpace = cut.lastIndexOf(' ')
    return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…'
  }

  const bannerText = truncateAtWord(community.name, 8)
  const bannerFontSize = bannerText.length <= 4 ? 'text-3xl' : bannerText.length <= 6 ? 'text-2xl' : 'text-xl'

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
      <div className="flex flex-col rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] shadow-sm hover:shadow-md transition-shadow">
        {/* 카드 상단 컬러 배너 */}
        <button
          onClick={() => setShowEnter(true)}
          className={`bg-gradient-to-br ${colorClass} w-full h-24 flex items-center justify-center`}
          aria-label={`${community.name} 수다방 입장`}
        >
          <span className={`${bannerFontSize} font-black text-white drop-shadow text-center px-3 leading-tight`}>
            {bannerText}
          </span>
        </button>

        {/* 카드 하단 정보 */}
        <div className="px-4 py-3 flex flex-col gap-2">
          <button
            onClick={() => setShowEnter(true)}
            className="text-left"
          >
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
              {community.name}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {formatRelativeTime(community.created_at)} 개설
            </p>
          </button>

          <div className="flex items-center gap-1 pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => setShowEnter(true)}
              className="flex-1 py-1.5 text-xs font-semibold text-white bg-[#64748B] rounded-lg hover:opacity-80 transition-opacity"
            >
              입장
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowEdit(true) }}
              className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              수정
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true) }}
              className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
            >
              삭제
            </button>
          </div>
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
              <span className="font-medium text-neutral-900 dark:text-neutral-100">{community.name}</span> 수다방과 내부 글이 모두 삭제됩니다.
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
