import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import MemoFeed from '@/components/memo/MemoFeed'
import type { Memo } from '@/types/memo'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function CommunityPage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: community } = await supabase
    .from('communities')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!community) notFound()

  const { data } = await supabase
    .from('memos')
    .select('id, title, content, nickname, image_url, profile_image_url, created_at, updated_at')
    .eq('community_id', id)
    .order('created_at', { ascending: false })

  const initialMemos: Memo[] = data ?? []

  return (
    <MemoFeed
      initialMemos={initialMemos}
      communityId={community.id}
      communityName={community.name}
    />
  )
}
