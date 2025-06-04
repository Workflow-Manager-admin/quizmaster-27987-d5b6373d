import { supabase } from './supabaseClient';

// Define these table names as per your Supabase DB
const QUESTIONS_TABLE = "questions";
const ATTEMPTS_TABLE = "quiz_attempts";

// PUBLIC_INTERFACE
export async function fetchQuizQuestions() {
  // Fetches quiz questions, ordered as in database
  const { data, error } = await supabase
    .from(QUESTIONS_TABLE)
    .select('id, question, options, answer')
    .order('id');
  if (error) throw error;
  return data;
}

// PUBLIC_INTERFACE
export async function hasUserAttemptedQuiz(userId) {
  // Checks if a user already has an attempt record
  const { data, error } = await supabase
    .from(ATTEMPTS_TABLE)
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

// PUBLIC_INTERFACE
export async function submitQuizAttempt(userId, answers, score) {
  // Stores attempt, answers, and score for the user in Supabase
  const { error } = await supabase.from(ATTEMPTS_TABLE).insert([
    {
      user_id: userId,
      responses: answers, // store as JSON
      score: score,
      submitted_at: new Date().toISOString(),
    }
  ]);
  if (error) throw error;
}

// PUBLIC_INTERFACE
export async function fetchUserQuizResult(userId) {
  // Fetches previous result for given user
  const { data, error } = await supabase
    .from(ATTEMPTS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
