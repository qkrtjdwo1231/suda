const COLORS = [
  'bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-400',
  'bg-teal-400', 'bg-cyan-400', 'bg-blue-400', 'bg-violet-400',
  'bg-purple-400', 'bg-pink-400',
]

interface AnonymousAvatarProps {
  seed: string
  size?: 'sm' | 'md'
}

export default function AnonymousAvatar({ seed, size = 'md' }: AnonymousAvatarProps) {
  const index = seed.charCodeAt(0) % COLORS.length
  const color = COLORS[index]
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm'

  return (
    <div
      className={`${color} ${sizeClass} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      aria-label="익명 사용자"
    >
      익
    </div>
  )
}
