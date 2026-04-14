'use client'

import SearchBar from '@/components/ui/SearchBar'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface HeaderProps {
  onSearch: (keyword: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-[#101010]/80 backdrop-blur-md">
      <div className="max-w-[640px] mx-auto flex items-center gap-3 px-4 h-14">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 shrink-0">
          수다
        </h1>
        <div className="flex-1">
          <SearchBar onSearch={onSearch} />
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
