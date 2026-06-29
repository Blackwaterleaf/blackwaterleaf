import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

type AuthenticatedUser = NonNullable<TrpcContext['user']>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };
}

describe('Knowledge Articles', () => {
  it('should retrieve all knowledge articles', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.knowledge.list({});

    expect(articles.length).toBeGreaterThanOrEqual(30);
  });

  it('should retrieve houseplants category articles', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.knowledge.list({ category: 'houseplants', limit: 50 });

    expect(articles.length).toBeGreaterThanOrEqual(20);
  });

  it('should have Monstera articles', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.knowledge.list({ category: 'houseplants', limit: 50 });
    const monsteraArticles = articles.filter(a => a.title.includes('Monstera'));

    expect(monsteraArticles.length).toBeGreaterThanOrEqual(10);
  });

  it('should have Alocasia articles', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.knowledge.list({ category: 'houseplants', limit: 50 });
    const alocasiaArticles = articles.filter(a => a.title.includes('Alocasia'));

    expect(alocasiaArticles.length).toBeGreaterThanOrEqual(10);
  });

  it('should retrieve article by slug', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const article = await caller.knowledge.get({ slug: 'monstera-deliciosa' });

    expect(article).toBeDefined();
    expect(article?.title).toBe('Monstera deliciosa');
    expect(article?.category).toBe('houseplants');
    expect(article?.content).toContain('Beschreibung');
  });

  it('should have valid article structure', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.knowledge.list({ category: 'houseplants', limit: 50 });
    const article = articles.find(a => a.title.includes('Monstera deliciosa'));

    expect(article).toBeDefined();
    if (article) {
      expect(article.title).toBeDefined();
      expect(article.slug).toBeDefined();
      expect(article.excerpt).toBeDefined();
      expect(article.category).toBe('houseplants');
      expect(article.author).toBe('BlackwaterLeaf Redaktion');
      expect(article.readingMinutes).toBeGreaterThan(0);
    }
  });

  it('should have unique slugs', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.knowledge.list({ limit: 50 });
    const slugs = articles.map(a => a.slug);
    const uniqueSlugs = new Set(slugs);

    expect(slugs.length).toBe(uniqueSlugs.size);
  });

  it('should retrieve Monstera deliciosa with full content', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const article = await caller.knowledge.get({ slug: 'monstera-deliciosa' });

    expect(article).toBeDefined();
    if (article) {
      expect(article.content).toContain('Blattmerkmale');
      expect(article.content).toContain('Pflegeanforderungen');
      expect(article.content).toContain('Wachstum');
    }
  });

  it('should retrieve Alocasia polly article', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const articles = await caller.knowledge.list({ category: 'houseplants', limit: 50 });
    const pollyArticle = articles.find(a => a.title.includes('Polly'));

    expect(pollyArticle).toBeDefined();
    if (pollyArticle) {
      expect(pollyArticle.category).toBe('houseplants');
      expect(pollyArticle.author).toBe('BlackwaterLeaf Redaktion');
    }
  });

  it('should list knowledge categories', async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const categories = await caller.knowledge.categories();

    expect(categories.length).toBeGreaterThan(0);
    const houseplantsCat = categories.find(c => c.category === 'houseplants');
    expect(houseplantsCat).toBeDefined();
    expect(houseplantsCat?.count).toBeGreaterThanOrEqual(20);
  });
});
