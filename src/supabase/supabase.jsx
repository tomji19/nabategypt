// ============================================
// SUPABASE CLIENT CONFIGURATION
// ============================================
// This file creates a single Supabase client that we'll use throughout the app
// Think of it as a "connection" to our Supabase backend

import { createClient } from '@supabase/supabase-js';

// STEP 1: Get Supabase credentials from environment variables
// Environment variables (VITE_SUPABASE_URL, etc.) are stored in .env file
// They're prefixed with VITE_ so Vite can expose them to the frontend
// We use || '' as a fallback - if env var doesn't exist, use empty string
// The fallback values are your actual credentials (for development)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ecfffetazjecdwbepfbz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZmZmZXRhemplY2R3YmVwZmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjU4NzQsImV4cCI6MjA4MjYwMTg3NH0.ypA433RL47PsFx-M5hdgRbPe7KpShsvwu41ul7r5L4Y';

// STEP 2: Create and export the Supabase client
// createClient() creates a connection object that has methods for:
// - Authentication (auth.signUp, auth.signIn, etc.)
// - Database queries (from('table').select(), etc.)
// - Real-time subscriptions
// - Storage operations
// We export it so other files can import and use it
// This is a SINGLETON pattern - one client shared across the entire app
//
// IMPORTANT: Configure auth to use localStorage explicitly
// This ensures sessions persist across page refreshes
// auth.storage = 'localStorage' tells Supabase to store session in browser localStorage
// This is the default, but we're being explicit to ensure it works
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,        // Automatically refresh tokens before they expire
    persistSession: true,          // Persist session in storage (localStorage)
    detectSessionInUrl: true,     // Detect session from URL (for OAuth redirects)
  },
});

