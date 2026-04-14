'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import AnonymousAvatar from '@/components/ui/AnonymousAvatar'
import MemoForm from '@/components/memo/MemoForm'
import PasswordModal from '@/components/memo/PasswordModal'
import { formatFullTime } from '@/lib/time'
import type { Memo } from '@/types/memo'

interface MemoDetailProps {
  memo: Memo
  onClose: () => void
  onUpdate: (updated: Memo) => void
  onDelete: (id: string) => void
}

export default function MemoDetail({ memo, onClose, onUpdate, onDelete }: MemoDetailProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [current, setCurrent] = useState(memo)

  if (showEdit) {
    return (
      <MemoForm
        mode="edit"
        memo={current}
        onClose={() => setShowEdit(false)}
        onSuccess={(updated) => {
          setCurrent(updated)
          onUpdate(updated)
          setShowEdit(false)
        }}
      />
    )
  }

  if (showDelete) {
    return (
      <PasswordModal
        action="delete"
        memoId={current.id}
        onClose={() => setShowDelete(false)}
        onSuccess={() => {
          onDelete(current.id)
          onClose()
        }}
      />
    )
  }

  return (
    <Modal onClose={onClose}>
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <AnonymousAvatar seed={current.id} />
            <div>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {current.nickname ?? '익명'}
              </p>
              <time className="text-xs text-neutral-400" dateTime={current.created_at}>
                {formatFullTime(current.created_at)}
              </time>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
            {current.title}
          </h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap break-words leading-relaxed">
            {current.content}
          </p>
        </div>

        {current.image_url && (
          <div className="rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.image_url}
              alt="첨부 이미지"
              className="w-full max-h-72 object-contain bg-neutral-50 dark:bg-neutral-900"
            />
          </div>
        )}

        {current.updated_at !== current.created_at && (
          <p className="text-xs text-neutral-400">
            수정됨 · {formatFullTime(current.updated_at)}
          </p>
        )}

        <div className="flex gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={() => setShowEdit(true)}
            className="flex-1 py-2 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex-1 py-2 rounded-xl text-sm font-medium text-red-500 border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </Modal>
  )
}
