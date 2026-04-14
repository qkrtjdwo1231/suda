import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/password'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await request.json() as { password?: string }
  const { password } = body

  if (!password?.trim()) {
    return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: community, error } = await supabase
    .from('communities')
    .select('password_hash')
    .eq('id', id)
    .single()

  if (error || !community) {
    return NextResponse.json({ error: '수다방를 찾을 수 없습니다.' }, { status: 404 })
  }

  const isValid = await verifyPassword(password, community.password_hash)
  if (!isValid) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}
