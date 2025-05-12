import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vpqcqsiglylfjauzzvuv.supabase.co'; // Buraya kendi Supabase URL'ini yaz
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcWNxc2lnbHlsZmphdXp6dnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNjc5MTUsImV4cCI6MjA2MTg0MzkxNX0.D-o_zWB5GoOfJLBtJ9ueeBCnp5fbr03wqTwrTC09Rmc'; // Buraya kendi anon anahtarını yaz

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 