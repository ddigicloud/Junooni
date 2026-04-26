import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260421104413 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor_store" add column if not exists "password_enabled" boolean not null default false, add column if not exists "store_password" text null, add column if not exists "store_logo" text null, add column if not exists "store_favicon" text null, add column if not exists "pages" jsonb null, add column if not exists "collections" jsonb null, add column if not exists "sticky_header" boolean null default true, add column if not exists "sticky_announcement" boolean null default true;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor_store" drop column if exists "password_enabled", drop column if exists "store_password", drop column if exists "store_logo", drop column if exists "store_favicon", drop column if exists "pages", drop column if exists "collections", drop column if exists "sticky_header", drop column if exists "sticky_announcement";`);
  }

}
