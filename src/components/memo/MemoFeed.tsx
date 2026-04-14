'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MemoItem from '@/components/memo/MemoItem'
import MemoDetail from '@/components/memo/MemoDetail'
import MemoForm from '@/components/memo/MemoForm'
import Header from '@/components/layout/Header'
import FabButton from '@/components/layout/FabButton'
import type { Memo } from '@/types/memo'

interface MemoFeedProps {
  initialMemos: Memo[]
}

export default function MemoFeed({ initialMemos }: MemoFeedProps) {
  const [memos, setMemos] = useState<Memo[]>(initialMemos)
  const [filtered, setFiltered] = useState<Memo[]>(initialMemos)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Memo | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const searchRef = useRef(search)
  searchRef.current = search

  // Realtime 구독
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('memos-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'memos' },
        (payload) => {
          const newMemo = payload.new as Memo
          setMemos((prev) => [newMemo, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'memos' },
        (payload) => {
          const updated = payload.new as Memo
          setMemos((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'memos' },
        (payload) => {
          const deleted = payload.old as { id: string }
          setMemos((prev) => prev.filter((m) => m.id !== deleted.id))
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [])

  // 검색 필터링
  useEffect(() => {
    if (!search) {
      setFiltered(memos)
    } else {
      const kw = search.toLowerCase()
      setFiltered(memos.filter(
        (m) => m.title.toLowerCase().includes(kw) || m.content.toLowerCase().includes(kw)
      ))
    }
  }, [memos, search])

  const handleSearch = useCallback((kw: string) => {
    setSearch(kw)
  }, [])

  function handleCreate(newMemo: Memo) {
    setMemos((prev) => [newMemo, ...prev])
  }

  function handleUpdate(updated: Memo) {
    setMemos((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
    if (selected?.id === updated.id) setSelected(updated)
  }

  function handleDelete(id: string) {
    setMemos((prev) => prev.filter((m) => m.id !== id))
    setSelected(null)
  }

  const total = memos.length
  const count = filtered.length

  return (
    <>
      <Header onSearch={handleSearch} />

      <main className="max-w-[640px] mx-auto w-full pb-24">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {search ? (
              <><span className="font-medium text-neutral-900 dark:text-neutral-100">&apos;{search}&apos;</span> 검색 결과 {count}개</>
            ) : (
              <>총 <span className="font-semibold text-neutral-900 dark:text-neutral-100">{total}</span>개의 수다</>
            )}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <p className="text-base">
              {search ? `'${search}'에 대한 결과가 없습니다.` : '아직 수다가 없어요. 첫 글을 남겨보세요!'}
            </p>
          </div>
        ) : (
          <ul>
            {filtered.map((memo, i) => (
              <li key={memo.id}>
                <MemoItem memo={memo} onClick={setSelected} />
                {i < filtered.length - 1 && (
                  <div className="border-b border-neutral-100 dark:border-neutral-800 mx-4" />
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <FabButton onClick={() => setShowCreate(true)} />

      {showCreate && (
        <MemoForm
          mode="create"
          onClose={() => setShowCreate(false)}
          onSuccess={handleCreate}
        />
      )}

      {selected && (
        <MemoDetail
          memo={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
