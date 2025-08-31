import { Migration } from '@mikro-orm/migrations';

export class Migration20250825051053 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "size_chart" drop constraint if exists "size_chart_sku_unique";`);
    this.addSql(`alter table if exists "size_chart" add column if not exists "name" text null, add column if not exists "chart" text not null, add column if not exists "sku" text not null, add column if not exists "manufacturer" text null, add column if not exists "manufacturer_sku" text null;`);
    this.addSql(`alter table if exists "size_chart" alter column "chart_url" type text using ("chart_url"::text);`);
    this.addSql(`alter table if exists "size_chart" alter column "chart_url" drop not null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_size_chart_sku_unique" ON "size_chart" (sku) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_size_chart_sku_unique";`);
    this.addSql(`alter table if exists "size_chart" drop column if exists "name", drop column if exists "chart", drop column if exists "sku", drop column if exists "manufacturer", drop column if exists "manufacturer_sku";`);

    this.addSql(`alter table if exists "size_chart" alter column "chart_url" type text using ("chart_url"::text);`);
    this.addSql(`alter table if exists "size_chart" alter column "chart_url" set not null;`);
  }

}
