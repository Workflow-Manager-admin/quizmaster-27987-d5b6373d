import { createClient } from '@supabase/supabase-js';

/**
 * PUBLIC_INTERFACE
 * Initializes the Supabase client only if valid credentials are supplied.
 * 
 * To use this app, you MUST supply your Supabase project credentials. 
 * Create a `.env` file in the root of your project (next to package.json) with:
 * 
 *   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
 *   REACT_APP_SUPABASE_ANON_KEY=your-anon-public-key
 * 
 * Never commit secret admin keys! Only use the public anon key for frontend.
 * 
 * If credentials are missing or invalid, throws a clear error to guide developers.
 */

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

function isValidUrl(s) {
  if (!s || typeof s !== 'string') return false;
  try {
    // Throws if not a valid http(s) URL
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

if (!isValidUrl(SUPABASE_URL) || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.startsWith('<')) {
  throw new Error(
    `SupabaseClient: Invalid or missing Supabase credentials.
Set your environment variables in a .env file in the project root:
  REACT_APP_SUPABASE_URL=YourSupabaseUrl
  REACT_APP_SUPABASE_ANON_KEY=YourPublicAnonKey

You can find these in your Supabase project settings. 
Refer to https://supabase.com/docs or your README for more info.`
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
