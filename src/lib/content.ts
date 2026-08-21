type DraftableEntry = {
  data: {
    draft: boolean;
    publishedAt: Date;
  };
};

export const isVisible = (entry: DraftableEntry) => import.meta.env.DEV || !entry.data.draft;

export const byNewest = <T extends DraftableEntry>(a: T, b: T) =>
  b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);

export const statusLabels = {
  seedling: 'Semente',
  growing: 'Em crescimento',
  evergreen: 'Perenne',
} as const;

export interface ContentIndexItem {
  kind: 'Projeto' | 'Artigo' | 'Pensamento';
  title: string;
  description: string;
  publishedAt: Date;
  tags: string[];
  status?: keyof typeof statusLabels;
  href: string;
}

export async function getContentIndex(): Promise<ContentIndexItem[]> {
  const { getCollection } = await import('astro:content');
  const [projects, posts, notes] = await Promise.all([
    getCollection('projects', isVisible),
    getCollection('blog', isVisible),
    getCollection('notes', isVisible),
  ]);

  return [
    ...projects.map((entry) => ({
      kind: 'Projeto' as const,
      title: entry.data.title,
      description: entry.data.description,
      publishedAt: entry.data.publishedAt,
      tags: entry.data.tags,
      href: `/projetos/${entry.id}/`,
    })),
    ...posts.map((entry) => ({
      kind: 'Artigo' as const,
      title: entry.data.title,
      description: entry.data.description,
      publishedAt: entry.data.publishedAt,
      tags: entry.data.tags,
      href: `/blog/${entry.id}/`,
    })),
    ...notes.map((entry) => ({
      kind: 'Pensamento' as const,
      title: entry.data.title,
      description: entry.data.description,
      publishedAt: entry.data.publishedAt,
      tags: entry.data.tags,
      status: entry.data.status,
      href: `/pensamentos/${entry.id}/`,
    })),
  ].sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf());
}
