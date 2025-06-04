/**
 * Authentication logic using Supabase.
 */
import { supabase } from './supabaseClient';

// PUBLIC_INTERFACE
export async function signInWithEmail(email, password) {
  // Tries sign-in
  return await supabase.auth.signInWithPassword({ email, password });
}

// PUBLIC_INTERFACE
export async function signUpWithEmail(email, password) {
  // Tries sign-up
  return await supabase.auth.signUp({ email, password });
}

// PUBLIC_INTERFACE
export async function signOut() {
  // Sign out current user
  return await supabase.auth.signOut();
}

// PUBLIC_INTERFACE
export function getCurrentUser() {
  // Returns current user from supabase
  return supabase.auth.getUser();
}

// PUBLIC_INTERFACE
export function onAuthStateChange(callback) {
  // Registers a Supabase auth state change listener
  return supabase.auth.onAuthStateChange(callback);
}
