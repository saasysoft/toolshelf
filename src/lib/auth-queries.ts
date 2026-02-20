import { createSupabaseBrowser } from './supabase-browser';

export async function getProfile(userId: string) {
  const supabase = createSupabaseBrowser();
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function updateProfile(userId: string, updates: { display_name?: string; bio?: string }) {
  const supabase = createSupabaseBrowser();
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return { error };
}

export async function getBookmarks(userId: string) {
  const supabase = createSupabaseBrowser();
  const { data } = await supabase
    .from('bookmarks')
    .select('tool_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getBookmarkedTools(userId: string) {
  const supabase = createSupabaseBrowser();
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('tool_id')
    .eq('user_id', userId);

  if (!bookmarks?.length) return [];

  const toolIds = bookmarks.map((b) => b.tool_id);
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .in('id', toolIds);

  return tools ?? [];
}

export async function isBookmarked(userId: string, toolId: string) {
  const supabase = createSupabaseBrowser();
  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('tool_id', toolId)
    .maybeSingle();
  return !!data;
}

export async function toggleBookmark(userId: string, toolId: string): Promise<boolean> {
  const supabase = createSupabaseBrowser();
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('tool_id', toolId)
    .maybeSingle();

  if (existing) {
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return false; // unbookmarked
  } else {
    await supabase.from('bookmarks').insert({ user_id: userId, tool_id: toolId });
    return true; // bookmarked
  }
}
