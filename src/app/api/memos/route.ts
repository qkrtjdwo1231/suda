import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/password'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim()

  const supabase = createServiceClient()

  let query = supabase
    .from('memos')
    .select('id, title, content, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: '목록을 불러오지 못했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ memos: data ?? [], total: count ?? data?.length ?? 0 })
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { title?: string; content?: string; password?: string }
  const { title, content, password } = body

  if (!title?.trim() || !content?.trim() || !password?.trim()) {
    return NextResponse.json({ error: '제목, 내용, 비밀번호를 모두 입력해주세요.' }, { status: 400 })
  }

  if (title.length > 100) {
    return NextResponse.json({ error: '제목은 100자 이내로 입력해주세요.' }, { status: 400 })
  }

  if (content.length > 1000) {
    return NextResponse.json({ error: '내용은 1000자 이내로 입력해주세요.' }, { status: 400 })
  }

  if (password.length < 4 || password.length > 20) {
    return NextResponse.json({ error: '비밀번호는 4~20자로 입력해주세요.' }, { status: 400 })
  }

  const password_hash = await hashPassword(password)
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('memos')
    .insert({ title: title.trim(), content: content.trim(), password_hash })
    .select('id, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: '글 작성에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
