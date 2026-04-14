import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/password'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await request.json() as {
    title?: string
    content?: string
    password?: string
    nickname?: string
    image_url?: string
  }
  const { title, content, password, nickname, image_url } = body

  if (!title?.trim() || !content?.trim() || !password?.trim()) {
    return NextResponse.json({ error: '제목, 내용, 비밀번호를 모두 입력해주세요.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: memo, error: fetchError } = await supabase
    .from('memos')
    .select('password_hash')
    .eq('id', id)
    .single()

  if (fetchError || !memo) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 })
  }

  const isValid = await verifyPassword(password, memo.password_hash)
  if (!isValid) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  const { error: updateError } = await supabase
    .from('memos')
    .update({
      title: title.trim(),
      content: content.trim(),
      nickname: nickname?.trim() || null,
      image_url: image_url ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
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

  const { data: memo, error: fetchError } = await supabase
    .from('memos')
    .select('password_hash')
    .eq('id', id)
    .single()

  if (fetchError || !memo) {
    return NextResponse.json({ error: '글을 찾을 수 없습니다.' }, { status: 404 })
  }

  const isValid = await verifyPassword(password, memo.password_hash)
  if (!isValid) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 })
  }

  const { error: deleteError } = await supabase
    .from('memos')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
