-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'FREE',
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{"notifications":{"email":true,"push":false},"theme":"light","timezone":"UTC"}',
    "subscription" JSONB NOT NULL DEFAULT '{"tier":"FREE","stripeCustomerId":null,"expiresAt":null}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Forecaster" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "profile" JSONB NOT NULL DEFAULT '{"bio":null,"avatar":null,"links":{"twitter":null,"website":null},"expertise":[]}',
    "metrics" JSONB NOT NULL DEFAULT '{"accuracy":0,"totalPredictions":0,"correctPredictions":0,"brierScore":null}',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forecaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{"name":null,"exchange":null,"sector":null,"marketCap":null}',
    "priceData" JSONB NOT NULL DEFAULT '{"price":null,"change24h":null,"volume24h":null,"updatedAt":null,"source":null}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prediction" (
    "id" TEXT NOT NULL,
    "forecasterId" TEXT NOT NULL,
    "assetId" TEXT,
    "prediction" TEXT NOT NULL,
    "confidence" DECIMAL(5,4),
    "targetDate" TIMESTAMP(3),
    "targetPrice" DECIMAL(20,8),
    "baselinePrice" DECIMAL(20,8),
    "direction" TEXT DEFAULT 'NEUTRAL',
    "metadata" JSONB NOT NULL DEFAULT '{"source":{"type":null,"url":null},"reasoning":null,"tags":[],"extraction":{"model":null,"confidence":null}}',
    "outcome" TEXT NOT NULL DEFAULT 'PENDING',
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Content" (
    "id" TEXT NOT NULL,
    "forecasterId" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "data" JSONB NOT NULL DEFAULT '{"title":null,"text":null,"transcript":null,"publishedAt":null}',
    "status" TEXT NOT NULL DEFAULT 'COLLECTED',
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PriceHistory" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "price" DECIMAL(20,8) NOT NULL,
    "volume" DECIMAL(20,2),
    "source" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "data" JSONB NOT NULL DEFAULT '{}',
    "userId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL DEFAULT '{}',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "scheduledFor" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "publishDate" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ForecasterChannel" (
    "id" TEXT NOT NULL,
    "forecasterId" TEXT NOT NULL,
    "channelType" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelName" TEXT,
    "channelUrl" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "collectionSettings" JSONB NOT NULL DEFAULT '{"checkInterval":3600,"lastChecked":null,"enabled":true}',
    "metadata" JSONB NOT NULL DEFAULT '{"subscribers":null,"verified":null,"description":null}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForecasterChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChannelKeyword" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChannelCollectionJob" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "config" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "videosFound" INTEGER NOT NULL DEFAULT 0,
    "videosProcessed" INTEGER NOT NULL DEFAULT 0,
    "predictionsExtracted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelCollectionJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Forecaster_slug_key" ON "public"."Forecaster"("slug");

-- CreateIndex
CREATE INDEX "Forecaster_slug_idx" ON "public"."Forecaster"("slug");

-- CreateIndex
CREATE INDEX "Asset_symbol_idx" ON "public"."Asset"("symbol");

-- CreateIndex
CREATE INDEX "Asset_type_idx" ON "public"."Asset"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_symbol_type_key" ON "public"."Asset"("symbol", "type");

-- CreateIndex
CREATE INDEX "Prediction_forecasterId_idx" ON "public"."Prediction"("forecasterId");

-- CreateIndex
CREATE INDEX "Prediction_assetId_idx" ON "public"."Prediction"("assetId");

-- CreateIndex
CREATE INDEX "Prediction_outcome_idx" ON "public"."Prediction"("outcome");

-- CreateIndex
CREATE INDEX "Prediction_targetDate_idx" ON "public"."Prediction"("targetDate");

-- CreateIndex
CREATE INDEX "Content_forecasterId_idx" ON "public"."Content"("forecasterId");

-- CreateIndex
CREATE INDEX "Content_status_idx" ON "public"."Content"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Content_sourceType_sourceId_forecasterId_key" ON "public"."Content"("sourceType", "sourceId", "forecasterId");

-- CreateIndex
CREATE INDEX "PriceHistory_assetId_recordedAt_idx" ON "public"."PriceHistory"("assetId", "recordedAt" DESC);

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "public"."Event"("type");

-- CreateIndex
CREATE INDEX "Event_entityType_entityId_idx" ON "public"."Event"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "public"."Event"("userId");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "public"."Event"("createdAt");

-- CreateIndex
CREATE INDEX "Job_status_scheduledFor_idx" ON "public"."Job"("status", "scheduledFor");

-- CreateIndex
CREATE INDEX "Job_type_status_idx" ON "public"."Job"("type", "status");

-- CreateIndex
CREATE INDEX "UserAction_userId_idx" ON "public"."UserAction"("userId");

-- CreateIndex
CREATE INDEX "UserAction_targetType_targetId_idx" ON "public"."UserAction"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAction_userId_actionType_targetType_targetId_key" ON "public"."UserAction"("userId", "actionType", "targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "public"."Article"("slug");

-- CreateIndex
CREATE INDEX "Article_slug_idx" ON "public"."Article"("slug");

-- CreateIndex
CREATE INDEX "Article_status_idx" ON "public"."Article"("status");

-- CreateIndex
CREATE INDEX "Article_authorId_idx" ON "public"."Article"("authorId");

-- CreateIndex
CREATE INDEX "Article_categoryId_idx" ON "public"."Article"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "public"."Category"("slug");

-- CreateIndex
CREATE INDEX "Comment_articleId_idx" ON "public"."Comment"("articleId");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "public"."Comment"("authorId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "public"."Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_status_idx" ON "public"."Comment"("status");

-- CreateIndex
CREATE INDEX "ForecasterChannel_forecasterId_idx" ON "public"."ForecasterChannel"("forecasterId");

-- CreateIndex
CREATE INDEX "ForecasterChannel_channelType_idx" ON "public"."ForecasterChannel"("channelType");

-- CreateIndex
CREATE INDEX "ForecasterChannel_isPrimary_idx" ON "public"."ForecasterChannel"("isPrimary");

-- CreateIndex
CREATE INDEX "ForecasterChannel_isActive_idx" ON "public"."ForecasterChannel"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ForecasterChannel_forecasterId_channelType_channelId_key" ON "public"."ForecasterChannel"("forecasterId", "channelType", "channelId");

-- CreateIndex
CREATE INDEX "ChannelKeyword_channelId_idx" ON "public"."ChannelKeyword"("channelId");

-- CreateIndex
CREATE INDEX "ChannelKeyword_keyword_idx" ON "public"."ChannelKeyword"("keyword");

-- CreateIndex
CREATE INDEX "ChannelKeyword_isDefault_idx" ON "public"."ChannelKeyword"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelKeyword_channelId_keyword_key" ON "public"."ChannelKeyword"("channelId", "keyword");

-- CreateIndex
CREATE INDEX "ChannelCollectionJob_channelId_idx" ON "public"."ChannelCollectionJob"("channelId");

-- CreateIndex
CREATE INDEX "ChannelCollectionJob_status_idx" ON "public"."ChannelCollectionJob"("status");

-- CreateIndex
CREATE INDEX "ChannelCollectionJob_jobType_idx" ON "public"."ChannelCollectionJob"("jobType");

-- CreateIndex
CREATE INDEX "ChannelCollectionJob_createdAt_idx" ON "public"."ChannelCollectionJob"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Prediction" ADD CONSTRAINT "Prediction_forecasterId_fkey" FOREIGN KEY ("forecasterId") REFERENCES "public"."Forecaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prediction" ADD CONSTRAINT "Prediction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Content" ADD CONSTRAINT "Content_forecasterId_fkey" FOREIGN KEY ("forecasterId") REFERENCES "public"."Forecaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PriceHistory" ADD CONSTRAINT "PriceHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAction" ADD CONSTRAINT "UserAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ForecasterChannel" ADD CONSTRAINT "ForecasterChannel_forecasterId_fkey" FOREIGN KEY ("forecasterId") REFERENCES "public"."Forecaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChannelKeyword" ADD CONSTRAINT "ChannelKeyword_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "public"."ForecasterChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChannelCollectionJob" ADD CONSTRAINT "ChannelCollectionJob_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "public"."ForecasterChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
