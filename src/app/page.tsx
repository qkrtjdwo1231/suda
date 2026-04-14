import { createServiceClient } from '@/lib/supabase/server'
import MemoFeed from '@/components/memo/MemoFeed'
import type { Memo } from '@/types/memo'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('memos')
    .select('id, title, content, nickname, image_url, profile_image_url, created_at, updated_at')
    .order('created_at', { ascending: false })

  const initialMemos: Memo[] = data ?? []

  return <MemoFeed initialMemos={initialMemos} />
}
