import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260415073705 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop index if exists "IDX_post_slug_unique";`);

    this.addSql(`alter table if exists "post" add column if not exists "author_avatar" text null, add column if not exists "category" text null, add column if not exists "seo_title" text null, add column if not exists "seo_description" text null, add column if not exists "read_time_minutes" integer null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "post" drop column if exists "author_avatar", drop column if exists "category", drop column if exists "seo_title", drop column if exists "seo_description", drop column if exists "read_time_minutes";`);

    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_post_slug_unique" ON "post" ("slug") WHERE deleted_at IS NULL;`);
  }

}
