'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAdmin(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const validPassword = process.env.ADMIN_PASSWORD

  if (!password) {
    return { error: 'Password is required' }
  }

  if (password !== validPassword) {
    return { error: 'Invalid password' }
  }

  // Set cookie securely
  const cookieStore = await cookies()
  cookieStore.set('admin_token', password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })

  redirect('/admin')
}
