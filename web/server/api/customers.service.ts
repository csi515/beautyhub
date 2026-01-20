import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function getCustomers() {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.from('beautyhub_customers').select('*')
  if (error) throw new Error(error.message)
  return data || []
}


