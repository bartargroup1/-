import { createClient } from '@supabase/supabase-js';
import { SystemItem } from '../types/portal';

export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://zozlanygromtrhfogimx.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_E74NT-V_egGuw3j0EcJCeA_7p2EmO_W';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const SUPABASE_SQL_SCHEMA = `-- ۱. ایجاد جدول سامانه‌های پرتال واته در سوپابیس
create table if not exists systems (
  id text primary key,
  title text not null,
  subtitle text,
  category text,
  description text,
  url text not null,
  health_check_url text,
  icon text default 'network',
  embed_mode text default 'auto',
  tags text[],
  display_order int default 1,
  accent_color text default '#b45309',
  internal_code text,
  status text default 'untested',
  status_message text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ۲. فعال‌سازی دسترسی امن خواندن و ذخیره
alter table systems enable row level security;
drop policy if exists "Public Systems Access" on systems;
create policy "Public Systems Access" on systems for all using (true) with check (true);
`;

export interface SupabaseFetchResult {
  data: SystemItem[] | null;
  error: any | null;
  isTableMissing: boolean;
}

/**
 * Fetch all systems from Supabase PostgreSQL table
 */
export async function fetchSystemsFromSupabase(): Promise<SupabaseFetchResult> {
  try {
    const { data, error } = await supabase
      .from('systems')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      // Check if table does not exist
      const isMissing = 
        error.code === '42P01' || 
        error.message?.includes('does not exist') ||
        error.message?.includes('relation "public.systems"');

      return {
        data: null,
        error,
        isTableMissing: isMissing,
      };
    }

    if (!data || data.length === 0) {
      return {
        data: [],
        error: null,
        isTableMissing: false,
      };
    }

    // Map database snake_case to frontend camelCase
    const mapped: SystemItem[] = data.map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle || '',
      category: row.category || 'سامانه عمومی',
      description: row.description || '',
      url: row.url,
      healthCheckUrl: row.health_check_url || '',
      icon: row.icon || 'network',
      embedMode: row.embed_mode || 'auto',
      tags: row.tags || [],
      order: row.display_order || 1,
      accentColor: row.accent_color || '#b45309',
      internalCode: row.internal_code || '',
      status: row.status || 'untested',
      statusMessage: row.status_message || '',
    }));

    return {
      data: mapped,
      error: null,
      isTableMissing: false,
    };
  } catch (err) {
    return {
      data: null,
      error: err,
      isTableMissing: false,
    };
  }
}

/**
 * Save / Upsert systems into Supabase
 */
export async function saveSystemsToSupabase(systems: SystemItem[]) {
  try {
    const rows = systems.map((sys, idx) => ({
      id: sys.id,
      title: sys.title,
      subtitle: sys.subtitle || '',
      category: sys.category || '',
      description: sys.description || '',
      url: sys.url,
      health_check_url: sys.healthCheckUrl || '',
      icon: sys.icon || 'network',
      embed_mode: sys.embedMode || 'auto',
      tags: sys.tags || [],
      display_order: idx + 1,
      accent_color: sys.accentColor || '#b45309',
      internal_code: sys.internalCode || '',
      status: sys.status || 'untested',
    }));

    const { data, error } = await supabase
      .from('systems')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert error:', error);
    }

    return { data, error };
  } catch (err) {
    console.error('Supabase save exception:', err);
    return { data: null, error: err };
  }
}

/**
 * Delete a system from Supabase
 */
export async function deleteSystemFromSupabase(systemId: string) {
  try {
    const { error } = await supabase
      .from('systems')
      .delete()
      .eq('id', systemId);
    return { error };
  } catch (err) {
    return { error: err };
  }
}
