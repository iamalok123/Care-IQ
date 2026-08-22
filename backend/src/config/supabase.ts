import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('http') &&
  supabaseKey &&
  supabaseKey.length > 10
);

if (!isSupabaseConfigured) {
  console.warn('⚠️  Supabase environment variables are missing or incomplete. Fallback mode will be active.');
}

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  supabaseKey;

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  anonKey || supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

/**
 * Validates whether Supabase connection and tables are accessible.
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tablesAvailable: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      tablesAvailable: false,
      message: 'Supabase credentials not configured in environment.'
    };
  }

  try {
    const { data, error } = await supabase.from('room_categories').select('id').limit(1);

    if (error) {
      // Table doesn't exist or permission denied
      return {
        connected: true,
        tablesAvailable: false,
        message: `Connected to Supabase endpoint, but tables not found or accessible: ${error.message}`
      };
    }

    return {
      connected: true,
      tablesAvailable: true,
      message: 'Successfully connected to Supabase PostgreSQL database.'
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesAvailable: false,
      message: `Failed to connect to Supabase: ${err?.message || err}`
    };
  }
}
