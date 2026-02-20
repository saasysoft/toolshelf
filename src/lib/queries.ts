import { supabase } from './supabase';
import type { Tool, Category, Collection, ToolFilters } from '@/types/tool';
import { slugify, slugToQueryValues } from '@/lib/landing-pages';

const TOOLS_PER_PAGE = 24;

export async function getTools(filters: ToolFilters = {}, page = 1, perPage = TOOLS_PER_PAGE): Promise<{ tools: Tool[]; count: number }> {
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

    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);

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

export async function searchTools(query: string, page = 1, filters: ToolFilters = {}, perPage = TOOLS_PER_PAGE): Promise<{ tools: Tool[]; count: number }> {
  try {
    const tsQuery = query.trim().split(/\s+/).join(' & ');
    const from = (page - 1) * perPage;

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

    q = q.range(from, from + perPage - 1);

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

export async function getDistinctDimensions(minCount = 3): Promise<{ slug: string; count: number }[]> {
  try {
    const { data, error } = await supabase
      .from('tools')
      .select('languages, works_with');
    if (error || !data) return [];

    const counts = new Map<string, number>();
    for (const row of data) {
      const values = [
        ...(row.languages || []),
        ...(row.works_with || []),
      ];
      for (const v of values) {
        const s = slugify(v);
        if (s && s !== 'unknown') counts.set(s, (counts.get(s) || 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .filter(([, count]) => count >= minCount)
      .map(([slug, count]) => ({ slug, count }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

export async function getToolsByDimension(dimensionSlug: string): Promise<Tool[]> {
  try {
    const values = slugToQueryValues(dimensionSlug);
    const map = new Map<string, Tool>();

    for (const val of values) {
      const [{ data: langData }, { data: worksData }] = await Promise.all([
        supabase.from('tools').select('*').contains('languages', [val]),
        supabase.from('tools').select('*').contains('works_with', [val]),
      ]);
      for (const tool of [...(langData || []), ...(worksData || [])]) {
        map.set(tool.slug, tool as Tool);
      }
    }

    return Array.from(map.values()).sort((a, b) => b.quality_score - a.quality_score);
  } catch {
    return [];
  }
}

export async function getToolsByCategoryAndDimension(category: string, dimensionSlug: string): Promise<Tool[]> {
  try {
    const values = slugToQueryValues(dimensionSlug);
    const map = new Map<string, Tool>();

    for (const val of values) {
      const [{ data: langData }, { data: worksData }] = await Promise.all([
        supabase.from('tools').select('*').eq('category', category).contains('languages', [val]),
        supabase.from('tools').select('*').eq('category', category).contains('works_with', [val]),
      ]);
      for (const tool of [...(langData || []), ...(worksData || [])]) {
        map.set(tool.slug, tool as Tool);
      }
    }

    return Array.from(map.values()).sort((a, b) => b.quality_score - a.quality_score);
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
