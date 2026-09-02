'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { mergeCartOnLogin } from './cart'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if user is approved (specifically for Retailers)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_approved, roles(name)')
      .eq('id', user.id)
      .single()

    if ((profile?.roles as any)?.name === 'Retailer' && profile.is_approved === false) {
      await supabase.auth.signOut()
      return { error: 'Your Retailer account is pending admin approval.' }
    }
  }

  // After login, merge guest cart into user cart
  await mergeCartOnLogin()
  
  revalidatePath('/', 'layout')
  redirect('/account')
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const phone = formData.get('phone') as string

  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Use Admin API to bypass rate limits and auto-verify
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      phone: phone
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    try {

      // 1.5 Create the user's profile in the public schema
      const { error: profileErr } = await adminClient.from('profiles').insert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        phone: phone
      })
      if (profileErr) console.error("Profile creation failed:", profileErr)

      // 2. Since they are verified, log them in automatically
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (loginErr) return { error: loginErr.message }

      // 3. Merge guest cart into user cart
      await mergeCartOnLogin()
    } catch (err: any) {
      console.error("Signup post-processing error:", err)
      return { error: "An error occurred during account setup. Please try logging in." }
    }
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}

export async function signupRetailer(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const phone = formData.get('phone') as string

  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Use Admin API to bypass rate limits and auto-verify
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      phone: phone
    }
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    try {
      // Find Retailer role ID
      const { data: roleData } = await adminClient.from('roles').select('id').eq('name', 'Retailer').single()

      // Create the user's profile with Retailer role AND is_approved = false
      const { error: profileErr } = await adminClient.from('profiles').insert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        role_id: roleData?.id || null,
        is_approved: false
      })
      if (profileErr) console.error("Profile creation failed:", profileErr)

      // IMPORTANT: We do NOT auto-login retailers. They must wait for admin approval.
      return { success: true, message: "Application submitted successfully. Please wait for admin approval." }
    } catch (err: any) {
      console.error("Retailer Signup error:", err)
      return { error: "An error occurred during account setup. Please try again." }
    }
  }

  return { error: "An unknown error occurred." }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch the full profile
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single()

  return { ...user, profile }
}
