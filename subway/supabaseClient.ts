import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://icadmlbgtjcsnctuiifu.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljYWRtbGJndGpjc25jdHVpaWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5NDg1MDAsImV4cCI6MjA0NjUyNDUwMH0.dlYohnNQEGETz9nVVw4tPPyXNiAgZjkARzddGwD4ucE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
