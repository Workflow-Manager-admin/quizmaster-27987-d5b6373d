import { createClient } from '@supabase/supabase-js';

// PUBLIC_INTERFACE
export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || '<YOUR_SUPABASE_URL>',
  process.env.REACT_APP_SUPABASE_ANON_KEY || '<YOUR_SUPABASE_ANON_KEY>'
);
/**
 * This instance allows the app to use Supabase authentication and database.
 * Replace <YOUR_SUPABASE_URL> and <YOUR_SUPABASE_ANON_KEY> with your env/keys.
 */
