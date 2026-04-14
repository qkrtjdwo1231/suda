import { createServiceClient } from '@/lib/supabase/server'
import CommunityList from '@/components/community/CommunityList'
import type { Community } from '@/types/community'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('communities')
    .select('id, name, created_at, updated_at')
    .order('created_at', { ascending: false })

  const initialCommunities: Community[] = data ?? []

  return <CommunityList initialCommunities={initialCommunities} />
}
