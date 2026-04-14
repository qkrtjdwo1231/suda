'use client'

import { useEffect, useRef, useState } from 'react'

interface SearchBarProps {
  onSearch: (keyword: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSearch(value.trim())
    }, 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, onSearch])

  return (
    <div className="relative flex items-center w-full max-w-xs">
      <svg
        className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="검색"
        aria-label="메모 검색"
        className="w-full pl-9 pr-8 py-1.5 text-sm rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          aria-label="검색어 지우기"
          className="absolute right-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          ✕
        </button>
      )}
    </div>
  )
}
