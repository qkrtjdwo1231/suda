import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/password'

export async function GET() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('communities')
    .select('id, name, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: '목록을 불러오지 못했습니다.' }, { status: 500 })
  }

  return NextResponse.json({ communities: data ?? [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { name?: string; password?: string }
  const { name, password } = body

  if (!name?.trim() || !password?.trim()) {
    return NextResponse.json({ error: '커뮤니티 이름과 비밀번호를 입력해주세요.' }, { status: 400 })
  }

  if (name.length > 30) {
    return NextResponse.json({ error: '커뮤니티 이름은 30자 이내로 입력해주세요.' }, { status: 400 })
  }

  if (password.length < 4 || password.length > 20) {
    return NextResponse.json({ error: '비밀번호는 4~20자로 입력해주세요.' }, { status: 400 })
  }

  const password_hash = await hashPassword(password)
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('communities')
    .insert({ name: name.trim(), password_hash })
    .select('id, name, created_at, updated_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '이미 존재하는 커뮤니티 이름입니다.' }, { status: 409 })
    }
    return NextResponse.json({ error: '커뮤니티 생성에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
