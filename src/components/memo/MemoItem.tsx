import AnonymousAvatar from '@/components/ui/AnonymousAvatar'
import { formatRelativeTime } from '@/lib/time'
import type { Memo } from '@/types/memo'

interface MemoItemProps {
  memo: Memo
  onClick: (memo: Memo) => void
}

export default function MemoItem({ memo, onClick }: MemoItemProps) {
  return (
    <article
      onClick={() => onClick(memo)}
      className="flex gap-3 px-4 md:px-6 py-4 md:py-5 mx-4 md:mx-6 my-2 rounded-2xl border border-[#64748B]/40 bg-white dark:bg-[#1a1a1a] cursor-pointer hover:shadow-md hover:border-[#64748B]/70 transition-all"
    >
      <AnonymousAvatar
        seed={memo.id}
        nickname={memo.nickname}
        profileImageUrl={memo.profile_image_url}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <time className="text-xs md:text-sm text-neutral-400 shrink-0" dateTime={memo.created_at}>
            {formatRelativeTime(memo.created_at)}
          </time>
        </div>
        <p className="text-sm md:text-base font-medium text-neutral-900 dark:text-neutral-100 mb-1 truncate">
          {memo.title}
        </p>
        <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 line-clamp-3 break-words">
          {memo.content}
        </p>
        {memo.image_url && (
          <div className="mt-2 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-800 w-24 h-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={memo.image_url} alt="첨부 이미지" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </article>
  )
}
