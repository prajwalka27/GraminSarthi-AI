import { createSupabaseServerClient } from '@/lib/supabase/server'
import { jsonError } from './response'

export async function requireUser() {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return { supabase, response: jsonError('Authentication required', 401) }
    return { supabase, user: data.user }
}
