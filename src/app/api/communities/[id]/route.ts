import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPassword, hashPassword } from '@/lib/password'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await request.json() as { name?: string; password?: string; newPassword?: string }
  const { name, password, newPassword } = body

  if (!password?.trim()) {
    return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: community, error: fetchError } = await supabase
    .from('communities')
    .select('password_hash')
    .eq('id', id)
    .single()

  if (fetchError || !community) {
    return NextResponse.json({ error: '커뮤니티를 찾을 수 없습니다.' }, { status: 404 })
  }

  const isValid = await verifyPassword(password, community.password_hash)
  if (!isValid) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  const updateData: Record<string, string> = { updated_at: new Date().toISOString() }
  if (name?.trim()) updateData.name = name.trim()
  if (newPassword?.trim()) {
    if (newPassword.length < 4 || newPassword.length > 20) {
      return NextResponse.json({ error: '새 비밀번호는 4~20자로 입력해주세요.' }, { status: 400 })
    }
    updateData.password_hash = await hashPassword(newPassword)
  }

  const { error: updateError } = await supabase
    .from('communities')
    .update(updateData)
    .eq('id', id)

  if (updateError) {
    if (updateError.code === '23505') {
      return NextResponse.json({ error: '이미 존재하는 커뮤니티 이름입니다.' }, { status: 409 })
    }
    return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await request.json() as { password?: string }
  const { password } = body

  if (!password?.trim()) {
    return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: community, error: fetchError } = await supabase
    .from('communities')
    .select('password_hash')
    .eq('id', id)
    .single()

  if (fetchError || !community) {
    return NextResponse.json({ error: '커뮤니티를 찾을 수 없습니다.' }, { status: 404 })
  }

  const isValid = await verifyPassword(password, community.password_hash)
  if (!isValid) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  const { error: deleteError } = await supabase
    .from('communities')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
