import { Migration } from '@mikro-orm/migrations';

export class Migration20250222164929 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "size_chart" ("id" text not null, "chart_url" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "size_chart_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_size_chart_deleted_at" ON "size_chart" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "size_chart" cascade;`);
  }

}
