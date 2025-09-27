import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function hashPassword(password: string) {
  const hash = crypto.createHash('sha256')
  hash.update(password)
  return hash.digest('hex')
}

async function main() {
  console.log('🌱 Starting comprehensive seeding...')

  // Clear existing data in order (respecting foreign key constraints)
  console.log('🧹 Clearing existing data...')
  await prisma.comment.deleteMany()
  await prisma.userAction.deleteMany()
  await prisma.article.deleteMany()
  await prisma.channelCollectionJob.deleteMany()
  await prisma.channelKeyword.deleteMany()
  await prisma.forecasterChannel.deleteMany()
  await prisma.prediction.deleteMany()
  await prisma.priceHistory.deleteMany()
  await prisma.content.deleteMany()
  await prisma.event.deleteMany()
  await prisma.job.deleteMany()
  await prisma.category.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.forecaster.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin User
  console.log('👤 Creating admin user...')
  const adminUser = await prisma.user.create({
    data: {
      id: 'admin_user_001',
      email: 'admin@prism.ai',
      passwordHash: hashPassword('admin123'),
      fullName: 'Admin User',
      role: 'ADMIN',
      bio: 'Platform administrator',
      settings: {
        notifications: { email: true, push: true },
        theme: 'dark',
        timezone: 'UTC'
      },
      subscription: {
        tier: 'ADMIN',
        stripeCustomerId: null,
        expiresAt: null
      }
    }
  })

  // Create Test Users
  console.log('👥 Creating test users...')
  const regularUser = await prisma.user.create({
    data: {
      id: 'user_001',
      email: 'john@example.com',
      passwordHash: hashPassword('user123'),
      fullName: 'John Doe',
      role: 'FREE',
      bio: 'Prediction enthusiast and market watcher',
      settings: {
        notifications: { email: true, push: false },
        theme: 'light',
        timezone: 'America/New_York'
      }
    }
  })

  const premiumUser = await prisma.user.create({
    data: {
      id: 'user_002',
      email: 'jane@example.com',
      passwordHash: hashPassword('user123'),
      fullName: 'Jane Smith',
      role: 'PREMIUM',
      bio: 'Professional trader and analyst',
      settings: {
        notifications: { email: true, push: true },
        theme: 'dark',
        timezone: 'Europe/London'
      },
      subscription: {
        tier: 'PREMIUM',
        stripeCustomerId: 'cus_test123',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  })

  // Create Stock Prediction Forecasters
  console.log('📈 Creating stock forecasters...')
  const stockForecasters = await Promise.all([
    prisma.forecaster.create({
      data: {
        id: 'forecaster_stock_001',
        name: 'Ben Felix',
        slug: 'ben-felix-csi',
        profile: {
          bio: 'Evidence-based investing and portfolio management insights. Ben Felix is a portfolio manager at PWL Capital.',
          avatar: null,
          links: {
            twitter: '@BenFelixCSI',
            website: 'https://www.youtube.com/@BenFelixCSI'
          },
          expertise: ['Portfolio Management', 'ETF Analysis', 'Evidence-Based Investing']
        },
        metrics: {
          accuracy: 0.85,
          totalPredictions: 45,
          correctPredictions: 38,
          brierScore: 0.75
        }
      }
    }),

    prisma.forecaster.create({
      data: {
        id: 'forecaster_stock_002',
        name: 'Everything Money',
        slug: 'everything-money',
        profile: {
          bio: 'Paul and Howard provide weekly market analysis, stock picks, and portfolio reviews.',
          avatar: null,
          links: {
            twitter: '@EverythingMoney',
            website: 'https://www.youtube.com/@EverythingMoney'
          },
          expertise: ['Stock Analysis', 'Market Commentary', 'Portfolio Reviews']
        },
        metrics: {
          accuracy: 0.78,
          totalPredictions: 67,
          correctPredictions: 52,
          brierScore: 0.72
        }
      }
    }),

    prisma.forecaster.create({
      data: {
        id: 'forecaster_stock_003',
        name: 'Joseph Carlson',
        slug: 'joseph-carlson-show',
        profile: {
          bio: 'Weekly stock market analysis, dividend investing, and long-term wealth building strategies.',
          avatar: null,
          links: {
            twitter: '@JosephCarlsonShow',
            website: 'https://www.youtube.com/@JosephCarlsonShow'
          },
          expertise: ['Dividend Investing', 'Value Investing', 'Long-term Strategy']
        },
        metrics: {
          accuracy: 0.82,
          totalPredictions: 34,
          correctPredictions: 28,
          brierScore: 0.68
        }
      }
    }),

    prisma.forecaster.create({
      data: {
        id: 'forecaster_stock_004',
        name: 'Meet Kevin',
        slug: 'meet-kevin',
        profile: {
          bio: 'Real estate and stock market analysis, economic commentary, and investment strategies.',
          avatar: null,
          links: {
            twitter: '@MeetKevin',
            website: 'https://www.youtube.com/@MeetKevin'
          },
          expertise: ['Growth Stocks', 'Real Estate', 'Economic Analysis']
        },
        metrics: {
          accuracy: 0.73,
          totalPredictions: 89,
          correctPredictions: 65,
          brierScore: 0.81
        }
      }
    })
  ])

  // Create Crypto Prediction Forecasters
  console.log('₿ Creating crypto forecasters...')
  const cryptoForecasters = await Promise.all([
    prisma.forecaster.create({
      data: {
        id: 'forecaster_crypto_001',
        name: 'Coin Bureau',
        slug: 'coin-bureau',
        profile: {
          bio: 'Educational cryptocurrency content, market analysis, and project reviews by Guy.',
          avatar: null,
          links: {
            twitter: '@CoinBureau',
            website: 'https://www.youtube.com/@CoinBureau'
          },
          expertise: ['Crypto Education', 'Market Analysis', 'Project Reviews']
        },
        metrics: {
          accuracy: 0.79,
          totalPredictions: 123,
          correctPredictions: 97,
          brierScore: 0.77
        }
      }
    }),

    prisma.forecaster.create({
      data: {
        id: 'forecaster_crypto_002',
        name: 'Benjamin Cowen',
        slug: 'benjamin-cowen',
        profile: {
          bio: 'Data-driven cryptocurrency analysis using logarithmic charts and on-chain metrics. PhD in Nuclear Engineering.',
          avatar: null,
          links: {
            twitter: '@BenjaminCowen',
            website: 'https://www.youtube.com/@BenjaminCowen'
          },
          expertise: ['Technical Analysis', 'On-chain Metrics', 'Market Cycles']
        },
        metrics: {
          accuracy: 0.84,
          totalPredictions: 76,
          correctPredictions: 64,
          brierScore: 0.69
        }
      }
    }),

    prisma.forecaster.create({
      data: {
        id: 'forecaster_crypto_003',
        name: 'InvestAnswers',
        slug: 'invest-answers',
        profile: {
          bio: 'Quantitative cryptocurrency analysis with focus on Bitcoin and altcoin metrics.',
          avatar: null,
          links: {
            twitter: '@InvestAnswers',
            website: 'https://www.youtube.com/@InvestAnswers'
          },
          expertise: ['Quantitative Analysis', 'Bitcoin Metrics', 'Portfolio Strategy']
        },
        metrics: {
          accuracy: 0.81,
          totalPredictions: 54,
          correctPredictions: 44,
          brierScore: 0.71
        }
      }
    }),

    prisma.forecaster.create({
      data: {
        id: 'forecaster_crypto_004',
        name: 'Altcoin Daily',
        slug: 'altcoin-daily',
        profile: {
          bio: 'Daily cryptocurrency news, altcoin analysis, and market updates.',
          avatar: null,
          links: {
            twitter: '@AltcoinDaily',
            website: 'https://www.youtube.com/@AltcoinDaily'
          },
          expertise: ['Altcoin Analysis', 'Market News', 'Project Updates']
        },
        metrics: {
          accuracy: 0.72,
          totalPredictions: 145,
          correctPredictions: 104,
          brierScore: 0.83
        }
      }
    })
  ])

  // Create Assets
  console.log('💰 Creating assets...')
  const assets = await Promise.all([
    // Crypto Assets
    prisma.asset.create({
      data: {
        id: 'asset_btc',
        symbol: 'BTC',
        type: 'CRYPTO',
        metadata: {
          name: 'Bitcoin',
          exchange: 'Multiple',
          sector: 'Cryptocurrency',
          marketCap: 2167000000000
        },
        priceData: {
          price: 109500,
          change24h: -0.068,
          volume24h: 1657402761,
          updatedAt: new Date().toISOString(),
          source: 'binance'
        }
      }
    }),

    prisma.asset.create({
      data: {
        id: 'asset_eth',
        symbol: 'ETH',
        type: 'CRYPTO',
        metadata: {
          name: 'Ethereum',
          exchange: 'Multiple',
          sector: 'Cryptocurrency',
          marketCap: 498000000000
        },
        priceData: {
          price: 4150,
          change24h: 2.45,
          volume24h: 845000000,
          updatedAt: new Date().toISOString(),
          source: 'binance'
        }
      }
    }),

    prisma.asset.create({
      data: {
        id: 'asset_sol',
        symbol: 'SOL',
        type: 'CRYPTO',
        metadata: {
          name: 'Solana',
          exchange: 'Multiple',
          sector: 'Cryptocurrency',
          marketCap: 115000000000
        },
        priceData: {
          price: 245,
          change24h: -1.23,
          volume24h: 456000000,
          updatedAt: new Date().toISOString(),
          source: 'binance'
        }
      }
    }),

    // Stock Assets
    prisma.asset.create({
      data: {
        id: 'asset_aapl',
        symbol: 'AAPL',
        type: 'STOCK',
        metadata: {
          name: 'Apple Inc.',
          exchange: 'NASDAQ',
          sector: 'Technology',
          marketCap: 3900000000000
        },
        priceData: {
          price: 255.46,
          change24h: 0.85,
          volume24h: 45566241,
          updatedAt: new Date().toISOString(),
          source: 'yahoo'
        }
      }
    }),

    prisma.asset.create({
      data: {
        id: 'asset_tsla',
        symbol: 'TSLA',
        type: 'STOCK',
        metadata: {
          name: 'Tesla Inc.',
          exchange: 'NASDAQ',
          sector: 'Automotive',
          marketCap: 1560000000000
        },
        priceData: {
          price: 489.32,
          change24h: 3.21,
          volume24h: 89234567,
          updatedAt: new Date().toISOString(),
          source: 'yahoo'
        }
      }
    }),

    prisma.asset.create({
      data: {
        id: 'asset_nvda',
        symbol: 'NVDA',
        type: 'STOCK',
        metadata: {
          name: 'NVIDIA Corporation',
          exchange: 'NASDAQ',
          sector: 'Technology',
          marketCap: 3590000000000
        },
        priceData: {
          price: 145.89,
          change24h: 1.87,
          volume24h: 167890123,
          updatedAt: new Date().toISOString(),
          source: 'yahoo'
        }
      }
    }),

    // ETF Assets
    prisma.asset.create({
      data: {
        id: 'asset_spy',
        symbol: 'SPY',
        type: 'ETF',
        metadata: {
          name: 'SPDR S&P 500 ETF Trust',
          exchange: 'ARCA',
          sector: 'Broad Market',
          marketCap: 567000000000
        },
        priceData: {
          price: 661.82,
          change24h: 0.45,
          volume24h: 60454177,
          updatedAt: new Date().toISOString(),
          source: 'yahoo'
        }
      }
    }),

    prisma.asset.create({
      data: {
        id: 'asset_qqq',
        symbol: 'QQQ',
        type: 'ETF',
        metadata: {
          name: 'Invesco QQQ Trust',
          exchange: 'NASDAQ',
          sector: 'Technology',
          marketCap: 298000000000
        },
        priceData: {
          price: 534.21,
          change24h: 1.23,
          volume24h: 34567890,
          updatedAt: new Date().toISOString(),
          source: 'yahoo'
        }
      }
    })
  ])

  // Create Sample Predictions
  console.log('🔮 Creating sample predictions...')

  // Bitcoin Predictions
  await prisma.prediction.create({
    data: {
      id: 'pred_btc_001',
      forecasterId: cryptoForecasters[0].id, // Coin Bureau
      assetId: assets[0].id, // BTC
      prediction: 'Bitcoin will reach $150,000 by end of 2025 due to institutional adoption and potential ETF approvals.',
      confidence: 0.85,
      targetPrice: 150000,
      baselinePrice: 109500,
      targetDate: new Date('2025-12-31'),
      direction: 'BULLISH',
      metadata: {
        reasoning: 'Institutional adoption accelerating, ETF momentum building',
        source: 'Technical and fundamental analysis',
        directionCorrection: {
          correctionMade: false,
          originalAiDirection: 'BULLISH',
          mathematicalDirection: 'BULLISH',
          reasoning: 'AI direction aligns with mathematical analysis (target > baseline)',
          priceChangePercent: 37.0
        }
      }
    }
  })

  await prisma.prediction.create({
    data: {
      id: 'pred_btc_002',
      forecasterId: cryptoForecasters[1].id, // Benjamin Cowen
      assetId: assets[0].id, // BTC
      prediction: 'Bitcoin could see a pullback to $85,000 before the next major rally, based on logarithmic regression analysis.',
      confidence: 0.75,
      targetPrice: 85000,
      baselinePrice: 109500,
      targetDate: new Date('2025-06-30'),
      direction: 'BEARISH',
      metadata: {
        reasoning: 'Logarithmic regression suggests correction phase',
        source: 'Technical analysis and on-chain metrics',
        directionCorrection: {
          correctionMade: false,
          originalAiDirection: 'BEARISH',
          mathematicalDirection: 'BEARISH',
          reasoning: 'AI direction aligns with mathematical analysis (target < baseline)',
          priceChangePercent: -22.4
        }
      }
    }
  })

  // Ethereum Predictions
  await prisma.prediction.create({
    data: {
      id: 'pred_eth_001',
      forecasterId: cryptoForecasters[2].id, // InvestAnswers
      assetId: assets[1].id, // ETH
      prediction: 'Ethereum will surge to $8,000 by Q4 2025 driven by staking rewards and layer 2 scaling.',
      confidence: 0.80,
      targetPrice: 8000,
      baselinePrice: 4150,
      targetDate: new Date('2025-10-31'),
      direction: 'BULLISH',
      metadata: {
        reasoning: 'Strong fundamentals with staking and L2 adoption',
        source: 'Quantitative analysis',
        directionCorrection: {
          correctionMade: false,
          originalAiDirection: 'BULLISH',
          mathematicalDirection: 'BULLISH',
          reasoning: 'AI direction aligns with mathematical analysis (target > baseline)',
          priceChangePercent: 92.8
        }
      }
    }
  })

  // Apple Stock Predictions
  await prisma.prediction.create({
    data: {
      id: 'pred_aapl_001',
      forecasterId: stockForecasters[0].id, // Ben Felix
      assetId: assets[3].id, // AAPL
      prediction: 'Apple stock may face headwinds and could decline to $220 due to iPhone sales saturation.',
      confidence: 0.70,
      targetPrice: 220,
      baselinePrice: 255.46,
      targetDate: new Date('2025-08-31'),
      direction: 'BEARISH',
      metadata: {
        reasoning: 'Valuation concerns and market saturation',
        source: 'Fundamental analysis',
        directionCorrection: {
          correctionMade: false,
          originalAiDirection: 'BEARISH',
          mathematicalDirection: 'BEARISH',
          reasoning: 'AI direction aligns with mathematical analysis (target < baseline)',
          priceChangePercent: -13.9
        }
      }
    }
  })

  await prisma.prediction.create({
    data: {
      id: 'pred_aapl_002',
      forecasterId: stockForecasters[3].id, // Meet Kevin
      assetId: assets[3].id, // AAPL
      prediction: 'Apple will break $300 by end of 2025 with AI integration and services growth.',
      confidence: 0.82,
      targetPrice: 300,
      baselinePrice: 255.46,
      targetDate: new Date('2025-12-31'),
      direction: 'BULLISH',
      metadata: {
        reasoning: 'AI integration and expanding services revenue',
        source: 'Growth analysis',
        directionCorrection: {
          correctionMade: false,
          originalAiDirection: 'BULLISH',
          mathematicalDirection: 'BULLISH',
          reasoning: 'AI direction aligns with mathematical analysis (target > baseline)',
          priceChangePercent: 17.4
        }
      }
    }
  })

  // Tesla Predictions
  await prisma.prediction.create({
    data: {
      id: 'pred_tsla_001',
      forecasterId: stockForecasters[1].id, // Everything Money
      assetId: assets[4].id, // TSLA
      prediction: 'Tesla could reach $600 by mid-2025 with robotaxi deployment and energy business growth.',
      confidence: 0.78,
      targetPrice: 600,
      baselinePrice: 489.32,
      targetDate: new Date('2025-07-15'),
      direction: 'BULLISH',
      metadata: {
        reasoning: 'Robotaxi potential and diversified revenue streams',
        source: 'Disruptive technology analysis',
        directionCorrection: {
          correctionMade: false,
          originalAiDirection: 'BULLISH',
          mathematicalDirection: 'BULLISH',
          reasoning: 'AI direction aligns with mathematical analysis (target > baseline)',
          priceChangePercent: 22.6
        }
      }
    }
  })

  // SPY ETF Predictions
  await prisma.prediction.create({
    data: {
      id: 'pred_spy_001',
      forecasterId: stockForecasters[2].id, // Joseph Carlson
      assetId: assets[6].id, // SPY
      prediction: 'S&P 500 ETF will reach $720 by end of 2025 with continued economic growth.',
      confidence: 0.73,
      targetPrice: 720,
      baselinePrice: 661.82,
      targetDate: new Date('2025-12-31'),
      direction: 'BULLISH',
      metadata: {
        reasoning: 'Steady economic growth and corporate earnings',
        source: 'Market analysis',
        directionCorrection: {
          correctionMade: false,
          originalAiDirection: 'BULLISH',
          mathematicalDirection: 'BULLISH',
          reasoning: 'AI direction aligns with mathematical analysis (target > baseline)',
          priceChangePercent: 8.8
        }
      }
    }
  })

  // Create Articles
  console.log('📰 Creating articles...')
  await Promise.all([
    prisma.article.create({
      data: {
        id: 'article_001',
        title: 'The Future of Bitcoin: Institutional Adoption and Price Predictions',
        slug: 'future-of-bitcoin-institutional-adoption',
        excerpt: 'An in-depth analysis of how institutional adoption is driving Bitcoin prices and what experts predict for 2025.',
        content: `
# The Future of Bitcoin: Institutional Adoption and Price Predictions

Bitcoin has entered a new phase of maturity with unprecedented institutional adoption. Major corporations, pension funds, and governments are now allocating portions of their treasuries to Bitcoin, fundamentally changing the cryptocurrency landscape.

## Key Drivers of Institutional Adoption

1. **Inflation Hedge**: Institutions view Bitcoin as a hedge against currency debasement
2. **Portfolio Diversification**: Bitcoin offers uncorrelated returns to traditional assets
3. **Regulatory Clarity**: Clearer regulations have reduced institutional concerns
4. **Infrastructure Maturity**: Custody solutions and trading platforms have evolved

## Price Predictions for 2025

Leading analysts predict Bitcoin could reach anywhere from $85,000 to $150,000 by the end of 2025, depending on:

- ETF approval timeline and adoption
- Macroeconomic conditions
- Regulatory developments
- Technical adoption milestones

## Conclusion

The convergence of institutional demand, regulatory clarity, and technological advancement positions Bitcoin for potential significant price appreciation, though volatility remains a key characteristic.
        `,
        categoryId: null,
        authorId: adminUser.id,
        status: 'PUBLISHED',
        publishDate: new Date(),
        tags: ['Bitcoin', 'Institutional Adoption', 'Price Prediction', 'Cryptocurrency'],
      }
    }),

    prisma.article.create({
      data: {
        id: 'article_002',
        title: 'Stock Market Outlook 2025: Tech Giants and Market Predictions',
        slug: 'stock-market-outlook-2025-tech-giants',
        excerpt: 'A comprehensive analysis of the stock market outlook for 2025, focusing on major tech companies and their growth prospects.',
        content: `
# Stock Market Outlook 2025: Tech Giants and Market Predictions

The stock market continues to be driven by technological innovation and artificial intelligence adoption. Major tech companies are positioned for continued growth, though valuations remain a concern for some analysts.

## Technology Sector Analysis

### Apple (AAPL)
- **Current Price**: $255.46
- **Bull Case**: AI integration, services growth, emerging markets expansion
- **Bear Case**: iPhone sales saturation, valuation concerns
- **Analyst Targets**: $220 - $300

### Tesla (TSLA)
- **Current Price**: $489.32
- **Bull Case**: Robotaxi deployment, energy business, manufacturing scale
- **Bear Case**: Competition, regulatory challenges, execution risk
- **Analyst Targets**: $400 - $600

### NVIDIA (NVDA)
- **Current Price**: $145.89
- **Bull Case**: AI chip demand, data center growth, autonomous vehicles
- **Bear Case**: Competition, cyclical nature, regulatory concerns
- **Analyst Targets**: $120 - $180

## Market Outlook

The S&P 500 is expected to continue its upward trajectory, with most analysts predicting:
- Continued economic growth
- Corporate earnings expansion
- Technological innovation driving productivity

## Investment Strategy

Consider a diversified approach with:
1. Core holdings in broad market ETFs (SPY, QQQ)
2. Selective exposure to high-quality growth stocks
3. Regular rebalancing and dollar-cost averaging
        `,
        categoryId: null,
        authorId: adminUser.id,
        status: 'PUBLISHED',
        publishDate: new Date(),
        tags: ['Stock Market', 'Technology', 'Apple', 'Tesla', 'Investment Strategy'],
      }
    }),

    prisma.article.create({
      data: {
        id: 'article_003',
        title: 'ETF Investing Guide: Building a Diversified Portfolio in 2025',
        slug: 'etf-investing-guide-diversified-portfolio-2025',
        excerpt: 'Learn how to build a diversified investment portfolio using ETFs, with specific recommendations for 2025.',
        content: `
# ETF Investing Guide: Building a Diversified Portfolio in 2025

Exchange-Traded Funds (ETFs) remain one of the most effective ways to build a diversified investment portfolio. This guide covers the essential ETFs for 2025 and how to construct a balanced portfolio.

## Core Portfolio Holdings

### Broad Market ETFs
- **SPY**: S&P 500 exposure, $661.82 current price
- **QQQ**: Technology-heavy NASDAQ 100, $534.21 current price
- **VTI**: Total US stock market exposure
- **VXUS**: International developed markets

### Sector-Specific ETFs
- **XLK**: Technology sector
- **XLF**: Financial sector
- **XLE**: Energy sector
- **XLV**: Healthcare sector

## Portfolio Construction Strategy

### Conservative Allocation (Age 50+)
- 60% Stock ETFs
- 30% Bond ETFs
- 10% Alternatives/REITs

### Moderate Allocation (Age 30-50)
- 70% Stock ETFs
- 20% Bond ETFs
- 10% Alternatives

### Aggressive Allocation (Age 20-30)
- 85% Stock ETFs
- 10% Bond ETFs
- 5% Alternatives

## Rebalancing Strategy

1. **Quarterly Review**: Assess portfolio allocation
2. **Annual Rebalancing**: Restore target allocations
3. **Tax-Loss Harvesting**: Utilize losses for tax efficiency
4. **Dollar-Cost Averaging**: Regular systematic investing

## Key Considerations for 2025

- Rising interest rates impact on bond ETFs
- Artificial intelligence theme exposure
- International diversification importance
- Cost efficiency and expense ratios
        `,
        categoryId: null,
        authorId: premiumUser.id,
        status: 'PUBLISHED',
        publishDate: new Date(),
        tags: ['ETF', 'Portfolio', 'Diversification', 'Investment Strategy', 'Asset Allocation'],
      }
    })
  ])

  // Create Categories
  console.log('🏷️ Creating categories...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        id: 'cat_crypto',
        name: 'Cryptocurrency',
        slug: 'cryptocurrency',
        description: 'Bitcoin, Ethereum, and other digital assets',
        color: '#F7931A',
        icon: '₿',
        sortOrder: 1,
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        id: 'cat_stocks',
        name: 'Stock Market',
        slug: 'stock-market',
        description: 'S&P 500, NASDAQ, and individual stocks',
        color: '#00A86B',
        icon: '📈',
        sortOrder: 2,
        isActive: true
      }
    }),
    prisma.category.create({
      data: {
        id: 'cat_macro',
        name: 'Macro Economy',
        slug: 'macro-economy',
        description: 'GDP, inflation, interest rates, and economic indicators',
        color: '#4B0082',
        icon: '🌍',
        sortOrder: 3,
        isActive: true
      }
    })
  ])

  // Update articles with categories
  await prisma.article.update({
    where: { id: 'article_001' },
    data: { categoryId: categories[0].id }
  })
  await prisma.article.update({
    where: { id: 'article_002' },
    data: { categoryId: categories[1].id }
  })
  await prisma.article.update({
    where: { id: 'article_003' },
    data: { categoryId: categories[2].id }
  })

  // Create Forecaster Channels
  console.log('📡 Creating forecaster channels...')
  const channels = await Promise.all([
    // Coin Bureau YouTube Channel
    prisma.forecasterChannel.create({
      data: {
        id: 'channel_001',
        forecasterId: cryptoForecasters[0].id,
        channelType: 'YOUTUBE',
        channelId: 'UCqK_GSMbpiV8spgD3ZGloSw',
        channelName: 'Coin Bureau',
        channelUrl: 'https://www.youtube.com/@CoinBureau',
        isPrimary: true,
        isActive: true,
        collectionSettings: {
          checkInterval: 3600,
          lastChecked: null,
          enabled: true
        },
        metadata: {
          subscribers: 2400000,
          verified: true,
          description: 'Cryptocurrency education and analysis'
        }
      }
    }),
    // Benjamin Cowen YouTube Channel
    prisma.forecasterChannel.create({
      data: {
        id: 'channel_002',
        forecasterId: cryptoForecasters[1].id,
        channelType: 'YOUTUBE',
        channelId: 'UCRvqjQPSeaWn-uEx-w0XOIg',
        channelName: 'Benjamin Cowen',
        channelUrl: 'https://www.youtube.com/@BenjaminCowen',
        isPrimary: true,
        isActive: true,
        collectionSettings: {
          checkInterval: 3600,
          lastChecked: null,
          enabled: true
        },
        metadata: {
          subscribers: 786000,
          verified: true,
          description: 'Quantitative cryptocurrency analysis'
        }
      }
    }),
    // Meet Kevin YouTube Channel
    prisma.forecasterChannel.create({
      data: {
        id: 'channel_003',
        forecasterId: stockForecasters[3].id,
        channelType: 'YOUTUBE',
        channelId: 'UCUvvj5lwue7PspotMDEsleQ',
        channelName: 'Meet Kevin',
        channelUrl: 'https://www.youtube.com/@MeetKevin',
        isPrimary: true,
        isActive: true,
        collectionSettings: {
          checkInterval: 1800,
          lastChecked: null,
          enabled: true
        },
        metadata: {
          subscribers: 1900000,
          verified: true,
          description: 'Finance, real estate, and stock market analysis'
        }
      }
    })
  ])

  // Add Keywords for Channels
  console.log('🔑 Creating channel keywords...')
  await Promise.all([
    prisma.channelKeyword.create({
      data: {
        channelId: channels[0].id,
        keyword: 'bitcoin',
        isActive: true,
        isDefault: true
      }
    }),
    prisma.channelKeyword.create({
      data: {
        channelId: channels[0].id,
        keyword: 'prediction',
        isActive: true,
        isDefault: false
      }
    }),
    prisma.channelKeyword.create({
      data: {
        channelId: channels[1].id,
        keyword: 'price target',
        isActive: true,
        isDefault: true
      }
    }),
    prisma.channelKeyword.create({
      data: {
        channelId: channels[2].id,
        keyword: 'stock',
        isActive: true,
        isDefault: true
      }
    })
  ])

  console.log('✅ Seeding completed successfully!')
  console.log('📊 Summary:')
  console.log(`   👤 Users: 3 (1 admin, 2 regular)`)
  console.log(`   📈 Stock Forecasters: ${stockForecasters.length}`)
  console.log(`   ₿ Crypto Forecasters: ${cryptoForecasters.length}`)
  console.log(`   💰 Assets: ${assets.length}`)
  console.log(`   🔮 Predictions: 7`)
  console.log(`   📰 Articles: 3`)
  console.log(`   🏷️ Categories: ${categories.length}`)
  console.log(`   📡 Channels: ${channels.length}`)
  console.log(`   🔑 Keywords: 4`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })