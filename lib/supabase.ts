import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Create a singleton instance for the client-side
let clientSideSupabase: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    // Server-side: Create a new client for each request
    return createSupabaseClient()
  }

  // Client-side: Reuse the same client
  if (!clientSideSupabase) {
    clientSideSupabase = createSupabaseClient()
  }

  return clientSideSupabase
}
