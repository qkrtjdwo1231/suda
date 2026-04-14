'use client'

import { useState } from 'react'
import CommunityCard from '@/components/community/CommunityCard'
import CommunityForm from '@/components/community/CommunityForm'
import ThemeToggle from '@/components/ui/ThemeToggle'
import type { Community } from '@/types/community'

interface CommunityListProps {
  initialCommunities: Community[]
}

export default function CommunityList({ initialCommunities }: CommunityListProps) {
  const [communities, setCommunities] = useState<Community[]>(initialCommunities)
  const [showCreate, setShowCreate] = useState(false)

  function handleCreate(created: Community) {
    setCommunities((prev) => [created, ...prev])
  }

  function handleUpdate(updated: Community) {
    setCommunities((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
  }

  function handleDelete(id: string) {
    setCommunities((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md">
        <div className="max-w-[640px] mx-auto flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">수다</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              새 커뮤니티
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[640px] mx-auto w-full">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            총 <span className="font-semibold text-neutral-900 dark:text-neutral-100">{communities.length}</span>개의 커뮤니티
          </p>
        </div>

        {communities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <p className="text-base">아직 커뮤니티가 없어요. 첫 커뮤니티를 만들어보세요!</p>
          </div>
        ) : (
          <ul>
            {communities.map((community) => (
              <li key={community.id}>
                <CommunityCard
                  community={community}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {showCreate && (
        <CommunityForm
          mode="create"
          onClose={() => setShowCreate(false)}
          onSuccess={handleCreate}
        />
      )}
    </>
  )
}
