import type { APIRoute } from 'astro';
import { getContentIndex } from '../lib/content';

const escapeXml = (value: string) => value.replace(/[<>&"']/g, (char) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
}[char]!));

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('A URL do site é necessária para gerar o sitemap.');
  const content = await getContentIndex();
  const tags = [...new Set(content.flatMap((item) => item.tags))];
  const paths = ['/', '/projetos/', '/blog/', '/pensamentos/', '/sobre/', '/contato/', '/tags/',
    ...content.map((item) => item.href), ...tags.map((tag) => '/tags/' + tag + '/')];
  const urls = [...new Set(paths)].map((path) => '<url><loc>' + escapeXml(new URL(path, site).href) + '</loc></url>');
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls.join('') + '</urlset>',
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
