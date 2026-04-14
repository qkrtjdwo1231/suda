const COLORS = [
  'bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400',
  'bg-teal-400', 'bg-cyan-400', 'bg-blue-400', 'bg-violet-400',
  'bg-purple-400', 'bg-pink-400',
]

interface AnonymousAvatarProps {
  seed: string
  nickname?: string | null
  profileImageUrl?: string | null
  size?: 'sm' | 'md'
}

export default function AnonymousAvatar({ seed, nickname, profileImageUrl, size = 'md' }: AnonymousAvatarProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'

  if (profileImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profileImageUrl}
        alt={nickname ?? '익명'}
        className={`${sizeClass} rounded-full object-cover shrink-0`}
      />
    )
  }

  const index = seed.charCodeAt(0) % COLORS.length
  const color = COLORS[index]
  const letter = nickname?.trim() ? nickname.trim()[0] : '익'

  return (
    <div
      className={`${color} ${sizeClass} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      aria-label={nickname ?? '익명'}
    >
      {letter}
    </div>
  )
}
