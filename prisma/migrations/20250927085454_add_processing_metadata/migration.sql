-- AlterTable
ALTER TABLE "public"."Content" ADD COLUMN     "processingMetadata" JSONB NOT NULL DEFAULT '{}';
