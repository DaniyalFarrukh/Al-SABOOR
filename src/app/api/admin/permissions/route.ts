import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ permissions: [] })

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles(permissions)')
    .eq('id', user.id)
    .single()

  const roles = profile?.roles as any
  const permissions = roles?.permissions || []
  
  return NextResponse.json({ permissions })
}
