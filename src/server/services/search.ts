import { prisma } from "../db";
import { Prisma } from "@prisma/client";

interface SearchOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: "asc" | "desc";
  filters?: Record<string, any>;
}

interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class SearchService {
  /**
   * Search predictions
   */
  async searchPredictions(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<any>> {
    const { limit = 10, offset = 0, filters = {} } = options;

    const where: Prisma.PredictionWhereInput = {
      AND: [
        {
          OR: [
            { prediction: { contains: query, mode: "insensitive" } },
            { asset: { symbol: { contains: query, mode: "insensitive" } } },
            { forecaster: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
      ],
    };

    // Apply filters
    if (filters.outcome) {
      where.outcome = filters.outcome;
    }

    if (filters.assetType) {
      where.asset = { type: filters.assetType };
    }

    if (filters.forecasterId) {
      where.forecasterId = filters.forecasterId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    const [items, total] = await Promise.all([
      prisma.prediction.findMany({
        where,
        include: {
          forecaster: {
            select: {
              name: true,
              slug: true,
              profile: true,
              isVerified: true,
            },
          },
          asset: {
            select: {
              symbol: true,
              type: true,
              priceData: true,
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.prediction.count({ where }),
    ]);

    return this.formatSearchResult(items, total, limit, offset);
  }

  /**
   * Search forecasters
   */
  async searchForecasters(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<any>> {
    const { limit = 10, offset = 0, filters = {} } = options;

    const where: Prisma.ForecasterWhereInput = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        {
          profile: {
            path: ["bio"],
            string_contains: query,
          },
        },
      ],
    };

    // Apply filters
    if (filters.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }

    if (filters.isActive !== undefined) {
      where.isVerified = filters.isActive;
    }

    if (filters.expertise) {
      where.profile = {
        path: ["expertise"],
        array_contains: filters.expertise,
      };
    }

    const [items, total] = await Promise.all([
      prisma.forecaster.findMany({
        where,
        include: {
          _count: {
            select: {
              predictions: true,
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: this.getForecasterOrderBy(options.orderBy),
      }),
      prisma.forecaster.count({ where }),
    ]);

    return this.formatSearchResult(items, total, limit, offset);
  }

  /**
   * Search assets
   */
  async searchAssets(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<any>> {
    const { limit = 10, offset = 0, filters = {} } = options;

    const where: Prisma.AssetWhereInput = {
      OR: [
        { symbol: { contains: query, mode: "insensitive" } },
        {
          metadata: {
            path: ["name"],
            string_contains: query,
          },
        },
      ],
    };

    // Apply filters
    if (filters.type) {
      where.type = filters.type;
    }

    // Asset model doesn't have isActive/isVerified field

    const [items, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        include: {
          _count: {
            select: {
              predictions: true,
              priceHistory: true,
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: { symbol: "asc" },
      }),
      prisma.asset.count({ where }),
    ]);

    return this.formatSearchResult(items, total, limit, offset);
  }

  /**
   * Search articles
   */
  async searchArticles(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult<any>> {
    const { limit = 10, offset = 0, filters = {} } = options;

    const where: Prisma.ArticleWhereInput = {
      AND: [
        {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            {
              tags: {
                has: query,
              },
            },
          ],
        },
        { status: "PUBLISHED" },
      ],
    };

    // Apply filters
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters.isPremium !== undefined) {
      where.isPremium = filters.isPremium;
    }

    const [items, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: {
            select: {
              fullName: true,
              email: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
              color: true,
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: { publishDate: "desc" },
      }),
      prisma.article.count({ where }),
    ]);

    return this.formatSearchResult(items, total, limit, offset);
  }

  /**
   * Global search across all entities
   */
  async globalSearch(query: string, options: SearchOptions = {}) {
    const { limit = 5 } = options;

    const [predictions, forecasters, assets, articles] = await Promise.all([
      this.searchPredictions(query, { limit }),
      this.searchForecasters(query, { limit }),
      this.searchAssets(query, { limit }),
      this.searchArticles(query, { limit }),
    ]);

    return {
      predictions: predictions.items,
      forecasters: forecasters.items,
      assets: assets.items,
      articles: articles.items,
      totals: {
        predictions: predictions.total,
        forecasters: forecasters.total,
        assets: assets.total,
        articles: articles.total,
      },
    };
  }

  /**
   * Search suggestions (autocomplete)
   */
  async searchSuggestions(query: string, type?: string) {
    const suggestions = [];

    if (!type || type === "forecasters") {
      const forecasters = await prisma.forecaster.findMany({
        where: {
          OR: [
            { name: { startsWith: query, mode: "insensitive" } },
            { slug: { startsWith: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          profile: true,
        },
        take: 5,
      });

      suggestions.push(
        ...forecasters.map(f => ({
          type: "forecaster",
          id: f.id,
          label: f.name,
          value: f.slug,
          avatar: (f.profile as any)?.avatar,
        }))
      );
    }

    if (!type || type === "assets") {
      const assets = await prisma.asset.findMany({
        where: {
          symbol: { startsWith: query.toUpperCase() },
        },
        select: {
          id: true,
          symbol: true,
          metadata: true,
        },
        take: 5,
      });

      suggestions.push(
        ...assets.map(a => ({
          type: "asset",
          id: a.id,
          label: `${a.symbol} - ${(a.metadata as any)?.name}`,
          value: a.symbol,
        }))
      );
    }

    if (!type || type === "tags") {
      // Get unique tags from predictions and articles
      const articles = await prisma.article.findMany({
        where: {
          tags: {
            has: query,
          },
        },
        select: {
          tags: true,
        },
        take: 20,
      });

      const allTags = new Set<string>();
      articles.forEach(a => {
        (a.tags as string[]).forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            allTags.add(tag);
          }
        });
      });

      suggestions.push(
        ...Array.from(allTags)
          .slice(0, 5)
          .map(tag => ({
            type: "tag",
            id: tag,
            label: tag,
            value: tag,
          }))
      );
    }

    return suggestions;
  }

  /**
   * Advanced search with facets
   */
  async advancedSearch(query: string, facets: string[] = []) {
    const results: any = {
      items: [],
      facets: {},
    };

    // Get search results
    const searchResults = await this.globalSearch(query);
    results.items = searchResults;

    // Calculate facets
    if (facets.includes("assetType")) {
      const assetTypes = await prisma.asset.groupBy({
        by: ["type"],
        _count: {
          id: true,
        },
      });

      results.facets.assetTypes = assetTypes.map(at => ({
        value: at.type,
        count: at._count.id,
      }));
    }

    if (facets.includes("outcome")) {
      const outcomes = await prisma.prediction.groupBy({
        by: ["outcome"],
        _count: {
          id: true,
        },
      });

      results.facets.outcomes = outcomes.map(o => ({
        value: o.outcome,
        count: o._count.id,
      }));
    }

    if (facets.includes("category")) {
      const categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              articles: true,
            },
          },
        },
      });

      results.facets.categories = categories.map(c => ({
        id: c.id,
        name: c.name,
        count: c._count.articles,
      }));
    }

    return results;
  }

  /**
   * Save search query for analytics
   */
  async saveSearchQuery(query: string, userId?: string, results?: number) {
    await prisma.event.create({
      data: {
        type: "SEARCH",
        entityType: "QUERY",
        entityId: query,
        data: {
          query,
          resultsCount: results,
          timestamp: new Date().toISOString(),
        },
        userId,
      },
    });
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(days = 7, limit = 10) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const searches = await prisma.event.groupBy({
      by: ["entityId"],
      where: {
        type: "SEARCH",
        createdAt: { gte: since },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: limit,
    });

    return searches.map(s => ({
      query: s.entityId,
      count: s._count.id,
    }));
  }

  // Helper methods
  private formatSearchResult<T>(
    items: T[],
    total: number,
    limit: number,
    offset: number
  ): SearchResult<T> {
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages,
    };
  }

  private getForecasterOrderBy(orderBy?: string) {
    switch (orderBy) {
      case "accuracy":
        return { name: "asc" as const };
      case "predictions":
        return { name: "asc" as const };
      case "rank":
        return { name: "asc" as const };
      default:
        return { name: "asc" as const };
    }
  }
}