'use client'

import { useRef, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { createClient } from '@/lib/supabase/client'
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
  const [nickname, setNickname] = useState(memo?.nickname ?? '')
  const [password, setPassword] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(memo?.image_url ?? null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isEdit = mode === 'edit'

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('이미지는 5MB 이하만 업로드 가능합니다.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function uploadImage(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('memo-images')
      .upload(path, file, { upsert: false })

    if (uploadError) throw new Error('이미지 업로드에 실패했습니다.')

    const { data } = supabase.storage.from('memo-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let image_url: string | null = memo?.image_url ?? null

      if (imageFile) {
        image_url = await uploadImage(imageFile)
      } else if (imagePreview === null) {
        image_url = null
      }

      const url = isEdit ? `/api/memos/${memo!.id}` : '/api/memos'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, password, nickname, image_url }),
      })

      const data = await res.json() as { error?: string; id?: string; created_at?: string }

      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다.')
        return
      }

      if (isEdit) {
        onSuccess({
          ...memo!,
          title,
          content,
          nickname: nickname.trim() || null,
          image_url,
          updated_at: new Date().toISOString(),
        })
      } else {
        onSuccess({
          id: data.id!,
          title,
          content,
          nickname: nickname.trim() || null,
          image_url,
          created_at: data.created_at!,
          updated_at: data.created_at!,
        })
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
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
          <button type="button" onClick={onClose} aria-label="닫기"
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* 닉네임 */}
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (선택 · 미입력 시 익명)"
            maxLength={20}
            aria-label="닉네임"
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
          />

          {/* 제목 */}
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

          {/* 내용 */}
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

          {/* 이미지 업로드 */}
          <div>
            {imagePreview ? (
              <div className="relative w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="첨부 이미지 미리보기" className="w-full max-h-48 object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="이미지 제거"
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 text-sm text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-500 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                사진 첨부 (선택 · 최대 5MB)
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              aria-label="이미지 파일 선택"
            />
          </div>

          {/* 비밀번호 */}
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

        {error && <p className="text-sm text-red-500">{error}</p>}

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
