import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://wjhxefkzaclqbbbmmakt.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqaHhlZmt6YWNscWJiYm1tYWt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTEyMzksImV4cCI6MjA5MjMyNzIzOX0.xDtw91Oa4QiMhsWPxWWdCwgP94f37SVJMOoOUDqo3Hc"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)