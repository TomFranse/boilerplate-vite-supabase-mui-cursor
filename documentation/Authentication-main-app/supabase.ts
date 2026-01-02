import {createClient, SupabaseClient} from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage =
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY';
  console.error('[SupabaseConfig]', errorMessage, {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });
  throw new Error(errorMessage);
}

// Validate URL format
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  console.warn('[SupabaseConfig] Supabase URL should start with https://', {
    url: supabaseUrl.substring(0, 50),
  });
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Use PKCE flow for better security and CORS compatibility
      flowType: 'pkce',
    },
    // Add global error handling for network issues
    global: {
      headers: {
        'x-client-info': 'chatgpt-clone-customcode',
      },
    },
    // Add realtime configuration with better error handling
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
);

// Log connection status in development
if (import.meta.env.DEV) {
  console.log('[SupabaseConfig] Supabase client initialized', {
    url: supabaseUrl.substring(0, 30) + '...',
    hasKey: !!supabaseAnonKey,
  });
}
