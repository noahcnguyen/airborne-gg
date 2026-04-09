import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dopntxyftolkcrbumgbb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvcG50eHlmdG9sa2NyYnVtZ2JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2OTgyNzIsImV4cCI6MjA5MTI3NDI3Mn0.XlJ6hNFR-2ZJFHUZu2vS2uxwsv_z8mMH_1FQuJS2n90';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
