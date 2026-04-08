import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260318113455 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor_store" drop constraint if exists "vendor_store_vendor_id_unique";`);
    this.addSql(`alter table if exists "vendor_store" drop constraint if exists "vendor_store_subdomain_unique";`);
    this.addSql(`create table if not exists "vendor_store" ("id" text not null, "subdomain" text null, "custom_domain" text null, "domain_verified" boolean not null default false, "template" text check ("template" in ('minimal', 'bold', 'editorial')) not null default 'minimal', "status" text check ("status" in ('draft', 'live', 'paused')) not null default 'draft', "primary_color" text null default '#000000', "secondary_color" text null default '#ffffff', "font" text null default 'inter', "hero_image" text null, "tagline" text null, "announcement_text" text null, "sections" jsonb null, "seo_title" text null, "seo_description" text null, "vendor_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_store_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vendor_store_subdomain_unique" ON "vendor_store" ("subdomain") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vendor_store_vendor_id_unique" ON "vendor_store" ("vendor_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_store_deleted_at" ON "vendor_store" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "vendor_store" add constraint "vendor_store_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vendor_store" cascade;`);
  }

}
