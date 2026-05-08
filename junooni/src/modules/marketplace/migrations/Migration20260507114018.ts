import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260507114018 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor_store" drop column if exists "hero_image", drop column if exists "tagline", drop column if exists "announcement_text", drop column if exists "product_detail", drop column if exists "border_radius", drop column if exists "button_style", drop column if exists "product_card", drop column if exists "accent_color", drop column if exists "custom_css", drop column if exists "og_image", drop column if exists "instagram_url", drop column if exists "youtube_url", drop column if exists "twitter_url", drop column if exists "facebook_url", drop column if exists "tiktok_url", drop column if exists "discord_url", drop column if exists "sticky_header", drop column if exists "sticky_announcement";`);

    this.addSql(`alter table if exists "vendor_store" add column if not exists "settings" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor_store" add column if not exists "hero_image" text null, add column if not exists "tagline" text null, add column if not exists "announcement_text" text null, add column if not exists "border_radius" text null, add column if not exists "button_style" text null, add column if not exists "product_card" jsonb null, add column if not exists "accent_color" text null, add column if not exists "custom_css" text null, add column if not exists "og_image" text null, add column if not exists "instagram_url" text null, add column if not exists "youtube_url" text null, add column if not exists "twitter_url" text null, add column if not exists "facebook_url" text null, add column if not exists "tiktok_url" text null, add column if not exists "discord_url" text null, add column if not exists "sticky_header" boolean null default true, add column if not exists "sticky_announcement" boolean null default true;`);
    this.addSql(`alter table if exists "vendor_store" rename column "settings" to "product_detail";`);
  }

}
