import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260402072748 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "blog_category" ("id" text not null, "label" text not null, "value" text not null, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blog_category_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blog_category_deleted_at" ON "blog_category" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "blog_category" cascade;`);
  }

}
