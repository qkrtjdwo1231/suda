'use client'

interface FabButtonProps {
  onClick: () => void
}

export default function FabButton({ onClick }: FabButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="수다 쓰기"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-sm shadow-lg hover:opacity-80 active:scale-95 transition-all"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      수다 쓰기
    </button>
  )
}
