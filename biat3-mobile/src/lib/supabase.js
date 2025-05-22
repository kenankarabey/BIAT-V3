import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ykbxjvqvqhfqxlwjqrqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrYnhqdnF2cWhmcXhsd2pxcnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk5MjE5NzAsImV4cCI6MjAyNTQ5Nzk3MH0.Gy8bBWMxGhOIHXXKtqnqeXgZhKRNtVvGOKGPBXjxVtE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 