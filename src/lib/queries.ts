import { supabase } from './supabase';
import type { Tool, Category, Collection, ToolFilters } from '@/types/tool';

const TOOLS_PER_PAGE = 24;

export async function getTools(filters: ToolFilters = {}, page = 1): Promise<{ tools: Tool[]; count: number }> {
  try {
    let query = supabase.from('tools').select('*', { count: 'exact' });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.languages?.length) {
      query = query.overlaps('languages', filters.languages);
    }
    if (filters.platforms?.length) {
      query = query.overlaps('platforms', filters.platforms);
    }
    if (filters.maintenance?.length) {
      query = query.in('maintenance', filters.maintenance);
    }
    if (filters.pricing?.length) {
      query = query.in('pricing', filters.pricing);
    }
    if (filters.minScore !== undefined) {
      query = query.gte('quality_score', filters.minScore);
    }
    if (filters.maxScore !== undefined) {
      query = query.lte('quality_score', filters.maxScore);
    }

    const sort = filters.sort || 'quality_score';
    const ascending = sort === 'name';
    query = query.order(sort, { ascending });

    const from = (page - 1) * TOOLS_PER_PAGE;
    query = query.range(from, from + TOOLS_PER_PAGE - 1);

    const { data, error, count } = await query;
    if (error) {
      console.error('getTools error:', error.message);
      return { tools: [], count: 0 };
    }
    return { tools: (data as Tool[]) || [], count: count || 0 };
  } catch {
    return { tools: [], count: 0 };
  }
}

export async function getToolCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('tools')
      .select('*', { count: 'exact', head: true });
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data as Tool;
  } catch {
    return null;
  }
}

export async function getFeaturedTools(): Promise<Tool[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('featured', true)
      .order('quality_score', { ascending: false })
      .limit(8);
    if (error) return [];
    return (data as Tool[]) || [];
  } catch {
    return [];
  }
}

export async function getRecentTools(limit = 8): Promise<Tool[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data as Tool[]) || [];
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) return [];
    return (data as Category[]) || [];
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data as Category;
  } catch {
    return null;
  }
}

export async function searchTools(query: string, page = 1, filters: ToolFilters = {}): Promise<{ tools: Tool[]; count: number }> {
  try {
    const tsQuery = query.trim().split(/\s+/).join(' & ');
    const from = (page - 1) * TOOLS_PER_PAGE;

    let q = supabase
      .from('tools')
      .select('*', { count: 'exact' })
      .textSearch('fts', tsQuery);

    if (filters.languages?.length) {
      q = q.overlaps('languages', filters.languages);
    }
    if (filters.platforms?.length) {
      q = q.overlaps('platforms', filters.platforms);
    }
    if (filters.maintenance?.length) {
      q = q.in('maintenance', filters.maintenance);
    }
    if (filters.pricing?.length) {
      q = q.in('pricing', filters.pricing);
    }

    const sort = filters.sort || 'quality_score';
    const ascending = sort === 'name';
    q = q.order(sort, { ascending });

    q = q.range(from, from + TOOLS_PER_PAGE - 1);

    const { data, error, count } = await q;

    if (error) return { tools: [], count: 0 };
    return { tools: (data as Tool[]) || [], count: count || 0 };
  } catch {
    return { tools: [], count: 0 };
  }
}

export async function getRelatedTools(tool: Tool, limit = 6): Promise<Tool[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('category', tool.category)
      .neq('slug', tool.slug)
      .order('quality_score', { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data as Tool[]) || [];
  } catch {
    return [];
  }
}

export async function getCollections(): Promise<Collection[]> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data as Collection[]) || [];
  } catch {
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data as Collection;
  } catch {
    return null;
  }
}

export async function getToolsBySlugs(slugs: string[]): Promise<Tool[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .in('slug', slugs);
    if (error) return [];
    return (data as Tool[]) || [];
  } catch {
    return [];
  }
}

export async function getToolsByIds(ids: string[]): Promise<Tool[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .in('id', ids);
    if (error) return [];
    return (data as Tool[]) || [];
  } catch {
    return [];
  }
}

export async function getAllToolSlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('slug');
    if (error) return [];
    return (data || []).map((t: { slug: string }) => t.slug);
  } catch {
    return [];
  }
}

export async function getAllCategorySlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('slug');
    if (error) return [];
    return (data || []).map((c: { slug: string }) => c.slug);
  } catch {
    return [];
  }
}

export async function getAllCollectionSlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('slug');
    if (error) return [];
    return (data || []).map((c: { slug: string }) => c.slug);
  } catch {
    return [];
  }
}

export async function getAlternativesFor(tool: Tool, limit = 12): Promise<Tool[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .or(`alternative_to.cs.{${tool.slug}},category.eq.${tool.category}`)
      .neq('slug', tool.slug)
      .order('quality_score', { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data as Tool[]) || [];
  } catch {
    return [];
  }
}
