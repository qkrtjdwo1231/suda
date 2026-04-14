'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import MemoItem from '@/components/memo/MemoItem'
import MemoDetail from '@/components/memo/MemoDetail'
import MemoForm from '@/components/memo/MemoForm'
import SearchBar from '@/components/ui/SearchBar'
import ThemeToggle from '@/components/ui/ThemeToggle'
import type { Memo } from '@/types/memo'

interface MemoFeedProps {
  initialMemos: Memo[]
  communityId: string
  communityName: string
}

export default function MemoFeed({ initialMemos, communityId, communityName }: MemoFeedProps) {
  const [memos, setMemos] = useState<Memo[]>(initialMemos)
  const [filtered, setFiltered] = useState<Memo[]>(initialMemos)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Memo | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const searchRef = useRef(search)
  searchRef.current = search
  const router = useRouter()

  // 인증 확인
  useEffect(() => {
    const auth = sessionStorage.getItem(`community_auth_${communityId}`)
    if (!auth) router.replace('/')
  }, [communityId, router])

  // Realtime 구독
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`memos-${communityId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'memos', filter: `community_id=eq.${communityId}` },
        (payload) => { setMemos((prev) => [payload.new as Memo, ...prev]) }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'memos', filter: `community_id=eq.${communityId}` },
        (payload) => { setMemos((prev) => prev.map((m) => m.id === (payload.new as Memo).id ? payload.new as Memo : m)) }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'memos' },
        (payload) => { setMemos((prev) => prev.filter((m) => m.id !== (payload.old as { id: string }).id)) }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [communityId])

  // 검색 필터링
  useEffect(() => {
    if (!search) { setFiltered(memos); return }
    const kw = search.toLowerCase()
    setFiltered(memos.filter((m) => m.title.toLowerCase().includes(kw) || m.content.toLowerCase().includes(kw)))
  }, [memos, search])

  const handleSearch = useCallback((kw: string) => setSearch(kw), [])

  function handleLogout() {
    sessionStorage.removeItem(`community_auth_${communityId}`)
    router.push('/')
  }

  function handleCreate(newMemo: Memo) { setMemos((prev) => [newMemo, ...prev]) }
  function handleUpdate(updated: Memo) {
    setMemos((prev) => prev.map((m) => m.id === updated.id ? updated : m))
    if (selected?.id === updated.id) setSelected(updated)
  }
  function handleDelete(id: string) { setMemos((prev) => prev.filter((m) => m.id !== id)); setSelected(null) }

  return (
    <>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md">
        <div className="max-w-[640px] md:max-w-[900px] lg:max-w-[1100px] mx-auto flex items-center gap-2 px-4 md:px-8 h-14 md:h-16">
          <div className="flex-1 min-w-0">
            <p className="text-base md:text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">{communityName}</p>
          </div>
          <SearchBar onSearch={handleSearch} />
          <ThemeToggle />
          <button
            onClick={() => router.push('/')}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shrink-0"
          >
            목록으로
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors shrink-0"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-[640px] md:max-w-[900px] lg:max-w-[1100px] mx-auto w-full">
        <div className="px-4 md:px-8 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400">
            {search ? (
              <><span className="font-medium text-neutral-900 dark:text-neutral-100">&apos;{search}&apos;</span> 검색 결과 {filtered.length}개</>
            ) : (
              <>총 <span className="font-semibold text-neutral-900 dark:text-neutral-100">{memos.length}</span>개의 수다</>
            )}
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-80 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            수다 쓰기
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <p className="text-base md:text-lg">
              {search ? `'${search}'에 대한 결과가 없습니다.` : '아직 수다가 없어요. 첫 글을 남겨보세요!'}
            </p>
          </div>
        ) : (
          <ul className="md:grid md:grid-cols-2 md:gap-px md:bg-neutral-100 dark:md:bg-neutral-800">
            {filtered.map((memo, i) => (
              <li key={memo.id} className="md:bg-white dark:md:bg-[#101010]">
                <MemoItem memo={memo} onClick={setSelected} />
                {i < filtered.length - 1 && <div className="border-b border-neutral-100 dark:border-neutral-800 mx-4 md:hidden" />}
              </li>
            ))}
          </ul>
        )}
      </main>

      {showCreate && (
        <MemoForm mode="create" communityId={communityId} onClose={() => setShowCreate(false)} onSuccess={handleCreate} />
      )}
      {selected && (
        <MemoDetail memo={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} onDelete={handleDelete} />
      )}
    </>
  )
}
